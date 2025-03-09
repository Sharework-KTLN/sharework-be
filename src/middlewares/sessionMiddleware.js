require("dotenv").config();
const session = require("express-session");

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET_KEY,
  resave: false,
  saveUninitialized: true,
});

module.exports = sessionMiddleware;
