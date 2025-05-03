const express = require("express");
const authRoutes = require("./authRoutes");
const jobRoutes = require("./jobRoutes");
const companyRoutes = require("./companyRoutes");
const userRoutes = require("./userRoutes");
const majorRoutes = require("./majorRoutes");
const skillRoutes = require("./skillRoutes");
const messageRoutes = require("./messageRoutes");
const conversationRoutes = require("./conversationRoutes");
const applicationRoutes = require("./applicationRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/jobs", jobRoutes);
router.use("/companies", companyRoutes);
router.use("/user", userRoutes);
router.use("/majors", majorRoutes);
router.use("/skills", skillRoutes);
router.use("/messages", messageRoutes);
router.use("/conversations", conversationRoutes);
router.use("/applications", applicationRoutes);

module.exports = router;
