const cors = require("cors");

const corsMiddleware = cors({
  origin: "*",
  credentials: true,
});

module.exports = corsMiddleware;
