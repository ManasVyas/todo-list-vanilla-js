const passport = require("passport");
require("../config/passport")(passport);
const router = require("express").Router();
const taskController = require("../controllers/task.controller");
const {
  addTaskSchema,
  updateTaskSchema,
  validateTask,
} = require("../validation/task.validation");

router.get("/", taskController.getAllTasks);
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  taskController.getTaskById
);
router.post(
  "/add",
  passport.authenticate("jwt", { session: false }),
  validateTask(addTaskSchema, "add"),
  taskController.createTask
);
router.put(
  "/update",
  passport.authenticate("jwt", { session: false }),
  validateTask(updateTaskSchema, "update"),
  taskController.updateTask
);
router.delete(
  "/delete",
  passport.authenticate("jwt", { session: false }),
  taskController.deleteTask
);
router.get(
  "/audit/report",
  passport.authenticate("jwt", { session: false }),
  taskController.getTaskAudit
);

module.exports = router;
