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
function roomcreation(a:WebSocket):string{
const id = crypto.randomUUID()
rooms.set(id,new Set)
rooms.get(id)?.add(a)
sockets.set(a,id)
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
        
        if (msg.type==="join"&&msg.data){

            if(rooms.has(msg.data)){
                rooms.get(msg.data)?.add(socket)
                sockets.set(socket,msg.data)
                socket.send("Connected to room succesfully")
            }
            
            //  roomactive.map((t)=>{
            //     if (t.roomid=== msg.data){
            //         t.User.push(socket)
                   
            //         socket.send("You succefull joinned the room")
                    
            //     }
            // })
          
             
             

        }

        if (msg.type==="broadcast"&&msg.data){
            if (sockets.has(socket)){
                const roomid=sockets.get(socket)
                //@ts-ignore
                const allembers=rooms.get(roomid)
                    for (const client of allembers!){
                        if (client!==socket){
                            client.send(msg.data)
                    }
                }
                socket.send("Succesfully deliverd")
            }
            else{
                socket.send("Join the room first room")
            }



        }

    })
    
})