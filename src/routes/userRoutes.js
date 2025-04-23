const express = require("express");
const router = express.Router();
const {
  saveJobByUser,
  getJobsFavorite,
  unsaveJobByUser,
  saveUserMajors,
  getUserInterestedMajors,
  getUserSkills,
  getAllCandidates,
} = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddlewares");

// Lấy tất cả ứng viên

router.get("/getAllCandidates/:recruiterId", verifyToken, getAllCandidates);
router.post("/savejob/:jobId", verifyToken, saveJobByUser);
router.get("/favorites", verifyToken, getJobsFavorite);
router.delete("/unsavejob/:jobId", verifyToken, unsaveJobByUser);
router.post("/:userId/majors", verifyToken, saveUserMajors);
router.get("/:userId/majors", verifyToken, getUserInterestedMajors);
router.get("/:userId/skills", verifyToken, getUserSkills);

module.exports = router;
