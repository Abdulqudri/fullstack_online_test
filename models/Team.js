const mongoose = require("mongoose");

// Sub-schema for team members
const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  accessCode: {
    type: String,
    required: true,
    unique: true, // globally unique across all teams
  },
  ugLevel: {
    type: String,
    enum: ["UG1", "UG2", "UG3", "UG4"], // you can add more levels if needed
    required: true,
  },
});

// Team schema
const teamSchema = new mongoose.Schema(
  {
    codeName: {
      type: String,
      required: true,
      unique: true, // each team has a unique codename
      trim: true,
    },
    members: {
      type: [memberSchema],
      validate: {
        validator: function (val) {
          return val.length === 3; // enforce exactly 3 members per team
        },
        message: "A team must have exactly 3 members.",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // link back to admin
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
