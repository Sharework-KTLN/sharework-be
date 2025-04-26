const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");
const User = require("./User");

const Resume = sequelize.define(
  "Resume",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "resumes",
    timestamps: true,
    underscored: true,
  }
);

User.hasMany(Resume, {
  as: "resumes",
  foreignKey: "candidate_id",
});
Resume.belongsTo(User, {
  as: "candidate",
  foreignKey: "candidate_id",
});

module.exports = Resume;
