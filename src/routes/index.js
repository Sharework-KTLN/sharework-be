const express = require("express");
const authRoutes = require("./authRoutes");
const jobRoutes = require("./jobRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/jobs", jobRoutes);

module.exports = router;
