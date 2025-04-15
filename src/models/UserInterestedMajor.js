const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");

const UserInterestedMajor = sequelize.define("UserInterestedMajor", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  major_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "user_interested_majors",
  timestamps: true,
  underscored: true,
  comment: "user - interested major relationship",
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'major_id'], // đảm bảo không có duplicate
    }
  ]
});

module.exports = UserInterestedMajor;
