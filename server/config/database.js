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
  `CREATE TABLE IF NOT EXISTS "user" ( user_id serial PRIMARY KEY, username VARCHAR(30) UNIQUE NOT NULL, password TEXT NOT NULL, salt TEXT NOT NULL, role VARCHAR(20) NOT NULL, profile_picture TEXT NOT NULL, executed_by INT, created_on TIMESTAMP, updated_on TIMESTAMP )`,
  (userErr, userRes) => {
    pool.query(
      `CREATE TABLE IF NOT EXISTS user_audit ( user_audit_id SERIAL PRIMARY KEY, table_name VARCHAR NOT NULL, operation VARCHAR NOT NULL, user_id INT NOT NULL, performed_by INT NOT NULL, performed_date TIMESTAMP NOT NULL )`,
      (userAuditErr, userAuditRes) => {
        pool.query(
          `CREATE OR REPLACE FUNCTION user_audits() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
        DECLARE 
          operation_type VARCHAR;
          executed_by INT;
          user_id INT;
        BEGIN
          executed_by := NEW.executed_by;
          user_id := NEW.user_id;
          CASE TG_OP
          WHEN 'INSERT' THEN
            operation_type := 'ADD';
          WHEN 'UPDATE' THEN
            operation_type := 'UPDATE';
          END CASE;
          INSERT INTO user_audit (table_name, operation, user_id, performed_by, performed_date) VALUES ('USER', operation_type, user_id, executed_by, NOW());
          RETURN NEW;
        END; $$`,
          (auditFunctionErr, auditFunctionRes) => {
            pool.query(
              `DROP TRIGGER IF EXISTS audit_user ON "user";`,
              (userTriggerErr, userTriggerRes) => {
                pool.query(
                  `CREATE TRIGGER audit_user AFTER INSERT OR UPDATE ON "user" FOR EACH ROW EXECUTE PROCEDURE user_audits();`
                );
              }
            );
          }
        );
      }
    );
    pool.query(
      `CREATE TABLE IF NOT EXISTS task_status ( task_status_id serial PRIMARY KEY, task_status_name VARCHAR(50) UNIQUE NOT NULL, created_on TIMESTAMP, updated_on TIMESTAMP )`,
      (taskStatusErr, taskStatusRes) => {
        pool.query(
          `CREATE TABLE IF NOT EXISTS task ( task_id serial PRIMARY KEY, task_name VARCHAR(50) NOT NULL, created_on TIMESTAMP, updated_on TIMESTAMP, task_status_id INT NOT NULL, user_id INT NOT NULL, FOREIGN KEY (task_status_id) REFERENCES task_status (task_status_id) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (user_id) REFERENCES "user" (user_id) ON DELETE CASCADE ON UPDATE CASCADE )`,
          (taskErr, taskRes) => {
            pool.query(
              `CREATE TABLE IF NOT EXISTS task_audit ( task_audit_id SERIAL PRIMARY KEY, table_name VARCHAR NOT NULL, operation VARCHAR NOT NULL, task_id INT NOT NULL, performed_by INT NOT NULL, performed_date TIMESTAMP NOT NULL )`,
              (taskAuditErr, taskAuditRes) => {
                pool.query(
                  `CREATE OR REPLACE FUNCTION task_audits() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
                DECLARE 
                  operation_type VARCHAR;
                  executed_by INT;
                  task_id INT;
                BEGIN
                  executed_by := NEW.user_id;
                  task_id := NEW.task_id;
                  CASE TG_OP
                  WHEN 'INSERT' THEN
                    operation_type := 'ADD';
                  WHEN 'UPDATE' THEN
                    operation_type := 'UPDATE';
                  END CASE;
                  INSERT INTO task_audit (table_name, operation, task_id, performed_by, performed_date) VALUES ('TASK', operation_type, task_id, executed_by, NOW());
                  RETURN NEW;
                END; $$`,
                  (auditFunctionErr, auditFunctionRes) => {
                    pool.query(
                      `DROP TRIGGER IF EXISTS audit_task ON task;`,
                      (taskTriggerErr, taskTriggerRes) => {
                        pool.query(
                          `CREATE TRIGGER audit_task AFTER INSERT OR UPDATE ON task FOR EACH ROW EXECUTE PROCEDURE task_audits();`
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

module.exports = pool;
