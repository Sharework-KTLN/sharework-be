const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// upload file pdf
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const originalName = file.originalname.replace(/\.[^/.]+$/, ""); // bỏ đuôi .pdf
    const timestamp = Date.now(); // thêm để tránh trùng tên
    return {
      folder: "jobportal/cvs",
      resource_type: "raw",
      allowed_formats: ["pdf"],
      public_id: `${originalName}_${timestamp}`,
    };
  },
});

// upload image
const storageImage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const originalName = file.originalname.replace(/\.[^/.]+$/, "");
    const timestamp = Date.now();

    return {
      folder: "jobportal/company",
      resource_type: "image", // hoặc bỏ cũng được, mặc định là image
      allowed_formats: ["jpg", "jpeg", "png"],
      public_id: `${originalName}_${timestamp}`,
    };
  },
});

module.exports = { cloudinary, storage, storageImage };
