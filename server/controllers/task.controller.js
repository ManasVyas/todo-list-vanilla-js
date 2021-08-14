const pool = require("../config/database");

const getAllTasks = async (req, res, next) => {
  try {
    const data = await pool.query(
      `SELECT task_id AS "taskId", task_name AS "taskName", task_status_id AS "taskStatusId", created_on AS "createdOn", updated_on AS "updatedOn", user_id AS "userId" FROM task ORDER BY task_id DESC`
    );
    res.status(200).json({ status: "success", data: data.rows });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const data = await pool.query(
      `SELECT task_id AS "taskId", task_name AS "taskName", task_status_id AS "taskStatusId", created_on AS "createdOn", updated_on AS "updatedOn", user_id AS "userId" FROM task WHERE task_id = $1`,
      [req.params.id]
    );
    if (data.rows.length === 0) {
      const error = new Error("Task not found!");
      error.status = 404;
      return next(error);
    }
    res.status(200).json({ status: "success", data: data.rows });
  } catch (error) {
    next(error);
    console.log(error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};

const createTask = async (req, res, next) => {
  try {
    const { taskName, userId } = req.body;
    const currentTime = new Date().toISOString();
    const data = await pool.query(
      `INSERT INTO task (task_name, task_status_id, created_on, updated_on, user_id) VALUES ($1, 1, $2, $2, $3) RETURNING task_id AS "taskId", task_name AS "taskName", task_status_id AS "taskStatusId", created_on AS "createdOn", updated_on AS "updatedOn", user_id AS "userId"`,
      [taskName, currentTime, userId]
    );
    res.status(201).json({ status: "success", data: data.rows });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { taskId, taskName, taskStatusId, userId } = req.body;
    const data = await pool.query(`SELECT * FROM task WHERE task_id = $1`, [
      req.body.taskId,
    ]);
    if (data.rows.length === 0) {
      const error = new Error("Task not found!");
      error.status = 404;
      return next(error);
    }
    const currentTime = new Date().toISOString();
    const task = await pool.query(
      `UPDATE task SET task_name = $1, task_status_id = $2, updated_on = $3, user_id = $4 WHERE task_id = $5 RETURNING task_id AS "taskId", task_name AS "taskName", task_status_id AS "taskStatusId", created_on AS "createdOn", updated_on AS "updatedOn", user_id AS "userId"`,
      [taskName, taskStatusId, currentTime, userId, taskId]
    );
    res.status(200).json({ status: "success", data: task.rows });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { taskId, executedBy } = req.body;
    const data = await pool.query(`SELECT * FROM task WHERE task_id = $1`, [
      taskId,
    ]);
    if (data.rows.length === 0) {
      const error = new Error("Task not found!");
      error.status = 404;
      return next(error);
    }
    const updatedTask = await pool.query(
      `INSERT INTO task_audit (table_name, operation, task_id, performed_by, performed_date) VALUES ('TASK', 'DELETE', $1, $2, NOW())`,
      [taskId, executedBy]
    );
    const task = await pool.query(
      `DELETE FROM task WHERE task_id = $1 RETURNING task_id AS "taskId", task_name AS "taskName", task_status_id AS "taskStatusId", created_on AS "createdOn", updated_on AS "updatedOn", user_id AS "userId"`,
      [taskId]
    );
    res.status(200).json({ status: "success", data: task.rows });
  } catch (error) {
    next(error);
  }
};

const getTaskAudit = async (req, res, next) => {
  try {
    const data = await pool.query(
      `SELECT task_audit_id AS "taskAuditId", table_name AS "tableName", operation, task_id AS "taskId", performed_by AS "performedBy", performed_date AS "performedDate" FROM task_audit ORDER BY task_audit_id DESC`
    );
    res.status(200).json({ status: "success", data: data.rows });
  } catch (error) {
    next(error);
  }
};

const taskController = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskAudit
};

module.exports = taskController;
