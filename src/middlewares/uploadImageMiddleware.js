const multer = require("multer");
const { storageImage } = require("../services/cloudinary");

const uploadImage = multer({ storage: storageImage });

module.exports = uploadImage;
