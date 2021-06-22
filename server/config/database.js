const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
  user: process.env.UNAME,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

pool.query(
  "CREATE TABLE IF NOT EXISTS task ( task_id serial PRIMARY KEY, task_name VARCHAR(50) UNIQUE NOT NULL )"
);

module.exports = pool;
