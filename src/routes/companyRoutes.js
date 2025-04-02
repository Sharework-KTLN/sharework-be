const express = require("express");
const {
  getCompanyById,
  getCompanyByRecruiterId,
} = require("../controllers/companyController");

const router = express.Router();

router.get("/:id", getCompanyById);
router.get("/recruiter/:recruiter_id", getCompanyByRecruiterId);

module.exports = router;
