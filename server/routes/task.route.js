const router = require("express").Router();
const taskController = require("../controllers/task.controller");
const {
  addTaskSchema,
  updateTaskSchema,
  validateTask,
} = require("../validation/task.validation");

router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.post(
  "/add",
  validateTask(addTaskSchema, "add"),
  taskController.createTask
);
router.put(
  "/update",
  validateTask(updateTaskSchema, "update"),
  taskController.updateTask
);
router.delete("/delete/:id", taskController.deleteTask);

module.exports = router;
