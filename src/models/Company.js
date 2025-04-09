const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");
const User = require("./User");

const Company = sequelize.define(
  "Company",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specialize: {
      type: DataTypes.STRING,  // Lĩnh vực chuyên môn
      allowNull: true,  // Set to true if it can be nullable
    },
    logo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_company: {
      type: DataTypes.TEXT,  // Hình ảnh công ty
      allowNull: true,  // Set to true if it can be nullable
    },
    description: {
      type: DataTypes.TEXT,  // Mô tả công ty
      allowNull: true,  // Set to true if it can be nullable
    },
    link: {
      type: DataTypes.STRING,  // Link trang web công ty
      allowNull: true,  // Set to true if it can be nullable
    },
    location: {
      type: DataTypes.STRING,  // Địa chỉ làm việc
      allowNull: true,  // Set to true if it can be nullable
    },
    job_count: {
      type: DataTypes.INTEGER,  // Số lượng công việc tuyển dụng
      defaultValue: 0,  // Default to 0 if not provided
    },
    recruiter_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    tableName: "companies",
    timestamps: true,  // This will handle created_at and updated_at
    underscored: true,  // Sequelize will use snake_case column names (e.g., created_at)
  }
);

// Define associations
User.hasMany(Company, {
  foreignKey: "recruiter_id",
});
Company.belongsTo(User, { as: "recruiter", foreignKey: "recruiter_id" });

module.exports = Company;