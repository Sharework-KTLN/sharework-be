const express = require("express");

const {
  getAllConversationsByRole,
  createNewConversation,
} = require("../controllers/conversationController");

const router = express.Router();

router.get("/", getAllConversationsByRole);
router.post("/", createNewConversation);

module.exports = router;
