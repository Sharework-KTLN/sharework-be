const dayjs = require("dayjs");
const { Op, fn, col, literal } = require("sequelize");
const moment = require("moment"); // nếu cần xử lý thời gian
const { Sequelize } = require("sequelize");
const User = require("../models/User");
const SaveJob = require("../models/SaveJob");
const Job = require("../models/Job");
const Company = require("../models/Company");
const Major = require("../models/Major");
const Skill = require("../models/Skill");
const UserInterestedMajor = require("../models/UserInterestedMajor");
const UserSkill = require("../models/UserSkill");
const Application = require("../models/Application");
const { getTfidfScoreRecruiter } = require("../utils/tfidf");

// Lấy tất cả các ứng viên

const getAllCandidates = async (req, res) => {
  try {
    // Lấy recruiterId từ params
    const recruiterId = req.params.recruiterId;
    const { name, location, industry, skills } = req.query;

    // Lọc ứng viên theo các filter
    const whereConditions = { role: "candidate" };
    if (name) {
      whereConditions.full_name = Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("full_name")),
        {
          [Op.like]: `%${name.toLowerCase()}%`,
        }
      );
    }
    if (location) {
      whereConditions.school = Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("school")),
        {
          [Op.like]: `%${location.toLowerCase()}%`,
        }
      );
    }
    if (industry) {
      whereConditions.address = Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("address")),
        {
          [Op.like]: `%${industry.toLowerCase()}%`,
        }
      );
    }

    // 1. Lấy tất cả bài đăng của recruiter
    const jobs = await Job.findAll({
      where: { recruiter_id: recruiterId },
      attributes: ["required_skills"],
    });

    // 2. Tạo document kỹ năng tổng hợp của recruiter
    const jobSkillsText = jobs
      .map((job) => job.required_skills) // Mảng chuỗi kỹ năng
      .join(" "); // Ghép lại thành 1 chuỗi

    // 3. Lấy tất cả candidate có user_skills
    const candidates = await User.findAll({
      where: whereConditions,
      attributes: [
        "id",
        "full_name",
        "email",
        "phone",
        "profile_image",
        "gender",
        "date_of_birth",
        "school",
        "course",
        "specialize",
        "introduce_yourself",
        "address",
      ],
      include: [
        {
          model: UserSkill,
          as: "user_skills",
          include: [
            {
              model: Skill,
              as: "skill",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: UserInterestedMajor,
          as: "user_interested_majors",
          include: [
            {
              model: Major,
              as: "major",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    // 4. Format và tính điểm phù hợp cho từng ứng viên

    // Tạo document kỹ năng của từng ứng viên
    const candidateSkillTexts = candidates.map((candidate) =>
      candidate.user_skills.map((us) => us.skill.name).join(" ")
    );

    // Tính điểm TF-IDF cho ứng viên so với kỹ năng tổng hợp của nhà tuyển dụng
    const scores = candidateSkillTexts.map((candidateText) =>
      getTfidfScoreRecruiter(jobSkillsText, [candidateText])
    );

    // Gắn điểm vào từng ứng viên

    const candidatesWithScore = candidates.map((candidate, index) => {
      const plainCandidate = candidate.toJSON(); // loại bỏ circular reference
      return {
        ...plainCandidate,
        score: scores[index],
      };
    });

    candidatesWithScore.sort((a, b) => b.score - a.score);

    return res.status(200).json(candidatesWithScore);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách ứng viên:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getAllCandidatesMatchWithJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Lấy bài đăng
    const job = await Job.findByPk(jobId);
    if (!job)
      return res.status(404).json({ message: "Bài đăng không tồn tại" });

    // 2. Lấy danh sách ứng viên và kỹ năng họ có
    const candidates = await User.findAll({
      where: { role: "candidate" },
      include: [
        {
          model: UserSkill,
          as: "user_skills",
          include: [
            {
              model: Skill,
              as: "skill",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    // 3. Chuyển kỹ năng ứng viên thành chuỗi
    const candidateSkillTexts = candidates.map((candidate) => {
      const skillNames = candidate.user_skills
        .map((us) => us.skill?.name)
        .filter(Boolean)
        .map((name) => name.toLowerCase()); // 👈 chuyển từng kỹ năng thành lowercase

      return skillNames.length > 0 ? skillNames.join(" ") : "no_skills";
    });

    // 4. Chuẩn hóa kỹ năng yêu cầu từ job (lowercase để thống nhất)
    const requiredSkillsText = job.required_skills.toLowerCase();

    // 5. Tách kỹ năng yêu cầu thành mảng các từ (để so sánh chính xác)
    const requiredSkillsArray = requiredSkillsText
      .split(",")
      .map((skill) => skill.trim());

    // 6. Tính điểm TF-IDF giữa kỹ năng bài đăng và từng ứng viên
    const tfidfScores = candidateSkillTexts.map((text, index) => {
      const score = getTfidfScoreRecruiter(requiredSkillsArray.join(" "), [
        text,
      ]);
      return {
        user: candidates[index],
        score,
      };
    });

    // 7. Sắp xếp theo độ phù hợp giảm dần
    tfidfScores.sort((a, b) => b.score - a.score);

    // 8. Trả về kết quả
    return res.status(200).json({
      message: "Gợi ý ứng viên phù hợp",
      candidates: tfidfScores.map(({ user, score }) => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        profile_image: user.profile_image,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        school: user.school,
        course: user.course,
        specialize: user.specialize,
        introduce_yourself: user.introduce_yourself,
        address: user.address,
        skills: user.user_skills.map((us) => us.skill?.name).filter(Boolean),
        tfidf_score: score.toFixed(4), // làm tròn 4 chữ số nếu muốn
      })),
    });
  } catch (error) {
    console.error("Lỗi gợi ý ứng viên:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const saveJobByUser = async (req, res) => {
  try {
    console.log(req.user);
    const { jobId } = req.params;
    const userId = req.user?.id;

    if (!userId || !jobId) {
      return res.status(400).json({ message: "Thiếu userId hoặc jobId" });
    }

    // Kiểm tra xem công việc đã được lưu chưa
    const existing = await SaveJob.findOne({
      where: {
        candidate_id: userId,
        job_id: jobId,
      },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Công việc đã được lưu trước đó." });
    }

    // Lưu công việc vào bảng SaveJob
    const savedJob = await SaveJob.create({
      candidate_id: userId,
      job_id: jobId,
    });

    // Trả về thông tin công việc đã lưu, bao gồm cả thông tin công ty và người tuyển dụng
    const job = await Job.findOne({
      where: { id: jobId },
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["id", "name", "logo"],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ message: "Không tìm thấy công việc" });
    }

    // Trả về thông tin về công việc đã lưu cùng với thông tin công ty và người tuyển dụng
    return res.status(201).json({
      message: "Lưu công việc thành công",
      savedJob: {
        id: savedJob.id,
        job_id: job.id,
        candidate_id: userId,
        saved_at: savedJob.saved_at,
        job: job, // Lấy đầy đủ thông tin công việc
      },
    });
  } catch (error) {
    console.error("Lỗi khi lưu job:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getJobsFavorite = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User not found" });
    }

    const savedJobs = await SaveJob.findAll({
      where: { candidate_id: userId },
      include: [
        {
          model: Job,
          as: "job",
          attributes: [
            "id",
            "title",
            "salary_range",
            "status",
            "company_id",
            "work_location",
            "specialize",
            "deadline",
          ],
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["id", "name", "logo"],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      message: "Danh sách công việc đã lưu",
      savedJobs: savedJobs.map((item) => ({
        ...item.job.toJSON(),
        saved_at: item.saved_at,
      })),
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách công việc yêu thích:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const unsaveJobByUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { jobId } = req.params; // Lấy jobId từ URL

    if (!userId || !jobId) {
      return res.status(400).json({ message: "Thiếu userId hoặc jobId" });
    }

    const deleted = await SaveJob.destroy({
      where: {
        candidate_id: userId,
        job_id: jobId,
      },
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy công việc đã lưu" });
    }

    res.status(200).json({ message: "Đã bỏ lưu công việc" });
  } catch (error) {
    console.error("Lỗi khi xóa công việc đã lưu:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const saveUserMajors = async (req, res) => {
  const { userId, majors } = req.body;
  try {
    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Lấy danh sách các major_id hiện tại của người dùng
    const currentMajors = await UserInterestedMajor.findAll({
      where: { user_id: userId },
      attributes: ["major_id"],
    });
    // Chuyển đổi danh sách major_id hiện tại thành mảng
    const currentMajorIds = currentMajors.map((item) => item.major_id);
    // Tìm các ngành mới mà người dùng chọn nhưng chưa có trong cơ sở dữ liệu
    const newMajors = majors.filter(
      (majorId) => !currentMajorIds.includes(majorId)
    );
    // Tìm các ngành nghề cũ không còn trong danh sách mới, cần xóa
    const majorsToRemove = currentMajorIds.filter(
      (majorId) => !majors.includes(majorId)
    );

    // Xóa các ngành nghề không còn trong danh sách mới
    if (majorsToRemove.length > 0) {
      await UserInterestedMajor.destroy({
        where: {
          user_id: userId,
          major_id: majorsToRemove,
        },
      });
    }

    // Thêm các ngành nghề mới vào bảng UserInterestedMajor
    if (newMajors.length > 0) {
      const userMajors = newMajors.map((majorId) => ({
        user_id: userId,
        major_id: majorId,
      }));
      await UserInterestedMajor.bulkCreate(userMajors, {
        ignoreDuplicates: true,
      });
    }

    return res.status(200).json({ message: "Majors updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getUserInterestedMajors = async (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const userMajors = await UserInterestedMajor.findAll({
      where: { candidate_id: userId }, // Thay đổi từ user_id thành candidate_id
      include: [
        {
          model: Major,
          as: "major",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "candidate",
          attributes: ["id", "full_name"],
        },
      ],
    });

    if (!userMajors || userMajors.length === 0) {
      return res
        .status(404)
        .json({ message: "No majors found for this user." });
    }

    res.json(
      userMajors.map((item) => ({
        majorId: item.major_id,
        majorName: item.major.name,
      }))
    );
  } catch (error) {
    console.error("Error fetching user majors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserSkills = async (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const userSkills = await UserSkill.findAll({
      where: { candidate_id: userId }, // Thay đổi từ user_id thành candidate_id
      include: [
        {
          model: Skill,
          as: "skill",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "candidate",
          attributes: ["id", "full_name"],
        },
      ],
    });

    if (!userSkills || userSkills.length === 0) {
      return res
        .status(404)
        .json({ message: "No skills found for this user." });
    }

    res.json(
      userSkills.map((item) => ({
        skillId: item.skill_id,
        skillName: item.skill.name,
      }))
    );
  } catch (error) {
    console.error("Error fetching user skills:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const whereCondition = role ? { role } : {}; // nếu có role thì lọc, không thì lấy hết

    const users = await User.findAll({ where: whereCondition });

    res.status(200).json({
      message: "Lấy danh sách người dùng thành công",
      data: users,
    });
  } catch (error) {
    console.error("Lỗi khi lấy người dùng:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const userId = req.params.id; // Lấy ID từ URL params

    // Lấy thông tin người dùng từ bảng User
    const user = await User.findByPk(userId, {
      include: [
        {
          model: UserSkill,
          as: "user_skills",
          include: [
            {
              model: Skill,
              as: "skill",
              attributes: ["id", "name", "description"],
            },
          ],
        },
        {
          model: UserInterestedMajor,
          as: "user_interested_majors",
          include: [
            {
              model: Major,
              as: "major",
              attributes: ["id", "name", "description"],
            },
          ],
        },
        // { model: Resume },
        {
          model: SaveJob,
          as: "saved_jobs",
          include: [
            {
              model: Job,
              as: "job", // Dùng alias "job" cho Job
              attributes: ["id", "title", "work_location", "company_id"], // Chỉ lấy các trường cần thiết
              include: [
                {
                  model: Company, // Bao gồm mối quan hệ với Company
                  as: "company", // Alias "company"
                  attributes: ["name"], // Lấy tên công ty
                },
              ],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại",
      });
    }

    // Chỉ lấy các trường thông tin cần thiết
    const userData = {
      ...user.toJSON(),
      // UserSkills: user.user_skills ? user.user_skills.map(userSkill => ({
      //     id: userSkill.skill.id,
      //     skill: userSkill.skill.name,
      //     description: userSkill.skill.description
      // })) : [],
      // UserInterestedMajors: user.user_interested_majors ? user.user_interested_majors.map(userInterestedMajor => ({
      //     id: userInterestedMajor.major.id,
      //     major: userInterestedMajor.major.name,
      //     description: userInterestedMajor.major.description
      // })) : [],
      // SavedJobs: user.saved_jobs ? user.saved_jobs.map(saveJob => ({
      //     id: saveJob.job.id,
      //     job_title: saveJob.job.title,
      //     company_name: saveJob.job.company ? saveJob.job.company.name : 'Không có tên công ty',
      //     job_location: saveJob.job.work_location,
      //     saved_at: saveJob.saved_at,
      // })) : []
    };
    res.status(200).json({
      message: "Lấy thông tin người dùng thành công",
      data: userData,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết người dùng:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy thông tin người dùng",
      error: error.message,
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    // Giả sử bạn có các model User, Company, Job đã được định nghĩa
    const totalUsers = await User.count();
    const totalCompanies = await Company.count();
    const totalJobs = await Job.count();

    res.status(200).json({
      totalUsers,
      totalCompanies,
      totalJobs,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy thống kê",
      error: error.message,
    });
  }
};

const getMonthlyStats = async (req, res) => {
  try {
    const startOfYear = moment().startOf("year").toDate();
    const endOfYear = moment().endOf("year").toDate();

    // Group theo tháng
    const userStats = await User.findAll({
      attributes: [
        [fn("to_char", col("created_at"), "MM/YYYY"), "month"], // Đổi sang định dạng MM/YYYY
        [fn("COUNT", col("*")), "total"],
      ],
      where: {
        created_at: {
          [Op.between]: [startOfYear, endOfYear],
        },
      },
      group: [literal("month")],
      order: [literal("month ASC")],
    });

    const companyStats = await Company.findAll({
      attributes: [
        [fn("to_char", col("created_at"), "MM/YYYY"), "month"], // Đổi sang định dạng MM/YYYY
        [fn("COUNT", col("*")), "total"],
      ],
      where: {
        created_at: {
          [Op.between]: [startOfYear, endOfYear],
        },
      },
      group: [literal("month")],
      order: [literal("month ASC")],
    });

    const jobStats = await Job.findAll({
      attributes: [
        [fn("to_char", col("created_at"), "MM/YYYY"), "month"], // Đổi sang định dạng MM/YYYY
        [fn("COUNT", col("*")), "total"],
      ],
      where: {
        created_at: {
          [Op.between]: [startOfYear, endOfYear],
        },
      },
      group: [literal("month")],
      order: [literal("month ASC")],
    });

    // Tập hợp tháng và chuẩn hóa kết quả (ghép lại theo từng tháng)
    const allMonths = new Set();
    userStats.forEach((u) => allMonths.add(u.get("month")));
    companyStats.forEach((c) => allMonths.add(c.get("month")));
    jobStats.forEach((j) => allMonths.add(j.get("month")));

    const result = Array.from(allMonths)
      .sort()
      .map((month) => {
        const users =
          userStats.find((u) => u.get("month") === month)?.get("total") || 0;
        const companies =
          companyStats.find((c) => c.get("month") === month)?.get("total") || 0;
        const jobs =
          jobStats.find((j) => j.get("month") === month)?.get("total") || 0;

        return {
          month,
          totalUsers: parseInt(users),
          totalCompanies: parseInt(companies),
          totalJobs: parseInt(jobs),
        };
      });

    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy thống kê theo tháng:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy thống kê theo tháng",
      error: error.message,
    });
  }
};

const getJobsApplied = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User not found" });
    }

    const appliedJobs = await Application.findAll({
      where: { candidate_id: userId },
      order: [["created_at", "DESC"]],
      attributes: [
        // 👈 thêm dòng này
        "id",
        "status",
        "created_at",
        "cv_url",
        "full_name",
        "email",
        "phone",
      ],
      include: [
        {
          model: Job,
          as: "job",
          attributes: [
            "id",
            "title",
            "salary_range",
            "status",
            "company_id",
            "work_location",
            "specialize",
            "deadline",
          ],
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["id", "name", "logo"],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      message: "Danh sách công việc đã ứng tuyển",
      applications: appliedJobs.map((app) => {
        const job = app.job?.toJSON?.() || {};
        return {
          application_id: app.id,
          status: app.status,
          applied_at: app.getDataValue("created_at"), // CHẮC CHẮN lấy được
          cv_url: app.cv_url,
          full_name: app.full_name,
          email: app.email,
          phone: app.phone,
          job_id: job.id,
          title: job.title,
          salary_range: job.salary_range,
          status_job: job.status,
          company_id: job.company_id,
          work_location: job.work_location,
          specialize: job.specialize,
          deadline: job.deadline,
          company: job.company,
        };
      }),
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách ứng tuyển:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      full_name,
      date_of_birth,
      gender,
      phone,
      profile_image,
      address,
      school,
      course,
      specialize,
      introduce_yourself,
      interested_majors,  // <-- mảng các major_id user quan tâm
      skills
    } = req.body;

    // Cập nhật thông tin user
    const [updatedRows] = await User.update(
      {
        full_name,
        date_of_birth,
        gender,
        phone,
        profile_image,
        address,
        school,
        course,
        specialize,
        introduce_yourself,
      },
      {
        where: { id: userId },
      }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: "User not found or no changes made" });
    }

    // Cập nhật ngành nghề quan tâm nếu có
    if (Array.isArray(interested_majors)) {
      // Xóa hết các ngành cũ
      await UserInterestedMajor.destroy({
        where: { candidate_id: userId },
      });

      // Thêm mới các ngành
      const newMajors = interested_majors.map((major_id) => ({
        candidate_id: userId,
        major_id,
      }));

      if (newMajors.length > 0) {
        await UserInterestedMajor.bulkCreate(newMajors);
      }
    }

    // Cập nhật ký năng nếu có
    if (Array.isArray(skills)) {
      await UserSkill.destroy({
        where: { candidate_id: userId },
      });

      const newSkills = skills.map((skill_id) => ({
        candidate_id: userId,
        skill_id,
      }));

      if (newSkills.length > 0) {
        await UserSkill.bulkCreate(newSkills);
      }
    }

    // Lấy lại user sau cập nhật (không trả về password)
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: UserInterestedMajor,
          as: "user_interested_majors",
          include: [{ model: Major, as: "major" }],
        },
        {
          model: UserSkill,
          as: "user_skills",
          include: [{ model: Skill, as: "skill" }],
        },
      ],
    });

    return res.status(200).json({
      message: "Profile and interested majors updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  saveJobByUser,
  getJobsFavorite,
  unsaveJobByUser,
  saveUserMajors,
  getUserInterestedMajors,
  getUserSkills,
  getAllUsers,
  getUserDetail,
  getDashboardStats,
  getMonthlyStats,
  getAllCandidates,
  getJobsApplied,
  getAllCandidatesMatchWithJob,
  updateProfile
};
