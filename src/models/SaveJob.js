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
    }
  },
  {
    tableName: "save_jobs",
    timestamps: true,
    underscored: true,
  }
);

User.hasMany(SaveJob, {
  foreignKey: "candidate_id",
});
SaveJob.belongsTo(User, { as: "candidate", foreignKey: "candidate_id" });

Job.hasMany(SaveJob, {
  foreignKey: "job_id",
});
SaveJob.belongsTo(Job);

module.exports = SaveJob;
