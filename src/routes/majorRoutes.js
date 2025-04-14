const express = require("express");
const router = express.Router();
const { getAllMajors } = require("../controllers/majorController");

// Route: GET /api/majors
router.get("/", getAllMajors);

module.exports = router;
