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
    status: {
      type: DataTypes.STRING,
      defaultValue: "open", // Trạng thái công việc (open, closed, expired, draft)
    },
    approval_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Pending", // Trạng thái duyệt bài (chờ duyệt, đã duyệt)
      validate: {
        isIn: [["Pending", "Approved", "Rejected"]],
      },
    },
    experience_required: {
      type: DataTypes.STRING, // Kinh nghiệm yêu cầu (1-2 năm, không yêu cầu, v.v.)
    },
    salary_range: {
      type: DataTypes.STRING,
      allowNull: false, // Mức lương
    },
    work_location: {
      type: DataTypes.STRING, // Địa chỉ làm việc
    },
    specialize: {
      type: DataTypes.STRING, // Lĩnh vực cần tuyển
    },
    educational_level: {
      type: DataTypes.TEXT, // Trình độ học vấn (Cao đẳng, Đại học, ...)
    },
    work_level: {
      type: DataTypes.TEXT, // Cấp bậc làm việc (Thực tập sinh, nhân viên, ...)
    },
    work_type: {
      type: DataTypes.STRING, // Hình thức làm việc (toàn thời gian, bán thời gian, remote, v.v.)
    },
    vacancies: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // Số lượng tuyển dụng (mặc định 1)
    },
    description: {
      type: DataTypes.TEXT, // Mô tả công việc
    },
    required_skills: {
      type: DataTypes.STRING, // Yêu cầu kỹ năng
    },
    candidate_required: {
      type: DataTypes.TEXT, // Yêu cầu ứng viên
    },
    work_schedule: {
      type: DataTypes.STRING, // Thời gian làm việc
    },
    benefits: {
      type: DataTypes.TEXT, // Phúc lợi công việc (bảo hiểm, thưởng, nghỉ phép, v.v.)
    },
    deadline: {
      type: DataTypes.DATE, // Hạn bài đăng
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
    underscored: true,
  }
);

// Quan hệ với Company
Company.hasMany(Job, {
  as: "jobs",
  foreignKey: "company_id",
});

Job.belongsTo(Company, {
  as: "company",
  foreignKey: "company_id",
});

// Quan hệ với User (recruiter)
User.hasMany(Job, {
  as: "recruiter_jobs",
  foreignKey: "recruiter_id",
});

Job.belongsTo(User, {
  as: "recruiter",
  foreignKey: "recruiter_id",
});

module.exports = Job;
