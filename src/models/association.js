const User = require("./User");
const Major = require("./Major");
const Skill = require("./Skill");
const UserSkill = require("./UserSkill");
const UserInterestedMajor = require("./UserInterestedMajor");

// User - UserSkill - Skill
User.hasMany(UserSkill, { foreignKey: "user_id" });
UserSkill.belongsTo(User, { foreignKey: "user_id" });

Skill.hasMany(UserSkill, { foreignKey: "skill_id" });
UserSkill.belongsTo(Skill, { foreignKey: "skill_id" });

// User - UserInterestedMajor - Major
User.hasMany(UserInterestedMajor, { foreignKey: "user_id" });
UserInterestedMajor.belongsTo(User, { foreignKey: "user_id" });

Major.hasMany(UserInterestedMajor, { foreignKey: "major_id" });
UserInterestedMajor.belongsTo(Major, { foreignKey: "major_id" });

module.exports = {
  User,
  Major,
  Skill,
  UserSkill,
  UserInterestedMajor,
};
