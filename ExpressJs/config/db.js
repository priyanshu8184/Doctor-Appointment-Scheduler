import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool = null;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'healpoint_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Test connection
  pool.getConnection()
    .then((conn) => {
      console.log('✅ Connected to MySQL database (healpoint_db)');
      conn.release();
    })
    .catch((err) => {
      console.warn('⚠️ MySQL connection failed. Running in resilient mock-fallback mode:', err.message);
      pool = null;
    });
} catch (e) {
  console.warn('⚠️ MySQL pool initialization error:', e.message);
  pool = null;
}

export default pool;
