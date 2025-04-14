const Major = require("../models/Major");

const getAllMajors = async (req, res) => {
  try {
    // Kiểm tra user đã đăng nhập
    // if (!req.user) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }

    const majors = await Major.findAll();
    res.json(majors);
  } catch (error) {
    console.error("Error fetching majors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllMajors,
};
