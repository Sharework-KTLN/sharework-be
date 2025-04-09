const express = require("express");
const {
    getAllCompaniesByCandidate,
    getCompanyDetail
} = require("../controllers/companyController");
const { verifyToken } = require("../middlewares/authMiddlewares");


const router = express.Router();
router.get('/', getAllCompaniesByCandidate);
// Route để lấy chi tiết công ty theo ID
router.get('/:id', getCompanyDetail);


module.exports = router;