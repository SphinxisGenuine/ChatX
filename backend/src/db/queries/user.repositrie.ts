import { pool } from "../db.js"
import type { User } from "../../types/user.types.js";

export async function findbyEmail(email:string){
    const result = await pool.query(`
        SELECT * FROM users
        WHERE email =$1

        `,[email])
  return result.rows[0]??null;
}
export async function findbyUsername(username:string){
    const result = await pool.query(`
        SELECT * FROM users
        WHERE username =$1

        `,[username])
  return result.rows.length > 0;
}
export async function CreateUser(user:User){
    const result = await pool.query(`
        INSERT INTO users(username ,email , password)
        VALUES ($1,$2,$3) RETURNING id,username,email
        `,[user.username,user.email,user.password])
return result.rows[0]
}