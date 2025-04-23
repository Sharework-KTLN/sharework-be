const express = require("express");
const {
  createJob,
  getAllJobsByRecruiter,
  // getJobByJobId,
  getAllJobsByCandidate,
  getJobDetailByCandidate,
  getJobsByAdmin,
  getJobDetailByAdmin
} = require("../controllers/jobController");
const { verifyToken } = require("../middlewares/authMiddlewares");
const { optionalVerifyToken } = require("../middlewares/optionalMiddlewares")

const router = express.Router();

router.post("/", createJob); // Create a job
router.get("/recruiter/:recruiter_id", getAllJobsByRecruiter); // Get all jobs by recruiter id
// router.get("/job/:id", getJobByJobId);
router.get("/", optionalVerifyToken ,getAllJobsByCandidate);
router.get("/detail/:id", getJobDetailByCandidate);
router.get("/admin/",getJobsByAdmin)
router.get("/admin/:id",getJobDetailByAdmin)
module.exports = router;
