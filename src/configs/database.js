require("dotenv").config(); //Đọc file .env
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE_NAME, // Tên cơ sở dữ liệu
  process.env.DATABASE_USER, // Tên người dùng
  process.env.DATABASE_PASSWORD, // Mật khẩu
  {
    host: process.env.DATABASE_HOST,
    dialect: process.env.DATABASE_DIALECT, // Loại cơ sở dữ liệu
    logging: false, // Tắt log của sequelize
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Chấp nhận chứng chỉ không hợp lệ
      },
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = { sequelize, connectDB };
