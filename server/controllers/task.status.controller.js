const pool = require("../config/database");

const getAllTaskStatuses = async (req, res, next) => {
  try {
    const data = await pool.query(
      `SELECT task_status_id AS "taskStatusId", task_status_name AS "taskStatusName", created_on AS "createdOn", updated_on AS "updateOn" FROM task_status ORDER BY task_status_id DESC`
    );
    res.status(200).json({ status: "success", data: data.rows });
  } catch (error) {
    next(error);
  }
};

const getTaskStatusById = async (req, res, next) => {
  try {
    const data = await pool.query(
      `SELECT task_status_id AS "taskStatusId", task_status_name AS "taskStatusName", created_on AS "createdOn", updated_on AS "updateOn" FROM task_status WHERE task_status_id = $1`,
      [req.params.id]
    );
    if (data.rows.length === 0) {
      const error = new Error("Task status doesn't found!");
      error.status = 404;
      return next(error);
    }
    res.status(200).json({ status: "success", data: data.rows });
  } catch (error) {
    next(error);
  }
};

const createTaskStatus = async (req, res, next) => {
  try {
    const { taskStatusName } = req.body;
    const task = await pool.query(
      "SELECT * FROM task_status WHERE task_status_name = $1",
      [taskStatusName]
    );
    if (task.rows.length > 0) {
      const error = new Error("Task status already exists!");
      error.status = 409;
      return next(error);
    }
    const currentTime = new Date().toISOString();
    const data = await pool.query(
      `INSERT INTO task_status (task_status_name, created_on, updated_on) VALUES ($1, $2, $3) RETURNING task_status_id AS "taskStatusId", task_status_name AS "taskStatusName", created_on AS "createdOn", updated_on AS "updateOn"`,
      [taskStatusName, currentTime, currentTime]
    );
    res.status(201).json({ status: "success", data: data.rows });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskStatusId, taskStatusName, createdOn } = req.body;
    const task = await pool.query(
      "SELECT * FROM task_status WHERE task_status_id = $1",
      [taskStatusId]
    );
    if (task.rows.length === 0) {
      const error = new Error("Task status doesn't exists!");
      error.status = 404;
      return next(error);
    }
    const currentTime = new Date().toISOString();
    const data = await pool.query(
      `UPDATE task_status SET task_status_name = $1, created_on = $2, updated_on = $3 WHERE task_status_id = $4 RETURNING task_status_id AS "taskStatusId", task_status_name AS "taskStatusName", created_on AS "createdOn", updated_on AS "updateOn"`,
      [taskStatusName, createdOn, currentTime, taskStatusId]
    );
    res.status(200).json({ status: "success", data: data.rows });
  } catch (error) {
    next(error);
  }
};

const deleteTaskStatus = async (req, res, next) => {
  try {
    const task = await pool.query(
      "SELECT * FROM task_status WHERE task_status_id = $1",
      [req.params.id]
    );
    if (task.rows.length === 0) {
      const error = new Error("Task status doesn't exists!");
      error.status = 404;
      return next(error);
    }
    const data = await pool.query(
      `DELETE FROM task_status WHERE task_status_id = $1 RETURNING task_status_id AS "taskStatusId", task_status_name AS "taskStatusName", created_on AS "createdOn", updated_on AS "updateOn"`,
      [req.params.id]
    );
    res.status(200).json({ status: "success", data: data.rows });
  } catch (error) {
    next(error);
  }
};

const taskStatusController = {
  getAllTaskStatuses,
  getTaskStatusById,
  createTaskStatus,
  updateTaskStatus,
  deleteTaskStatus,
};

module.exports = taskStatusController;
