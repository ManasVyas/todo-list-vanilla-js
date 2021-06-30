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
  `CREATE TABLE IF NOT EXISTS "user" ( user_id serial PRIMARY KEY, username VARCHAR(30) UNIQUE NOT NULL, password TEXT NOT NULL, salt TEXT NOT NULL, role VARCHAR(20) NOT NULL, profile_picture TEXT NOT NULL, created_on TIMESTAMP, updated_on TIMESTAMP )`,
  (userErr, userRes) => {
    pool.query(
      `CREATE TABLE IF NOT EXISTS task_status ( task_status_id serial PRIMARY KEY, task_status_name VARCHAR(50) UNIQUE NOT NULL, created_on TIMESTAMP, updated_on TIMESTAMP )`,
      (taskStatusErr, taskStatusRes) => {
        pool.query(
          `CREATE TABLE IF NOT EXISTS task ( task_id serial PRIMARY KEY, task_name VARCHAR(50) NOT NULL, created_on TIMESTAMP, updated_on TIMESTAMP, task_status_id INT NOT NULL, user_id INT NOT NULL, FOREIGN KEY (task_status_id) REFERENCES task_status (task_status_id) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE ON UPDATE CASCADE )`
        );
      }
    );
  }
);

module.exports = pool;
