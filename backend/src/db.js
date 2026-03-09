const dotenv = require('dotenv')
dotenv.config()

// Create a promise that resolves to a mysql2/promise pool using dynamic import.
const poolPromise = (async () => {
  try {
    const mysql = await import('mysql2/promise')
    const createPool = mysql.createPool || (mysql.default && mysql.default.createPool)
    if (typeof createPool !== 'function') {
      throw new Error('Could not find createPool in mysql2/promise')
    }
    const pool = createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ai_insurance',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })

    // Ensure table exists
    const createUsers = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) DEFAULT NULL,
        phone VARCHAR(32) NOT NULL,
        password VARCHAR(255) NOT NULL,
        platform VARCHAR(80) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_email (email),
        UNIQUE KEY uq_phone (phone)
      ) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
    `
    try {
      await pool.query(createUsers)
      console.log('DB: ensured `users` table exists')
    } catch (err) {
      console.error('DB init error:', err && err.message ? err.message : err)
    }

    return pool
  } catch (err) {
    console.error('DB pool init failed:', err && err.message ? err.message : err)
    throw err
  }
})()

// Export a small wrapper compatible with existing calls `const pool = require('../db')`.
// The wrapper exposes `query()` which proxies to the real pool when ready.
module.exports = {
  query: async (...args) => {
    const pool = await poolPromise
    return pool.query(...args)
  },
  getPool: async () => await poolPromise
}
