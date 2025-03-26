require("dotenv").config(); //Đọc file .env
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const passport = require("../configs/passport");
const User = require("../models/User");
const Company = require("../models/Company");

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
// Đăng nhập user thông thường
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
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    // Trả token về FE
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({ error: "Lỗi máy chủ, vui lòng thử lại!" });
  }
});
// Đăng xuất
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.send("Logged out");
  });
});
// Đăng ký tài khoản user
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Giải mã JWT
    const user = await User.findByPk(decoded.id); // Lấy user từ database

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Đăng ký tài khoản nhà tuyển dụng
router.post("/recruiter/register", async (req, res) => {
  try {
    console.log("request from client", req.body);
    const {
      email,
      password,
      full_name,
      gender,
      company_phone,
      company_name,
      company_email,
      province,
      district,
    } = req.body;

    // Kiểm tra email recruiter đã tồn tại hay chưa
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ email: "Email đã tồn tại!" });
    }
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    // Tạo recruiter mới
    const newRecruiter = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role: "recruiter",
    });

    // Tạo công ty nếu có đủ thông tin
    let newCompany = null;
    const company_address = province + ", " + district;

    try {
      if (company_name && company_email && company_phone) {
        newCompany = await Company.create({
          name: company_name,
          email: company_email,
          phone: company_phone,
          address: company_address,
          recruiter_id: newRecruiter.id, // Liên kết công ty với recruiter
        });
        console.log("Company created successfully:", newCompany);
      } else {
        console.log("Company info is missing, skipping company creation.");
      }
    } catch (error) {
      console.error("Error creating company:", error);
    }

    res.status(201).json({
      message: "Đăng ký thành công!",
      user: {
        id: newRecruiter.id,
        email: newRecruiter.email,
        full_name: newRecruiter.full_name,
        role: newRecruiter.role,
      },
      company: newCompany
        ? { id: newCompany.id, name: newCompany.name, email: newCompany.email }
        : "Công ty chưa được tạo. Vui lòng kiểm tra thông tin đầu vào!",
    });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({ err: "Lỗi máy chủ, vui lòng thử lại!" });
  }
});
module.exports = router;
