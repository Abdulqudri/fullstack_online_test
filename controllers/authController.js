const Admin = require("../models/Admin");
const Team = require("../models/Team");
const { checkPass } = require("../utils/password");

// ============= Admin Auth =============

// Admin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).send("Admin not found");

    const isMatch = await checkPass(password, admin.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    req.session.adminId = admin._id;
    req.session.role = admin.role;

    res.send("Admin logged in successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Admin Logout
exports.logoutAdmin = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.clearCookie("connect.sid");
    res.send("Logged out successfully");
  });
};

// ============= Member Auth =============

// Member Login (by codeName + accessCode)
exports.loginMember = async (req, res) => {
  try {
    const { codeName, accessCode, ugLevel } = req.body;

    const team = await Team.findOne({ codeName });
    if (!team) return res.status(404).send("Team not found");

    const member = team.members.find((m) => (m.accessCode === accessCode && m.ugLevel === ugLevel));
    if (!member) return res.status(400).send("Invalid access code");

    req.session.member = {
      teamId: team._id,
      codeName: team.codeName,
      name: member.name,
      ugLevel: member.ugLevel,
    };

    res.send(`Welcome ${member.name}, you are now logged in`);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Member Logout
exports.logoutMember = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.clearCookie("connect.sid");
    res.send("Member logged out successfully");
  });
};
