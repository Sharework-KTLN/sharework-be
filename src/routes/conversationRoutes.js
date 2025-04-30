const express = require("express");

const {
  getAllConversationsByRole,
} = require("../controllers/conversationController");

const router = express.Router();

router.get("/", getAllConversationsByRole);

module.exports = router;
