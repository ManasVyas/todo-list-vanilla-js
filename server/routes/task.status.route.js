const router = require("express").Router();
const taskStatusController = require("../controllers/task.status.controller");
const {
  addTaskStatusSchema,
  updateTaskStatusSchema,
  validateTaskStatus,
} = require("../validation/task.status.validation");

router.get("/", taskStatusController.getAllTaskStatuses);
router.get("/:id", taskStatusController.getTaskStatusById);
router.post(
  "/add",
  validateTaskStatus(addTaskStatusSchema, "add"),
  taskStatusController.createTaskStatus
);
router.put(
  "/update",
  validateTaskStatus(updateTaskStatusSchema, "update"),
  taskStatusController.updateTaskStatus
);
router.delete("/delete/:id", taskStatusController.deleteTaskStatus);

module.exports = router;
