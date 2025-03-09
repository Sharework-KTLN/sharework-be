const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const passport = require("../configs/passport");
const User = require("../models/User");

const router = express.Router();

// Đăng nhập bằng google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const token = jwt.sign({ id: req.user.id }, "hello", { expiresIn: "1h" });
      res.redirect(`http://localhost:3000?token=${token}`);
    } catch (error) {
      console.error("Lỗi tạo JWT cho Google login:", error);
      res.redirect("http://localhost:3000/auth/login");
    }
  }
);
// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    console.log("request from client: ", req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ email: "Email không tồn tại!" });
    }
    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ password: "Mật khẩu không đúng" });
    }
    // / Tạo token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, "hello", {
      expiresIn: "1h",
    });

    // Trả token về FE
    res.json({
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name },
    });
  } catch (error) {
    console.error("Lỗi server:", error);
  }
});
// Đăng xuất
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.send("Logged out");
  });
});
// Đăng ký tài khoản
router.post("/register", async (req, res) => {
  try {
    console.log("request from client", req.body);
    const { full_name, email, password } = req.body;

    // Kiểm tra email đã tồn tại hay chưa
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ email: "Email đã tồn tại!" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu vào database
    const newUser = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role: "candidate",
    });

    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({ err: "Lỗi máy chủ, vui lòng thử lại!" });
  }
});
// Lấy thông tin user
router.get("/me", async (req, res) => {
  try {
    console.log(
      "request from client in AuthRoutes: ",
      req.headers.authorization
    );
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1]; // Lấy token từ "Bearer <token>"
    const decoded = jwt.verify(token, "hello"); // Giải mã JWT
    const user = await User.findByPk(decoded.id); // Lấy user từ database

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

module.exports = router;
