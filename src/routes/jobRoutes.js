const express = require("express");
const {
  createJob,
  getAllJobsByRecruiter,
  getJobByJobId,
  getAllJobsByCandidate,
  getJobDetailByCandidate,
} = require("../controllers/jobController");
const { verifyToken } = require("../middlewares/authMiddlewares");

const router = express.Router();

router.post("/", createJob); // Create a job
router.get("/recruiter/:recruiter_id", getAllJobsByRecruiter); // Get all jobs by recruiter id
router.get("/job/:id", getJobByJobId);
router.get("/recruiter/:recruiter_id", getAllJobsByRecruiter); // Get all jobs
router.get("/", getAllJobsByCandidate);
router.get("/detail/:id", getJobDetailByCandidate);

module.exports = router;
