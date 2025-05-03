const express = require("express");
const { uploadCV } = require("../controllers/applicationController");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/upload", upload.single("cv"), uploadCV);

module.exports = router;
