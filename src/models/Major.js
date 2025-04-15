const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");

const Major = sequelize.define("Major", {
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
  tableName: "majors",
  timestamps: true,
  underscored: true,
  comment: "store majors data",
});

module.exports = Major;
