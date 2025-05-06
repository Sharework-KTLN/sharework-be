const express = require("express");
const {
  getAllCompaniesByCandidate,
  getCompanyDetail,
  getCompanyById,
  getCompanyByRecruiterId,
  getAllCompaniesByAdmin
} = require("../controllers/companyController");
const { verifyToken } = require("../middlewares/authMiddlewares");

const router = express.Router();
router.get("/", getAllCompaniesByCandidate);
// Route để lấy chi tiết công ty theo ID
router.get("/:id", getCompanyDetail);

// router.get("/:id", getCompanyById);
router.get("/recruiter/:recruiter_id", getCompanyByRecruiterId);
router.get("/admin/companies", getAllCompaniesByAdmin);
module.exports = router;
