
import z, { email } from "zod"
export const userschema= z.object({
    username:z.string(),
    email:z.email(),
    password:z.string()
})
export type User =z.infer<typeof userschema>  
export const loginschema= z.object({
    email:z.string(),
    password:z.string()
})
export type Login =z.infer<typeof loginschema>  

export type message= {
    room_name:String
    roomid?:number
    content?: string
    type: "create_room" | "send_message" | "join_room" | "leave" 
}