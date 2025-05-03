const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");
const User = require("./User");
const Job = require("./Job");

const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "reviewed", "accepted", "rejected"),
    },
    file_name: {
      type: DataTypes.STRING,
    },
    full_name: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    cover_letter: {
      type: DataTypes.STRING,
    },
    cv_url: {
      type: DataTypes.STRING,
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
  as: "applications",
  foreignKey: "candidate_id",
});
Application.belongsTo(User, {
  as: "candidate",
  foreignKey: "candidate_id",
});

Job.hasMany(Application, {
  as: "applications",
  foreignKey: "job_id",
});
Application.belongsTo(Job, {
  as: "job",
  foreignKey: "job_id",
});

module.exports = Application;
