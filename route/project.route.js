const express = require("express");
const {
  getAllProject,
  getSingleProject,
  createProject,
  updateProject,
  deleteProject,
  assignMember,
  removeTeamMember,
  getAllProjectByManager,
  removeAssignMembers,
  updateProjectByAdmin,
  verifyProject,
  getAllProjectDefault,
  getAllProjectByMember,
} = require("../controller/project.controller");
const auth = require("../middleware/auth");
const projectFile = require("../middleware/project.file");
const router = express.Router();

router.get("/", auth, getAllProject);
router.get("/default", auth, getAllProjectDefault);
router.get("/member", auth, getAllProjectByMember);
router.get("/manager", auth, getAllProjectByManager);
router.get("/:id", auth, getSingleProject);
router.post("/", auth, projectFile, createProject);
router.post("/assign", auth, assignMember);
router.delete("/remove/:id", auth, removeTeamMember);
router.patch("/:id", auth, projectFile, updateProject);
router.patch("/verify/:id", auth, verifyProject);
router.patch("/admin/:id", projectFile, auth, updateProjectByAdmin);
router.delete("/reassign", auth, removeAssignMembers);
router.delete("/:id", auth, deleteProject);

module.exports = router;
