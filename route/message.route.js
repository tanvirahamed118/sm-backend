const express = require("express");
const {
  getAllMessage,
  getSingleMessage,
  createMessage,
  updateMessage,
  deleteMessage,
  readMessage,
  getAllMessageByTaskid,
  getAllMessageByReciverid,
} = require("../controller/message.controller");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, getAllMessage);
router.get("/all", auth, getAllMessageByTaskid);
router.get("/match", auth, getAllMessageByReciverid);
router.get("/:id", auth, getSingleMessage);
router.post("/", auth, createMessage);
router.patch("/:id", auth, updateMessage);
router.patch("/read/:id", auth, readMessage);
router.delete("/:id", auth, deleteMessage);

module.exports = router;
