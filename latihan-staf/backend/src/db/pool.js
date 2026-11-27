const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'latihan_staf_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
  console.log('✅ Sambungan ke PostgreSQL berjaya');
});

pool.on('error', (err) => {
  console.error('❌ Ralat sambungan PostgreSQL:', err);
});

module.exports = pool;
