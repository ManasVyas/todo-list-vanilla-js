const pool = require("../config/database");
const passportUtils = require("../utils/passportUtils");
const multer = require("multer");
const upload = require("../utils/fileUpload");
const {
  registerUserSchema,
  loginUserSchema,
  validateUser,
} = require("../validation/auth.validation");

const registerUser = (req, res, next) => {
  const error = new Error();
  error.status = 400;
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.message === "File too large") {
        error.message = "Maximum allowed file size is 10MB";
        return next(error);
      }
      error.message = err.message;
      return next(error);
    } else if (err) {
      error.message = err.message;
      return next(error);
    }
    try {
      if (req.file === undefined) {
        error.message = "Profile picture is required!";
        error.status = 400;
        return next(error);
      }
      const validatedBody = await validateUser(registerUserSchema, req.body);
      if (validatedBody.status === "error") {
        error.message = validatedBody.message;
        error.status = 400;
        return next(error);
      }
      // const { validatedBody } = res.locals;
      const data = await pool.query(
        `SELECT user_id AS "userId", username, password, salt, role, profile_picture AS "profilePicture", created_on AS "createdOn", updated_on AS "updatedOn" FROM "user" WHERE username = $1`,
        [validatedBody.username]
      );
      if (data.rows.length > 0) {
        error.message = "User already exists!";
        error.status = 409;
        return next(error);
      }
      const saltHash = passportUtils.genPassword(validatedBody.password);
      const salt = saltHash.salt;
      const hash = saltHash.hash;
      const currentTime = new Date().toISOString();
      const maxUserId = await pool.query(`SELECT MAX(user_id) FROM "user"`);
      const user = await pool.query(
        `INSERT INTO "user" (username, password, salt, role, profile_picture, executed_by, created_on, updated_on) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING user_id AS "userId", username, password, salt, role, profile_picture AS "profilePicture", created_on AS "createdOn", updated_on AS "updatedOn"`,
        [
          validatedBody.username,
          hash,
          salt,
          validatedBody.role,
          req.file.path,
          maxUserId.rows[0].max + 1,
          currentTime,
          currentTime,
        ]
      );
      if (user.rows.length > 0) {
        const jwt = passportUtils.issueJWT(user.rows[0]);
        delete user.rows[0].password;
        delete user.rows[0].salt;
        res.json({
          status: "success",
          data: user.rows,
          token: jwt.token,
          expiresIn: jwt.expiresIn,
        });
      } else {
        error.message = "Something went wrong";
        error.status = 500;
        return next(error);
      }
    } catch (err) {
      error.message = err.message;
      error.status = 500;
      next(error);
    }
  });
};

const logInUser = async (req, res, next) => {
  try {
    const error = new Error();
    error.status = 400;
    const validatedBody = await validateUser(loginUserSchema, req.body);
    if (validatedBody.status === "error") {
      error.message = validatedBody.message;
      return next(error);
    }
    const data = await pool.query(
      `SELECT user_id AS "userId", username, password, salt, role, profile_picture AS "profilePicture", created_on AS "createdOn", updated_on AS "updatedOn" FROM "user" WHERE username = $1`,
      [validatedBody.username]
    );
    if (data.rows.length === 0) {
      error.message = "Invalid username or password";
      error.status = 404;
      return next(error);
    }
    const isValid = passportUtils.validatePassword(
      validatedBody.password,
      data.rows[0].password,
      data.rows[0].salt
    );
    if (isValid) {
      const tokenObj = passportUtils.issueJWT(data.rows[0]);
      delete data.rows[0].password;
      delete data.rows[0].salt;
      res.status(200).json({
        status: "success",
        data: data.rows,
        token: tokenObj.token,
        expiresIn: tokenObj.expiresIn,
      });
    } else {
      error.message = "Invalid username or password";
      error.status = 401;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

const protectedRoute = (req, res, next) => {
  try {
    res.status(200).json({ status: "success", message: "Authenticated!" });
  } catch (error) {
    next(error);
    // console.log(error.message);
    // res.status(500).json({ status: "error", message: error.message });
  }
};

const authController = {
  registerUser,
  logInUser,
  protectedRoute,
};

module.exports = authController;
