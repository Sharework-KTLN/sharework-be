const express = require("express");
const {
  createJob,
  getAllJobsByRecruiter,
} = require("../controllers/jobController");
const { verifyToken } = require("../middlewares/authMiddlewares");

const router = express.Router();

router.post("/", createJob); // Create a job
router.get("/:recruiter_id", getAllJobsByRecruiter); // Get all jobs

module.exports = router;
