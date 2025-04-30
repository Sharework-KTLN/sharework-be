const { Server } = require("socket.io");
const registerChatHandlers = require("../socket/handlers/chatHandler");

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Cho phép tất cả các nguồn
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Đăng ký các handler từ các module khác nhau
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

    // Các event khác sẽ viết ở đây sau này
  });
};

const getIO = () => {
  if (!io) {
    console.log("Socket.io not initialized!");
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
