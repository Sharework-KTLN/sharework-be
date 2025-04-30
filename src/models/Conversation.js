const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");
const User = require("./User");

const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  {
    tableName: "conversations",
    timestamps: true, // Bật created_at, updated_at tự động
    underscored: true,
    paranoid: true, // Soft delete
    comment: "store conversation data",
  }
);

// Associations
User.hasMany(Conversation, {
  as: "candidate_conversations",
  foreignKey: "candidate_id",
});
Conversation.belongsTo(User, {
  as: "candidate",
  foreignKey: "candidate_id",
});

User.hasMany(Conversation, {
  as: "recruiter_conversations",
  foreignKey: "recruiter_id",
});
Conversation.belongsTo(User, {
  as: "recruiter",
  foreignKey: "recruiter_id",
});

module.exports = Conversation;
