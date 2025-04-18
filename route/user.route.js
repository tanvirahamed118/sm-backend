const express = require("express");
const {
  getAllUser,
  getSingleUser,
  registerUser,
  loginUser,
  changePasswordUser,
  updateUser,
  deleteUser,
  verifyUser,
  updatePassword,
  getAllUserByRole,
  getAllUserByAdmin,
} = require("../controller/user.controller");
const auth = require("../middleware/auth");
const profile = require("../middleware/profile");
const router = express.Router();

router.get("/", auth, getAllUser);
router.get("/role", auth, getAllUserByRole);
router.get("/admin", auth, getAllUserByAdmin);
router.get("/:id", auth, getSingleUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/reset", changePasswordUser);
router.patch("/password", updatePassword);
router.patch("/verify/:id", verifyUser);
router.patch("/:id", auth, profile, updateUser);
router.delete("/:id", auth, deleteUser);

module.exports = router;
