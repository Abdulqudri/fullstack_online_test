const express = require("express");
const router = express.Router();


router.get("/quiz",(req, res) => {
    res.render("quiz")
})

router.get("/leaderboard", (req, res) => {
    res.render("leaderboard")
})

router.get("/completed", (req, res) => {
    res.render("completed")
})

router.get("/leaderboard", (req, res) => {
    res.render("leaderboard")
})


module.exports = router;
