const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

if (process.env.DATABASE_URL) {
  console.log('Connecting via DATABASE_URL');
} else {
  console.log(`Connecting to ${process.env.DB_NAME || 'postgres'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
}

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool({
  ...poolConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('CRITICAL: Database connection refused. Please ensure PostgreSQL service is running.');
  }
});

pool.on('connect', () => {
  console.log('Database pool connected');
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection verified');
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection test failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('Check if PostgreSQL service is started (e.g., postgresql-x64-18)');
    }
    return false;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection
};
