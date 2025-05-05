const express = require("express");
const {
  uploadCV,
  getApplicationOfCandidateByJobId,
  countNumberOfApplicationsByJob,
} = require("../controllers/applicationController");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/upload", upload.single("cv"), uploadCV);
router.get("/count-by-job", countNumberOfApplicationsByJob);
router.get("/:job_id", getApplicationOfCandidateByJobId);

module.exports = router;
