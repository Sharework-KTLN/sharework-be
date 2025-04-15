const express = require("express");
const router = express.Router();
const { getAllSkills } = require("../controllers/skillController");

// Route: GET skills
router.get("/", getAllSkills);

module.exports = router;
