import { pool } from "../db.js";

export async function CreateRoom(userId: number, name: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const roomResult = await client.query(
      `INSERT INTO rooms(name)
       VALUES ($1)
       RETURNING id`,
      [name]
    );

    const roomId = roomResult.rows[0].id;

    await client.query(
      `INSERT INTO room_members(user_id, room_id)
       VALUES ($1, $2)`,
      [userId, roomId]
    );

    await client.query("COMMIT");

    return roomId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
export async function checkmebership(id:Number,roomid:Number){
const result = await pool.query(`
    SELECT FROM room_members
    WHERE user_id=$1
    AND room_id=$2
    `,[id,roomid])

    return result.rows.length>0
}

export async function joinroom(userid:Number,roomid:Number):Promise<void>{
const result= await pool.query(`
    INSERT into room_members(user_id,room_id)
    VALUES ($1,$2);    

    `,[userid,roomid])   
}
export async function sendmessage(userid:Number,roomid:Number,content:String){
const result= await pool.query(`
    INSERT into messages(user_id,room_id,content)
    VALUES ($1,$2,$3);    
    `,[userid,roomid,content]) 
}
export async function leaveRoom(userId: number,roomId: number): Promise<void> {
  await pool.query(
    `
    DELETE FROM room_members
    WHERE user_id = $1
      AND room_id = $2
    `,
    [userId, roomId]
  );
}
export async function getMessages(
  roomId: number
) {
  const result = await pool.query(
    `
    SELECT
      m.id,
      m.content,
      m.created_at,
      u.username
    FROM messages m
    JOIN users u
      ON m.user_id = u.id
    WHERE m.room_id = $1
    ORDER BY m.created_at DESC
    LIMIT 50
    `,
    [roomId]
  );

  return result.rows;
}