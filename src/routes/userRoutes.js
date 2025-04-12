const express = require("express");
const router = express.Router();
const { saveJobByUser } = require("../controllers/userController");
const { getJobsFavorite } = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddlewares");

router.post("/savejob", verifyToken ,saveJobByUser);
router.get("/favorites", verifyToken , getJobsFavorite);

module.exports = router;