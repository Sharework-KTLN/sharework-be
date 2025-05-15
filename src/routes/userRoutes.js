const express = require("express");
const router = express.Router();
const {
  saveJobByUser,
  getJobsFavorite,
  unsaveJobByUser,
  saveUserMajors,
  getUserInterestedMajors,
  getUserSkills,
  getAllUsers,
  getUserDetail,
  getDashboardStats,
  getMonthlyStats,
  getAllCandidates,
  getJobsApplied,
  getAllCandidatesMatchWithJob,
  updateProfile
} = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddlewares");
const {uploadImageCandidate} = require("../middlewares/uploadImageMiddleware");

// Lấy tất cả ứng viên
router.get("/getAllCandidates/:recruiterId", verifyToken, getAllCandidates);
router.get(
  "/getAllCandidatesMatchWithJob/:jobId",
  verifyToken,
  getAllCandidatesMatchWithJob
);
//candidate
router.post("/savejob/:jobId", verifyToken, saveJobByUser);
router.get("/favorites", verifyToken, getJobsFavorite);
router.get("/applies", verifyToken, getJobsApplied);
router.delete("/unsavejob/:jobId", verifyToken, unsaveJobByUser);
router.put("/:userId/majors", verifyToken, saveUserMajors);
router.get("/:userId/majors", verifyToken, getUserInterestedMajors);
router.get("/:userId/skills", verifyToken, getUserSkills);
router.put("/profile", verifyToken,  uploadImageCandidate.single("profile_image"),updateProfile);
//admin
router.get("/alluser", getAllUsers);
router.get("/detail/:id", getUserDetail);
router.get("/admin/dashboard", getDashboardStats);
router.get("/admin/monthlystats", getMonthlyStats);
module.exports = router;
