const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");
const User = require("./User");
const Company = require("./Company");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    create_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
    underscored: true,
  }
);

User.hasMany(Review, {
  foreignKey: "candidate_id",
});
Review.belongsTo(User, { as: "candidate", foreignKey: "candidate_id" });

Company.hasMany(Review, {
  foreignKey: "company_id",
});
Review.belongsTo(Company);

module.exports = Review;
