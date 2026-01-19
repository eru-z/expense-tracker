import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "eruditazilbeari",
  host: "localhost",
  database: "expense_tracker",
  port: 5432,
});

pool.on("connect", client => {
  client
    .query("select current_database(), current_user")
    .then(res => {
      console.log("🟢 Connected to DB:", res.rows[0].current_database);
      console.log("👤 Connected as user:", res.rows[0].current_user);
    })
    .catch(err => console.error("❌ DB test failed:", err.message));
});

pool.on("error", err => {
  console.error("❌ Unexpected PG error", err);
  process.exit(1);
});

export default pool;
