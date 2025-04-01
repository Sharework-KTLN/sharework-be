const express = require("express");
const { getCompanyById } = require("../controllers/companyController");

const router = express.Router();

router.get("/:id", getCompanyById);

module.exports = router;
