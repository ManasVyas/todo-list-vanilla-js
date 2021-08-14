const pool = require("../config/database");
const multer = require("multer");
const upload = require("../utils/fileUpload");
const {
  updateUserSchema,
  validateUser,
} = require("../validation/auth.validation");
const passportUtils = require("../utils/passportUtils");

const getAllUsers = async (req, res, next) => {
  try {
    const data = await pool.query(
      `SELECT DISTINCT ON (u.user_id) u.user_id AS "userId", u.username AS "username", u.role AS "role" , u.profile_picture AS "profilePicture", u.created_on AS "createdOn", u.updated_on AS "updatedOn", CASE WHEN (SELECT array_to_json(array_agg(task_alias)) FROM (SELECT * FROM task) task_alias WHERE task_alias.user_id = u.user_id) IS NULL THEN '[]' ELSE (SELECT array_to_json(array_agg(task_alias)) FROM (SELECT task_id AS "taskId", task_name AS "taskName", task_status_id AS "taskStatusId", created_on AS "createdOn", updated_on AS "updatedOn", user_id FROM task) task_alias WHERE task_alias.user_id = u.user_id) END AS "tasks" FROM "user" AS "u" LEFT JOIN task AS "t" ON u.user_id = t.user_id ORDER BY u.user_id DESC`
    );
    res.status(200).json({ status: "success", data: data.rows });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const data = await pool.query(
      `SELECT DISTINCT ON (u.user_id) u.user_id AS "userId", u.username AS "username", u.role AS "role" , u.profile_picture AS "profilePicture", u.created_on AS "createdOn", u.updated_on AS "updatedOn", CASE WHEN (SELECT array_to_json(array_agg(task_alias)) FROM (SELECT * FROM task) task_alias WHERE task_alias.user_id = u.user_id) IS NULL THEN '[]' ELSE (SELECT array_to_json(array_agg(task_alias)) FROM (SELECT task_id AS "taskId", task_name AS "taskName", task_status_id AS "taskStatusId", created_on AS "createdOn", updated_on AS "updatedOn", user_id FROM task) task_alias WHERE task_alias.user_id = u.user_id) END AS "tasks" FROM "user" AS "u" LEFT JOIN task AS "t" ON u.user_id = t.user_id WHERE u.user_id = $1 ORDER BY u.user_id DESC`,
      [req.params.id]
    );
    if (data.rows.length === 0) {
      const error = new Error("User doesn't found!");
      error.status = 404;
      return next(error);
    }
    res.status(200).json({ status: "success", data: data.rows });
  } catch (error) {
    const err = new Error(error.message);
    if (err.message.includes("invalid input syntax for type integer:")) {
      err.status = 400;
    }
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      const error = new Error();
      error.status = 400;
      if (err.message === "File too large") {
        error.message = "Maximum allowed file size is 10MB";
        return next(error);
      }
      error.message = err.message;
      return next(error);
    } else if (err) {
      return next(err);
    }
    try {
      const error = new Error();
      error.status = 400;
      if (req.file === undefined) {
        error.message = "Profile picture is required!";
        return next(error);
      }
      const validatedBody = await validateUser(updateUserSchema, req.body);
      if (validatedBody.status === "error") {
        error.message = validatedBody.message;
        return next(error);
      }
      const data = await pool.query(`SELECT * FROM "user" WHERE user_id = $1`, [
        validatedBody.userId,
      ]);
      if (data.rows.length === 0) {
        error.message = "User not found!";
        error.status = 404;
        return next(error);
      }
      const user = await pool.query(
        `SELECT * FROM "user" WHERE username = $1`,
        [validatedBody.username]
      );
      if (
        user.rows.length > 0 &&
        user.rows[0].user_id !== validatedBody.userId
      ) {
        error.message = "Username is already taken!";
        error.status = 409;
        return next(error);
      }
      const isValid = passportUtils.validatePassword(
        validatedBody.password,
        data.rows[0].password,
        data.rows[0].salt
      );
      let pw = "",
        passwordSalt = "";
      if (!isValid) {
        const saltHash = passportUtils.genPassword(validatedBody.password);
        pw = saltHash.hash;
        passwordSalt = saltHash.salt;
      } else {
        pw = user.rows[0].password;
        passwordSalt = user.rows[0].salt;
      }
      const currentTime = new Date().toISOString();
      const updatedUser = await pool.query(
        `WITH updated AS (
          UPDATE "user" SET username = $1, password = $2, salt = $3, role = $4, profile_picture = $5, updated_on = $6, executed_by = $7 WHERE user_id = $8 RETURNING *
        )
        SELECT DISTINCT ON (u.user_id) u.user_id AS "userId", u.username AS "username", u.role AS "role" , u.profile_picture AS "profilePicture", u.created_on AS "createdOn", u.updated_on AS "updatedOn", CASE WHEN (SELECT array_to_json(array_agg(task_alias)) FROM (SELECT * FROM task) task_alias WHERE task_alias.user_id = u.user_id) IS NULL THEN '[]' ELSE (SELECT array_to_json(array_agg(task_alias)) FROM (SELECT task_id AS "taskId", task_name AS "taskName", task_status_id AS "taskStatusId", created_on AS "createdOn", updated_on AS "updatedOn", user_id FROM task) task_alias WHERE task_alias.user_id = u.user_id) END AS "tasks" FROM updated AS "u" LEFT JOIN task AS "t" ON u.user_id = t.user_id WHERE u.user_id = $8 ORDER BY u.user_id DESC`,
        [
          validatedBody.username,
          pw,
          passwordSalt,
          validatedBody.role,
          req.file.path,
          currentTime,
          validatedBody.executedBy,
          validatedBody.userId,
        ]
      );
      res.status(200).json({ status: "success", data: updatedUser.rows });
    } catch (error) {
      next(error);
    }
  });
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId, executedById } = req.body;
    const data = await pool.query(`SELECT * FROM "user" WHERE user_id = $1`, [
      userId,
    ]);
    if (data.rows.length === 0) {
      const error = new Error("User not found!");
      error.status = 404;
      return next(error);
    }
    
    await pool.query(`INSERT INTO user_audit (table_name, operation, user_id, performed_by, performed_date) VALUES ('USER', 'DELETE', $1, $2, NOW())`, [userId ,executedById])

    const user = await pool.query(
      `WITH deleted AS (
        DELETE FROM "user" WHERE user_id = $1 RETURNING *
      )
      SELECT DISTINCT ON (u.user_id) u.user_id AS "userId", u.username AS "username", u.role AS "role" , u.profile_picture AS "profilePicture", u.created_on AS "createdOn", u.updated_on AS "updatedOn", CASE WHEN (SELECT array_to_json(array_agg(task_alias)) FROM (SELECT * FROM task) task_alias WHERE task_alias.user_id = u.user_id) IS NULL THEN '[]' ELSE (SELECT array_to_json(array_agg(task_alias)) FROM (SELECT task_id AS "taskId", task_name AS "taskName", task_status_id AS "taskStatusId", created_on AS "createdOn", updated_on AS "updatedOn", user_id FROM task) task_alias WHERE task_alias.user_id = u.user_id) END AS "tasks" FROM deleted AS "u" LEFT JOIN task AS "t" ON u.user_id = t.user_id WHERE u.user_id = $1 ORDER BY u.user_id DESC`,
      [userId]
    );
    res.status(200).json({ status: "success", data: user.rows });
  } catch (error) {
    const err = new Error(error.message);
    if (err.message.includes("invalid input syntax for type integer:")) {
      err.status = 400;
    }
    next(err);
  }
};

const getUserAudit = async (req, res, next) => {
  try {
    const data = await pool.query(`SELECT user_audit_id AS "userAuditId", table_name AS "tableName", operation, user_id AS "userId", performed_by AS "performedBy", performed_date AS "performedDate" FROM user_audit ORDER BY user_audit_id DESC`)
    res.status(200).json({ status: "success", data: data.rows });
  } catch (error) {
    next(error)
  }
}

const userController = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserAudit
};

module.exports = userController;
