import mysql from "mysql2/promise";

// === CONFIG POOL DENGAN ANTI-CLOSED & RECONNECT ===
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,

  // SSL hanya kalau pakai PUBLIC URL (centerbeam.proxy...)
  ...(process.env.DATABASE_HOST?.includes('proxy.rlwy.net') && {
    ssl: { rejectUnauthorized: false }
  }),

  waitForConnections: true,
  connectionLimit: 10,           // Kurangi dari 20 → hemat resource (penting di free plan)
  maxIdle: 10,
  idleTimeout: 60000,            // 60 detik idle → auto close (biar gak numpuk)
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  // ANTI TIMEOUT & RECONNECT
  connectTimeout: 30000,         // 30 detik timeout connect
  acquireTimeout: 30000,
  timeout: 30000,
  reconnect: true,

  // PENTING: Support IPv6 (Railway private network pakai IPv6)
  family: 0,
});

// === FUNGSI TEST KONEKSI + AUTO RECONNECT ===
async function ensureConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping(); // Cek apakah DB "hidup"
    connection.release();
    return true;
  } catch (err) {
    console.error('DB: Koneksi putus!', err.message);
    console.log('DB: Mencoba reconnect...');
    try {
      await pool.end(); // Tutup pool lama
      // Buat pool baru dengan config sama
      Object.assign(pool, mysql.createPool(pool.config.connectionConfig));
      return true;
    } catch (reconnectErr) {
      console.error('DB: Reconnect gagal!', reconnectErr.message);
      return false;
    } finally {
      if (connection) connection.release();
    }
  }
}

// === JALANKAN PING SETIAP 4 MENIT (anti idle) ===
setInterval(async () => {
  console.log('DB: Ping otomatis...');
  await ensureConnection();
}, 4 * 60 * 1000); // 4 menit sekali

// === GET CONNECTION DENGAN CEK DULU ===
export async function getConnection() {
  const isAlive = await ensureConnection();
  if (!isAlive) {
    throw new Error('Database tidak tersedia setelah reconnect');
  }
  return await pool.getConnection();
}

// Export pool untuk query langsung
export default pool;

// === PING PERTAMA KALI SAAT APP START ===
ensureConnection().then(() => {
  console.log('DB: Koneksi awal berhasil!');
}).catch(() => {
  console.error('DB: Koneksi awal gagal!');
});