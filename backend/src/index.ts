import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({port:8080})

interface msgs{
    data?:string
    type:string
}
type id =string
const rooms:Map<id,Set<WebSocket>> =new Map()
const sockets:Map<WebSocket,id>=new Map()
// todo to make sure client is present in only one room

function leaveCurrentroom(a:WebSocket){
    if(sockets.has(a)){
        const roomid=sockets.get(a)
        Leaveroom(a,roomid!)
    }

}

function roomcreation(a:WebSocket):string{
    leaveCurrentroom(a)
const id = crypto.randomUUID()
rooms.set(id,new Set)
rooms.get(id)?.add(a)
sockets.set(a,id)
return id
}

function Leaveroom(a:WebSocket,room:string){  

    if(sockets.has(a)){
            rooms.get(room!)?.delete(a)
            sockets.delete(a)

    }

    if(rooms.get(room)?.size===0){
        rooms.delete(room)
    }
}

wss.on("connection",(socket)=>{

    socket.on("message",(Raw)=>{
        const msg:msgs=JSON.parse(Raw.toString())
        
        if (msg.type==="create"){
            const id=roomcreation(socket)
            socket.send("Room id "+id)
        }
        
        if (msg.type==="join"&&msg.data){
            if(rooms.has(msg.data)){
                leaveCurrentroom(socket)
                rooms.get(msg.data)?.add(socket)
                sockets.set(socket,msg.data)
                socket.send("Connected to room succesfully")
            }
        }

        if (msg.type==="broadcast"&&msg.data){
            if (sockets.has(socket)){
                const roomid=sockets.get(socket)
                const allembers=rooms.get(roomid!)
                    for (const client of allembers!){
                        if (client!==socket&&(client.readyState===WebSocket.OPEN)){
                            client.send(msg.data)
                    }
                }
                socket.send("Succesfully deliverd")
            }
            else{
                socket.send("Join the room first room")
            }



        }
        if(msg.type==="leave"){
            const room= sockets.get(socket)
            if (room){
                Leaveroom(socket,room)
                socket.send("Left the room")
                socket.close()

            }
            

        }

    })
    socket.on("close",()=>{
        leaveCurrentroom(socket)
    })

    
})
