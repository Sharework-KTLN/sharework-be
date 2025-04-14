const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");

const UserSkill = sequelize.define("UserSkill", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  skill_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "user_skills",
  timestamps: true,
  underscored: true,
  comment: "user - skill relationship",
});

module.exports = UserSkill;
