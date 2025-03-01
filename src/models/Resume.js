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
    create_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "resumes",
    timestamps: true,
    underscored: true,
  }
);

User.hasMany(Resume, {
  foreignKey: "candidate_id",
});
Resume.belongsTo(User, { as: "candidate", foreignKey: "candidate_id" });

module.exports = Resume;
