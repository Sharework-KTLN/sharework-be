const jwt = require("jsonwebtoken");
require("dotenv").config();

const optionalVerifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];  // Lấy token từ header

  if (!token) {
    // Nếu không có token, không xác thực user, cho phép tiếp tục
    return next();
  }

  // Nếu có token, xác thực và gán thông tin user vào req.user
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("❌ Token không hợp lệ:", err.message);
      return next();  // Token không hợp lệ, cho qua mà không có user
    }

    req.user = decoded;  // Gán thông tin user vào req.user
    next();  // Tiếp tục
  });
};

module.exports = { optionalVerifyToken };
