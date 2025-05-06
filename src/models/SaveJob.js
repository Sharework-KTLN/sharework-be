const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");
const User = require("./User");
const Job = require("./Job");

const SaveJob = sequelize.define(
  "SaveJob",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    saved_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, // Lưu thời gian hiện tại khi yêu thích công việc
    },
  },
  {
    tableName: "save_jobs",
    timestamps: true,
    underscored: true,
  }
);

User.hasMany(SaveJob, {
  as: "saved_jobs",
  foreignKey: "candidate_id",
});
SaveJob.belongsTo(User, {
  as: "candidate",
  foreignKey: "candidate_id",
});

Job.hasMany(SaveJob, {
  as: "saved_jobs",
  foreignKey: "job_id",
});
SaveJob.belongsTo(Job, {
  as: "job",
  foreignKey: "job_id",
});

module.exports = SaveJob;
