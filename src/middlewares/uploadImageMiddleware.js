const multer = require("multer");
const { storageImage, storageImageCandidate } = require("../services/cloudinary");

const uploadImage = multer({ storage: storageImage });
const uploadImageCandidate = multer({ storage: storageImageCandidate });

module.exports = { uploadImage, uploadImageCandidate};