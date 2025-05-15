const express = require("express");
const {
  getAllCompaniesByCandidate,
  getCompanyDetail,
  getCompanyById,
  getCompanyByRecruiterId,
  getAllCompaniesByAdmin,
  updateCompanyProfile,
} = require("../controllers/companyController");
const { verifyToken } = require("../middlewares/authMiddlewares");
const {uploadImage} = require("../middlewares/uploadImageMiddleware");

const router = express.Router();

// Cập nhật thông tin công ty
router.put(
  "/:companyId",
  uploadImage.fields([
    { name: "logo", maxCount: 1 },
    { name: "image_company", maxCount: 1 },
  ]),
  updateCompanyProfile
);
router.get("/", getAllCompaniesByCandidate);
// Route để lấy chi tiết công ty theo ID
router.get("/:id", getCompanyDetail);

// router.get("/:id", getCompanyById);
router.get("/recruiter/:recruiter_id", getCompanyByRecruiterId);
router.get("/admin/companies", getAllCompaniesByAdmin);
module.exports = router;
