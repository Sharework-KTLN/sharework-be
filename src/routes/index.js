const express = require("express");
const authRoutes = require("./authRoutes");
const jobRoutes = require("./jobRoutes");
const companyRoutes = require("./companyRoutes");
const userRoutes = require("./userRoutes")

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/jobs", jobRoutes);
router.use("/companies", companyRoutes);
router.use("/user", userRoutes)

module.exports = router;
