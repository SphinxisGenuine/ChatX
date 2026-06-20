import { Pool } from "pg";
import dotenv from "dotenv";dotenv.config()
export const pool = new Pool({
  connectionString:
    process.env.DB_URL,
});
pool.on("connect", () => {
  console.log("connection with database is succeful");
})
