const express = require("express");
const app = express();
const pool = require("./config/database");
require("dotenv").config();

const port = process.env.SERVER_PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res, next) => {
  const tasks = await pool.query("SELECT * FROM task");
  res.status(200).json({ data: tasks.rows });
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
