const Conversation = require("../models/Conversation");
const User = require("../models/User");

// Lấy danh sách hội thoại của người dùng
const getAllConversationsByRole = async (req, res) => {
  const { userId, role } = req.query;

  if (!userId || !role) {
    return res.status(400).json({ message: "Thiếu userId hoặc role" });
  }

  try {
    let conversations;

    if (role === "candidate") {
      conversations = await Conversation.findAll({
        where: { candidate_id: userId },
        order: [["updated_at", "DESC"]],
        include: [
          {
            model: User,
            as: "recruiter",
            attributes: ["id", "full_name", "profile_image"],
          },
        ],
      });
    } else if (role === "recruiter") {
      conversations = await Conversation.findAll({
        where: { recruiter_id: userId },
        order: [["updated_at", "DESC"]],
        include: [
          {
            model: User,
            as: "candidate",
            attributes: ["id", "full_name", "profile_image"],
          },
        ],
      });
    } else {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    return res.status(200).json(conversations);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách hội thoại:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = { getAllConversationsByRole };
