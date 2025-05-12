const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Company = require("../models/Company");

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
            include: [
              {
                model: Company,
                as: "companies",
                attributes: ["id", "name", "logo"],
              },
            ],
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

const createNewConversation = async (req, res) => {
  const { candidate_id, recruiter_id } = req.body;

  try {
    const conversation = await Conversation.create({
      candidate_id,
      recruiter_id,
    });

    // Fetch lại với include để trả về đầy đủ
    const fullConversation = await Conversation.findOne({
      where: { id: conversation.id },
      include: [
        {
          model: User,
          as: "candidate",
          attributes: ["id", "full_name", "profile_image"],
        },
        {
          model: User,
          as: "recruiter",
          attributes: ["id", "full_name", "profile_image"],
          include: [
            {
              model: Company,
              as: "companies",
              attributes: ["id", "name", "logo"],
            },
          ],
        },
      ],
    });

    return res.status(201).json(fullConversation);
  } catch (err) {
    console.error("Lỗi khi tạo conversation:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getOrCreateConversation = async (req, res) => {
  const { candidateId, recruiterId } = req.query;

  if (!candidateId || !recruiterId) {
    return res
      .status(400)
      .json({ message: "Thiếu candidateId hoặc recruiterId" });
  }

  try {
    let conversation = await Conversation.findOne({
      where: {
        candidate_id: candidateId,
        recruiter_id: recruiterId,
      },
    });

    // Nếu chưa có thì tạo mới
    if (!conversation) {
      conversation = await Conversation.create({
        candidate_id: candidateId,
        recruiter_id: recruiterId,
        updated_at: new Date(),
      });
    }

    return res.status(200).json(conversation);
  } catch (err) {
    console.error("Lỗi khi lấy hoặc tạo hội thoại:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = { getAllConversationsByRole, createNewConversation };
