const express = require("express");
const authRoutes = require("./authRoutes");
const jobRoutes = require("./jobRoutes");
const companyRoutes = require("./companyRoutes");
const userRoutes = require("./userRoutes")
const majorRoutes = require("./majorRoutes")
const skillRoutes = require("./skillRoutes")

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/jobs", jobRoutes);
router.use("/companies", companyRoutes);
router.use("/user", userRoutes);
router.use("/majors", majorRoutes);
router.use("/skills", skillRoutes);

module.exports = router;
