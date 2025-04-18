const express = require("express");
const {
  getAllTask,
  getSingleTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskPriority,
  updateTaskStatus,
  getAllTasksByMember,
  verifyTask,
  getAllTaskDefault,
} = require("../controller/task.controller");
const auth = require("../middleware/auth");
const taskFile = require("../middleware/task.file");
const router = express.Router();

router.get("/default", auth, getAllTaskDefault);
router.get("/member", auth, getAllTasksByMember);
router.get("/", auth, getAllTask);
router.get("/:id", auth, getSingleTask);
router.post("/", auth, taskFile, createTask);
router.patch("/priority/:id", auth, updateTaskPriority);
router.patch("/status/:id", auth, updateTaskStatus);
router.patch("/verify/:id", auth, verifyTask);
router.patch("/:id", auth, updateTask);
router.delete("/:id", auth, deleteTask);

module.exports = router;
