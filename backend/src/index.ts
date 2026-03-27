import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({port:8080})

interface msgs{
    data?:string
    type:string
}

interface room {
    roomid:string,
    User:WebSocket[]
}

const roomactive:room[]= [] 


function roomcreation(a:WebSocket):string{
const id = crypto.randomUUID()

const room:room={
    roomid:id,
    User:[a]
}
roomactive.push(room)
return id
}

wss.on("connection",(socket)=>{


    socket.on("message",(Raw)=>{
        const msg:msgs=JSON.parse(Raw.toString())
        //@ts-ignore
        if (msg.type==="create"){
            const id=roomcreation(socket)
            socket.send("Room id "+id)
        }    
        // wss.clients.forEach((client)=>{
        // if(client!==socket){
        //     client.send(msg) 
        // }
        // })

    })
    
})