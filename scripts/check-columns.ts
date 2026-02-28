import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function run() {
    const res = await db.execute(sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'sessions';
  `);
    console.log(res);
}

run();
