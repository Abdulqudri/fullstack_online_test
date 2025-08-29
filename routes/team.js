const express = require("express");
const router = express.Router();
const { createTeam, getTeams } = require("../controllers/teamController");
const { isAdmin } = require("../middlewares/auth");

// Admin-only routes
router.post("/create",isAdmin, createTeam);
router.get("/",isAdmin, getTeams);

module.exports = router;
