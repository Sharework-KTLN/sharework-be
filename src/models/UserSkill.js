const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");
const User = require("./User");
const Skill = require("./Skill");

const UserSkill = sequelize.define(
  "UserSkill",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    skill_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "user_skills",
    timestamps: true,
    underscored: true,
    comment: "user - skill relationship",
  }
);

// User with User skill
User.hasMany(UserSkill, {
  foreignKey: "candidate_id",
});
UserSkill.belongsTo(User, {
  as: "candidate",
  foreignKey: "candidate_id",
});

// Skill with User skill
Skill.hasMany(UserSkill, {
  foreignKey: "skill_id",
});
UserSkill.belongsTo(Skill, {
  as: "skill",
  foreignKey: "skill_id",
});

module.exports = UserSkill;
