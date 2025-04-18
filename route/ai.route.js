const express = require("express");
const { getAssignTeamMember } = require("../controller/ai.controller");
const router = express.Router();

router.post("/suggest", getAssignTeamMember);

module.exports = router;
