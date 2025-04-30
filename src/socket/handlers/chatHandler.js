const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");

const registerChatHandlers = (io, socket) => {
  // Sự kiện join vào một cuộc trò chuyện
  socket.on("joinConversation", (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });
  // Sự kiện gửi tin nhắn
  socket.on(
    "sendMessage",
    async ({ conversationId, senderId, content, receiverId }) => {
      try {
        // Lưu tin nhắn vào database
        const newMessage = await Message.create({
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          content: content,
          is_read: false,
          created_at: new Date(),
        });

        // Emit tin nhắn tới các client trong room
        io.to(`conversation:${conversationId}`).emit("newMessage", newMessage);

        console.log(
          `Message sent in conversation ${conversationId} by ${senderId} to ${receiverId}: "${content}"`
        );
      } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        socket.emit("messageSendError", {
          conversationId,
          error: "Không thể gửi tin nhắn",
        });
      }
    }
  );
  // Sự kiện rời khỏi một cuộc trò chuyện
  socket.on("leaveConversation", (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`User ${socket.id} left conversation ${conversationId}`);
  });
};

module.exports = registerChatHandlers;
