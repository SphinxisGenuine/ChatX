import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({port:8080})


wss.on("connection",(socket)=>{


    socket.send("hii")
    socket.on("message",(Raw)=>{
        const msg=Raw.toString()
        socket.send(msg) 

    })
})