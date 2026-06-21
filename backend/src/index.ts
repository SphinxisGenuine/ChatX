import express from "express"
import bcrypt from "bcrypt";
import dotenv from "dotenv"
import http from "http"
import { loginschema, userschema, type User } from "./db/types/user.types.js"
import { CreateUser, findbyEmail, findbyUsername } from "./db/queries/user.repositrie.js";
import jwt  from "jsonwebtoken";
import { WebSocketServer } from "ws";
dotenv.config()


 const app = express()
 const server = http.createServer(app)
 const wss=new WebSocketServer({
    noServer:true
 })
app.use(express.json())
app.post('/register',async (req,res)=>{
    console.log(req.body)
    const result=userschema.safeParse(req.body);

    if (!result.success){
        return res.status(400).json({msg:"Invalid Input",error:result.error.flatten()})
    }
    const exist=await findbyEmail(result.data.email)
    if (!exist){
        return res.status(409).json({msg:"User with Same Email Exist",statuscode:409})
    }
    const hashedpassword=await bcrypt.hash(result.data.password,10);
    const row:User={username:result.data.username,password:hashedpassword,email:result.data.email}
    try {
        const createduser= CreateUser(row);
        return res.status(201).json({msg:"User has been registered",data:createduser,statuscode:201})
    }
    catch{
        return res.status(400).json({msg:"Unable to register user",statuscode:400})
    }
    })
app.post('/login',async (req,res)=>{
const result = loginschema.safeParse(req.body)
 if (!result.success){
        return res.status(400).json({msg:"Invalid Input",error:result.error.flatten()})
    }
    const user=await findbyEmail(result.data.email)
    if (!user){
        return res.status(409).json({msg:"User with these username dosent Exist",statuscode:409})
    }
    const hashedpassword=await bcrypt.compare(result.data.password,user.password)
    if (!hashedpassword){
        return res.status(400).json({msg:"Wrong password",statuscode:400})
    }
    const payload= {
        id:user.id
    }
    const token=jwt.sign(payload,process.env.SECRET!) 
    return res.status(201).cookie('accestoken',token,{httpOnly:true}).json({msg:"Login Success",accestoken:token,statuscode:200})


})


server.on("upgrade",(req:any,socket,head)=>{
      try {
        const url = new URL(req.url, "http://localhost")
        if (url.pathname !== "/ws") {
      socket.destroy();
      return;
    }
    const token =url.searchParams.get("token")
    if (!token||token===""){ socket.write("HTTP/1.1 401 Unauthorized\n");socket.destroy(); return;}
    const payload = jwt.verify(token,process.env.SECRET!)
    req.user=payload;
    
     wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
      }
      catch {
        socket.write("HTTP/1.1 401 Unauthorized\n");
        socket.destroy();
      }
})
wss.on("connection",(ws,req:any)=>{
      ws.send("authenticated");
    console.log("connection has been upgraded to ws"); 
})



server.listen(3000,()=>{
    console.log("app is listining on port 3000")
})