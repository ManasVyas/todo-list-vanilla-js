const express = require("express");
const app = express();
const cors = require("cors");
const passport = require("passport");
const taskRouter = require("./routes/task.route");
const taskStatusRouter = require("./routes/task.status.route");
const authRouter = require("./routes/auth.route");
const userRouter = require("./routes/user.route");
const errorHandler = require("./utils/errorHandler");
require("dotenv").config();

const port = process.env.SERVER_PORT || 5000;

require("./config/passport");
app.use(passport.initialize());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/task", taskRouter);
app.use("/taskStatus", taskStatusRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);

app.use((req, res, next) => {
  const error = new Error("Route doesn't exists!");
  error.status = 404;
  next(error);
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
