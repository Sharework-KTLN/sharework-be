const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { getIO } = require("../socket"); // Import socket để gửi thông báo real-time

// API gửi tin nhắn (chưa hoàn thiện)
const sendMessage = async (req, res) => {
  const { conversationId, content, senderId } = req.body;

  try {
    // Kiểm tra xem cuộc trò chuyện có tồn tại không
    const conversation = await Conversation.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Không tìm thấy hội thoại!" });
    }

    // Kiểm tra xem người gửi có phải là thành viên trong cuộc trò chuyện không
    if (![conversation.senderId, conversation.receiverId].includes(senderId)) {
      return res.status(403).json({
        message: "Bạn không phải là thành viên trong cuộc hội thoại!",
      });
    }

    // Lưu tin nhắn vào cơ sở dữ liệu (Điều chỉnh tên trường theo đúng model của bạn)
    const message = await Message.create({
      conversationId, // Đảm bảo trùng khớp với tên trường trong model
      senderId, // Đảm bảo trùng khớp với tên trường trong model
      content,
    });

    // Lấy ID người nhận tin nhắn
    const receiverId =
      conversation.senderId === senderId
        ? conversation.receiverId
        : conversation.senderId;

    // Gửi thông báo tới cuộc trò chuyện qua socket (real-time)
    const io = getIO();

    // Thay vì gửi trực tiếp đến receiverId, nên gửi đến room của cuộc trò chuyện
    io.to(`conversation:${conversationId}`).emit("newMessage", {
      message,
      conversationId,
      senderId,
    });

    return res
      .status(201)
      .json({ message: "Gửi tin nhắn thành công!", data: message });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server!" });
  }
};
// API lấy danh sách tin nhắn trong cuộc hội thoại
const getMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    // Lấy tất cả tin nhắn của cuộc trò chuyện
    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      order: [["created_at", "ASC"]],
    });

    return res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server!" });
  }
};

module.exports = { sendMessage, getMessages };
