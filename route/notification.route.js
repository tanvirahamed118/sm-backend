const express = require("express");
const {
  getAllNotification,
  getSingleNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  updateNotificationStatus,
  getAllNotificationByUserid,
} = require("../controller/notification.controller");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, getAllNotification);
router.get("/user", auth, getAllNotificationByUserid);
router.get("/:id", auth, getSingleNotification);
router.post("/", auth, createNotification);
router.patch("/status/:id", auth, updateNotificationStatus);
router.patch("/:id", auth, updateNotification);
router.delete("/:id", auth, deleteNotification);

module.exports = router;
