const Team = require("../models/Team");
const { nanoid } = require("nanoid"); // small lib for unique codes

// Create a new team with 3 members
exports.createTeam = async (req, res) => {
  try {
    // Ensure only Admins can create
    if (!req.session.adminId || req.session.role !== "admin") {
      return res.status(403).send("Only Admins can create teams");
    }

    const { codeName, members } = req.body;

    // Check exactly 3 members
    if (!members || members.length !== 3) {
      return res.status(400).send("A team must have exactly 3 members");
    }

    // Assign globally unique access codes
    const membersWithCodes = members.map((m) => ({
      ...m,
      accessCode: nanoid(8), // generate unique 8-char code
    }));

    const team = new Team({
      codeName,
      members: membersWithCodes,
      createdBy: req.session.adminId,
    });

    await team.save();

    res.status(201).json({
      message: "Team created successfully",
      team,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).send("Duplicate codename or access code found");
    }
    res.status(500).send(err.message);
  }
};

// Get all teams (admin only)
exports.getTeams = async (req, res) => {
  if (!req.session.adminId || req.session.role !== "admin") {
    return res.status(403).send("Only Admins can view teams");
  }

  const teams = await Team.find().populate("createdBy", "name email");
  res.json(teams);
};
