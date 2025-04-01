const Company = require("../models/Company");

// get Company by id
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "company_id không hợp lệ" });
    }
    const company = await Company.findOne({ where: { id: Number(id) } });
    console.log("company info: ", company);
    if (!company) {
      return res.status(404).json({ message: "Không có công ty nào!" });
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

module.exports = { getCompanyById };
