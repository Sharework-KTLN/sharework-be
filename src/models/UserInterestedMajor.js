const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");
const User = require("./User");
const Major = require("./Major");

const UserInterestedMajor = sequelize.define(
  "UserInterestedMajor",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    major_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "user_interested_majors",
    timestamps: true,
    underscored: true,
    comment: "user - interested major relationship",
  }
);

// User with Interested Major relationship
User.hasMany(UserInterestedMajor, {
  as: "user_interested_majors",
  foreignKey: "candidate_id",
});
UserInterestedMajor.belongsTo(User, {
  as: "candidate",
  foreignKey: "candidate_id",
});

// Major with Interested Major relationship
Major.hasMany(UserInterestedMajor, {
  as: "majors",
  foreignKey: "major_id",
});
UserInterestedMajor.belongsTo(Major, {
  as: "major",
  foreignKey: "major_id",
});

module.exports = UserInterestedMajor;
