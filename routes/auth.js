const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  loginMember,
  logoutMember,
} = require("../controllers/authController");

// Admin
router.post("/admin/login", loginAdmin);
router.post("/admin/logout", logoutAdmin);

// Member
router.post("/member/login", loginMember);
router.post("/member/logout", logoutMember);

module.exports = router;
