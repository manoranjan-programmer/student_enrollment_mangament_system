const fs = require('fs');
const db = require('./db');

const schema = fs.readFileSync('../database/schema.sql', 'utf8');

(async () => {
  try {
    await db.query(schema);
    console.log('Schema executed successfully');
  } catch (e) {
    console.error('Error executing schema:', e.message);
  } finally {
    process.exit(0);
  }
})();