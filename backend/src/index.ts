import express from "express"
import bcrypt from "bcrypt";
import dotenv from "dotenv"
import http from "http"
import { loginschema, userschema, type message, type User } from "./types/user.types.js"
import { CreateUser, findbyEmail, findbyUsername } from "./db/queries/user.repositrie.js";
import jwt from "jsonwebtoken";
import { WebSocketServer, WebSocket } from "ws";
import { checkmebership, CreateRoom, joinroom, leaveRoom, sendmessage } from "./db/queries/room.repositry.js";
import { publisher, subscriber } from "./redis/redis.js";


if (!process.env.DATABASE_URL) {
  dotenv.config();
}



const app = express()
const PORT = process.env.PORT || 3000;
const server = http.createServer(app)
const wss = new WebSocketServer({
  noServer: true
})
app.use(express.json())
type id = number;
const room: Map<id, Set<WebSocket>> = new Map();
const socket: Map<WebSocket, Set<id>> = new Map();
app.post('/register', async (req, res) => {
  console.log(req.body)
  const result = userschema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ msg: "Invalid Input", error: result.error.flatten() })
  }
  const exist = await findbyEmail(result.data.email)
  if (exist) {
    return res.status(409).json({ msg: "User with Same Email Exist", statuscode: 409 })
  }
  const hashedpassword = await bcrypt.hash(result.data.password, 10);
  const row: User = { username: result.data.username, password: hashedpassword, email: result.data.email }
  try {
    const createduser = await CreateUser(row);
    return res.status(201).json({ msg: "User has been registered", data: createduser, statuscode: 201 })
  }
  catch {
    return res.status(400).json({ msg: "Unable to register user", statuscode: 400 })
  }
})
app.post('/login', async (req, res) => {
  const result = loginschema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ msg: "Invalid Input", error: result.error.flatten() })
  }
  const user = await findbyEmail(result.data.email)
  if (!user) {
    return res.status(409).json({ msg: "User with these username dosent Exist", statuscode: 409 })
  }
  const hashedpassword = await bcrypt.compare(result.data.password, user.password)
  if (!hashedpassword) {
    return res.status(400).json({ msg: "Wrong password", statuscode: 400 })
  }
  const payload = {
    id: user.id
  }
  const token = jwt.sign(payload, process.env.SECRET!)
  return res.status(201).cookie('accestoken', token, { httpOnly: true }).json({ msg: "Login Success", accestoken: token, statuscode: 200 })


})


server.on("upgrade", (req: any, socket, head) => {
  try {
    const url = new URL(req.url, "http://localhost")
    if (url.pathname !== "/ws") {
      socket.destroy();
      return;
    }
    const token = url.searchParams.get("token")
    if (!token || token === "") { socket.write("HTTP/1.1 401 Unauthorized\n"); socket.destroy(); return; }
    const payload = jwt.verify(token, process.env.SECRET!)
    req.user = payload;

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  }
  catch {
    socket.write("HTTP/1.1 401 Unauthorized\n");
    socket.destroy();
  }
})
wss.on("connection", (ws, req: any) => {
  ws.send("authenticated");
  console.log("connection has been upgraded to ws");
  socket.set(ws, new Set)
  ws.on("message", async (Raw) => {
    let msg: message;
    try {
      msg = JSON.parse(Raw.toString())
    }
    catch (e) {
      return
    }
    if (msg.type === "create_room") {
      const roomid = await CreateRoom(req.user.id, msg.room_name)

      if (!room.has(roomid)) {
        room.set(roomid, new Set<WebSocket>());
      }

      room.get(roomid)?.add(ws);
      socket.get(ws)?.add(roomid)
      ws.send("Room has been created id is  " + roomid)
    }

    if (msg.type === "join_room" && msg.roomid) {
      const roomid = Number(msg.roomid)
      const exists = await checkmebership(req.user.id, roomid)
      if (!exists) {
        const result = await joinroom(req.user.id, roomid);
      }

      if (!room.has(roomid)) {
        room.set(roomid, new Set<WebSocket>());
      }

      room.get(roomid)?.add(ws);
      socket.get(ws)?.add(roomid)
      ws.send("Succefully joined the Group ");
    }
    if (msg.type === "send_message" && msg.roomid && msg.content) {
      const roomid = Number(msg.roomid)
      const exists = await checkmebership(req.user.id, roomid)
      if (!exists) {
        ws.send("Not Member of the Group ");
        return
      }
      const result = await sendmessage(req.user.id, roomid, msg.content);
      await publisher.publish("chat-events", JSON.stringify({ roomid: roomid, userId: req.user.id, content: msg.content, })
      );
    }


  })
  ws.on("close", async () => {
    const roomids = socket.get(ws)
    if (roomids) {
      for (const roomid of roomids) {
        const clients = room.get(roomid)
        clients?.delete(ws)
        if (clients?.size === 0) {
          room.delete(roomid)
        }
      }
    }
    socket.delete(ws)
  })





})
await subscriber.subscribe("chat-events");

subscriber.on("message", (channel, message) => {
  if (channel !== "chat-events") {
    return;
  }

  const data = JSON.parse(message);

  console.log("received from redis", data);

  room.get(data.roomid)?.forEach((ws) => {
    ws.send(JSON.stringify(data));
  });
});
server.listen(PORT, () => {
  console.log("app is listining on port " + PORT)
})