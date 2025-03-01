const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");
const User = require("./User");
const Company = require("./Company");

const Job = sequelize.define(
  "Job",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requirement: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salary_range: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
    underscored: true,
  }
);

Company.hasMany(Job, {
  foreignKey: "company_id",
});
Job.belongsTo(Company);

User.hasMany(Job, {
  foreignKey: "recruiter_id",
});
Job.belongsTo(User, { as: "recruiter", foreignKey: "recruiter_id" });

module.exports = Job;
