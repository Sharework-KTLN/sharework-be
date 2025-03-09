const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");
const User = require("./User");

const Company = sequelize.define(
  "Company",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "companies",
    timestamps: true,
    underscored: true,
  }
);

User.hasMany(Company, {
  foreignKey: "recruiter_id",
});
Company.belongsTo(User, { as: "recruiter", foreignKey: "recruiter_id" });

module.exports = Company;
