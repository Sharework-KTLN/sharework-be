const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");
const User = require("./User");

const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "reviewed", "accepted", "rejected")
    },
    cover_letter: {
      type: DataTypes.STRING
    },
  },
  {
    tableName: "applications",
    timestamps: true, // Bật `createdAt` & `updatedAt`
    underscored: true, // Chuyển thành `created_at`, `updated_at`
    paranoid: true, // Soft delete (bảng có cột `deletedAt`)
  }
);

User.hasMany(Application, {
  foreignKey: "candidate_id",
});
Application.belongsTo(User, { as: "candidate", foreignKey: "candidate_id" });

module.exports = Application;
