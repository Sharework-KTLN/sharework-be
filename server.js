const dotenv = require("dotenv");
const express = require("express");
const { connectDB } = require("./src/configs/database");
const { initSocket } = require("./src/socket");

const corsMiddleware = require("./src/middlewares/corsMiddleware");
const sessionMiddleware = require("./src/middlewares/sessionMiddleware");
const passportMiddleware = require("./src/middlewares/passportMiddleware");

const routes = require("./src/routes");

dotenv.config();
const app = express();
const PORT = 8080;

// khởi tạo server HTTP
const server = require("http").createServer(app);

// Tạo kết nối socket.io và truyền server HTTP vào
initSocket(server);

// middleware
app.use(express.json());
app.use(corsMiddleware);
app.use(sessionMiddleware);
passportMiddleware(app);

// routes
app.use("/", routes);

app.get("/", (req, res) => {
  res.send("Hello World !");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

connectDB();
