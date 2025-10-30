import mysql from "mysql2/promise";


const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 20, 
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// ✅ Export fungsi untuk ambil koneksi dari pool
export async function getConnection() {
  return await pool.getConnection();
}

// Export pool juga (untuk query langsung jika perlu)
export default pool;