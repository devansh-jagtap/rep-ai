const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });
const sql = postgres(process.env.DATABASE_URL, { prepare: false, connect_timeout: 5 });
sql`SELECT 1 as connected`.then(console.log).catch(console.error).finally(() => sql.end());
