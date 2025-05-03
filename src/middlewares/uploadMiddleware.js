const multer = require("multer");
const { storage } = require("../services/cloudinary");

const upload = multer({ storage });

module.exports = upload;
