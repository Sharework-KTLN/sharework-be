const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");
const User = require("./User");
const Conversation = require("./Conversation");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "messages",
    timestamps: true, // created_at, updated_at
    underscored: true,
    paranoid: true, // Soft delete tin nhắn
    comment: "store message data",
  }
);

// Associations
Conversation.hasMany(Message, {
  as: "messages",
  foreignKey: "conversation_id",
});
Message.belongsTo(Conversation, {
  as: "conversation",
  foreignKey: "conversation_id",
});

User.hasMany(Message, {
  as: "sent_messages",
  foreignKey: "sender_id",
});
Message.belongsTo(User, {
  as: "sender",
  foreignKey: "sender_id",
});

User.hasMany(Message, {
  as: "received_messages",
  foreignKey: "receiver_id",
});
Message.belongsTo(User, {
  as: "receiver",
  foreignKey: "receiver_id",
});

module.exports = Message;
