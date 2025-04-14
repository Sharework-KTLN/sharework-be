const Skill = require("../models/Skill"); // Import mô hình Skill

const getAllSkills = async (req, res) => {
  try {
    // Kiểm tra user đã đăng nhập (nếu cần)
    // if (!req.user) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }

    // Lấy tất cả kỹ năng từ cơ sở dữ liệu
    const skills = await Skill.findAll();

    // Trả về danh sách kỹ năng dưới dạng JSON
    res.json(skills);
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error fetching skills:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllSkills,
};