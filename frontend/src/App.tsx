
import { useEffect, useState } from 'react'
import './App.css'

function App() {
const [socket,setSocket]=useState<WebSocket>()
const [input,setinput]=useState("")
  

useEffect(()=>{


const ws = new WebSocket("ws://localhost:8080")
if(!ws){
    return 
  }
  setSocket(ws)
ws.onmessage=(msg)=>{

  alert(msg.data)
}

},[])



  function sendmessage(){
    socket?.send(input)

  }
  return (
    <div className=' bg-neutral-500 flex h-screen justify-center items-center'>
    <div className=' h-96 w-36'>
<input onChange={inputhandler} value={input} className=' border-2 bg-neutral-100 outline-none border-neutral-300'></input>
<button onClick={sendmessage} className='bg-red-700 px-2 border-2 rounded-lg'>Send</button>

    </div>
     </div>
  )


  function inputhandler(e:any){
const msg= e.target.value
setinput(msg)  
}
}

export default App
