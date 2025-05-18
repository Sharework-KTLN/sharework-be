const express = require("express");
const {
  createJob,
  updateJob,
  getAllJobsByRecruiter,
  // getJobByJobId,
  getAllJobsByCandidate,
  getJobDetailByCandidate,
  getJobsByAdmin,
  getJobDetailByAdmin,
  approveJob,
  rejectJob,
  getRecommendedJobsByCandidate,
  getRecommendedJobsByAppliedJobs
} = require("../controllers/jobController");
const { verifyToken } = require("../middlewares/authMiddlewares");
const { optionalVerifyToken } = require("../middlewares/optionalMiddlewares");

const router = express.Router();

router.post("/", createJob); // Create a job
router.put("/:id", verifyToken, updateJob); // Update a job
router.get("/recruiter/:recruiter_id", getAllJobsByRecruiter); // Get all jobs by recruiter id
// router.get("/job/:id", getJobByJobId);
router.get("/", optionalVerifyToken, getAllJobsByCandidate);
router.get("/recommended", optionalVerifyToken, getRecommendedJobsByCandidate);
router.get("/recommendApplied", optionalVerifyToken, getRecommendedJobsByAppliedJobs);
router.get("/detail/:id", getJobDetailByCandidate);
router.get("/admin/", getJobsByAdmin);
router.get("/admin/:id", getJobDetailByAdmin);
router.patch("/admin/approve/:id", approveJob);
router.patch("/admin/reject/:id", rejectJob);
module.exports = router;
