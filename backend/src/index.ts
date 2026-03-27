import { WebSocketServer } from "ws";

const wss = new WebSocketServer({port:8080})


wss.on("connection",(socket)=>{


    socket.on("message",(Raw)=>{
        const msg=Raw.toString() 
        wss.clients.forEach((client)=>{
        if(client!==socket){
            client.send(msg) 
        }

        })

    })
    
})