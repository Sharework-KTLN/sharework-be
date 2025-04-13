const express = require("express");
const router = express.Router();
const { saveJobByUser } = require("../controllers/userController");
const { getJobsFavorite } = require("../controllers/userController");
const { unsaveJobByUser } = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddlewares");

router.post("/savejob/:jobId", verifyToken, saveJobByUser);
router.get("/favorites", verifyToken , getJobsFavorite);
router.delete("/unsavejob/:jobId", verifyToken, unsaveJobByUser);


module.exports = router;