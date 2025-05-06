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
    getMonthlyStats
 } = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddlewares");

router.post("/savejob/:jobId", verifyToken, saveJobByUser);
router.get("/favorites", verifyToken , getJobsFavorite);
router.delete("/unsavejob/:jobId", verifyToken, unsaveJobByUser);
router.post("/:userId/majors", verifyToken, saveUserMajors);
router.get("/:userId/majors", verifyToken, getUserInterestedMajors);
router.get("/:userId/skills", verifyToken, getUserSkills);
router.get("/alluser", getAllUsers);
router.get('/detail/:id', getUserDetail);
router.get('/admin/dashboard', getDashboardStats);
router.get('/admin/monthlystats', getMonthlyStats);
module.exports = router;