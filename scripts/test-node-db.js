const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error("No DATABASE_URL found");
    process.exit(1);
}

console.log("Connecting with Node to:", dbUrl.split('@')[1], "WITHOUT SSL");
const sql = postgres(dbUrl, { prepare: false, connect_timeout: 5, ssl: false });


sql`SELECT 1 as connected`.then(res => {
    console.log("SUCCESS Node:", res);
}).catch(err => {
    console.error("FAILED Node:", err.message);
}).finally(() => {
    sql.end();
});
