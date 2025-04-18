const express = require("express");
const {
  getAllComment,
  getAllCommentByProjectId,
  getAllCommentByTaskid,
  getAllCommentByassignId,
  getAllCommentByownerId,
  getSingleComment,
  createComment,
  deleteComment,
  updateComment,
} = require("../controller/comment.controller");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/", auth, getAllComment);
router.get("/project", auth, getAllCommentByProjectId);
router.get("/task", auth, getAllCommentByTaskid);
router.get("/assign", auth, getAllCommentByassignId);
router.get("/owner", auth, getAllCommentByownerId);
router.get("/:id", auth, getSingleComment);
router.post("/", auth, createComment);
router.patch("/:id", auth, updateComment);
router.delete("/:id", auth, deleteComment);

module.exports = router;
