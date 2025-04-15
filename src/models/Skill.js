const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");

const Skill = sequelize.define("Skill", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "skills",
  timestamps: true,
  underscored: true,
  comment: "store skills data",
});

module.exports = Skill;
