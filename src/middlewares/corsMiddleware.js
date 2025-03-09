const cors = require("cors");

const corsMiddleware = cors({
  origin: "http://localhost:3000",
  credentials: true,
});

module.exports = corsMiddleware;
