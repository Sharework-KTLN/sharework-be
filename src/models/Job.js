const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/database");
const User = require("./User");
const Company = require("./Company");

const Job = sequelize.define(
  "Job",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false, // Vị trí cần tuyển
    },
    required_skills: {
      type: DataTypes.STRING, // Yêu cầu kỹ năng
    },
    industry: {
      type: DataTypes.STRING, // Lĩnh vực cần tuyển
    },
    salary_range: {
      type: DataTypes.STRING,
      allowNull: false, // Mức lương
    },
    salary_type: {
      type: DataTypes.STRING, // Hình thức lương (net/gross, theo giờ/tháng, v.v.)
    },
    deadline: {
      type: DataTypes.DATE, // Hạn bài đăng
    },
    work_type: {
      type: DataTypes.STRING, // Hình thức làm việc (toàn thời gian, bán thời gian, remote, v.v.)
    },
    work_location: {
      type: DataTypes.STRING, // Địa chỉ làm việc
    },
    work_schedule: {
      type: DataTypes.STRING, // Thời gian làm việc
    },
    description: {
      type: DataTypes.TEXT, // Mô tả công việc
    },
    vacancies: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // Số lượng tuyển dụng (mặc định 1)
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "open", // Trạng thái công việc (open, closed, expired, draft)
    },
    benefits: {
      type: DataTypes.TEXT, // Phúc lợi công việc (bảo hiểm, thưởng, nghỉ phép, v.v.)
    },
    experience_required: {
      type: DataTypes.STRING, // Kinh nghiệm yêu cầu (1-2 năm, không yêu cầu, v.v.)
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
    underscored: true,
  }
);

Company.hasMany(Job, {
  foreignKey: "company_id",
});
Job.belongsTo(Company);

User.hasMany(Job, {
  foreignKey: "recruiter_id",
});
Job.belongsTo(User, { as: "recruiter", foreignKey: "recruiter_id" });

module.exports = Job;
