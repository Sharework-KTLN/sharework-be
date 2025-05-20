const dayjs = require("dayjs");
const Job = require("../models/Job");
const Company = require("../models/Company");
const User = require("../models/User");
const { getTfidfScore, getJobDescriptionById, getTfidfScoreRecruiter, extractMainJobTitle, preprocess } = require("../utils/tfidf");
const Application = require("../models/Application");
const SaveJob = require("../models/SaveJob");

const {
  WORK_TYPE_MAP,
  SALARY_RANGE_MAP,
  INDUSTRY_MAP,
  EXPERIENCE_MAP,
  EDUCATION_MAP,
  WORK_LEVEL_MAP,
} = require("../utils/fieldDisplayMap"); // đường dẫn đúng tùy theo dự án

// Create a new job
const createJob = async (req, res) => {
  try {
    console.log("req.body: ", req.body);
    const {
      title,
      required_skills,
      specialize,
      salary_range,
      salary_type,
      deadline,
      work_type,
      work_location,
      work_schedule,
      description,
      vacancies,
      candidate_required,
      experience_required,
      educational_level,
      work_level,
      benefits,
      recruiter_id,
      company_id,
    } = req.body;
    // Chuyển đổi deadline sang kiểu DATE
    const formattedDeadline = dayjs(deadline, "YYYY-MM-DD").toDate();
    try {
      const newJob = await Job.create({
        title,
        required_skills,
        specialize: INDUSTRY_MAP[specialize] || specialize,
        salary_range: SALARY_RANGE_MAP[salary_range] || salary_range,
        salary_type,
        deadline: formattedDeadline, // Lưu vào DB
        work_type: WORK_TYPE_MAP[work_type] || work_type,
        work_location,
        work_schedule,
        description,
        vacancies,
        candidate_required,
        experience_required:
          EXPERIENCE_MAP[experience_required] || experience_required,
        educational_level:
          EDUCATION_MAP[educational_level] || educational_level,
        work_level: WORK_LEVEL_MAP[work_level] || work_level,
        benefits,
        approval_status: "Pending", // Trạng thái phê duyệt mặc định là "pending"
        recruiter_id,
        company_id,
      });
      res.status(201).json({
        message: "Thêm bài đăng thành công, chờ admin duyệt!",
        job: newJob,
      });
    } catch (dbError) {
      console.error("Lỗi khi thêm vào CSDL: ", dbError);
      res.status(500).json({
        message: "Lỗi khi thêm bài đăng vào CSDL!",
        error: dbError.message,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Lỗi Server: ", error);
  }
};

// Update a job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      required_skills,
      industry,
      salary_range,
      salary_type,
      deadline,
      work_location,
      work_schedule,
      work_type,
      description,
      vacancies,
      benefits,
      candidate_required,
      education,
      experience_required,
      position,
    } = req.body;

    // Chuyển đổi deadline sang kiểu Date (nếu có)
    const formattedDeadline = deadline
      ? dayjs(deadline, "YYYY-MM-DD").toDate()
      : undefined;

    // Nếu work_type là mảng, lấy giá trị đầu tiên
    const formattedWorkType = Array.isArray(work_type)
      ? work_type[0]
      : work_type;

    // Tạo object chứa các trường cần cập nhật
    const updatedFields = {
      title,
      required_skills,
      industry,
      salary_range,
      salary_type,
      deadline: formattedDeadline,
      work_type: formattedWorkType,
      work_location,
      work_schedule,
      description,
      vacancies,
      benefits,
      candidate_required,
      educational_level: education,
      experience_required,
      work_level: position,
    };

    // Xoá các field undefined để tránh ghi đè giá trị cũ bằng undefined
    Object.keys(updatedFields).forEach(
      (key) => updatedFields[key] === undefined && delete updatedFields[key]
    );

    // Tìm và cập nhật job
    const updatedJob = await Job.findByPk(id);
    if (!updatedJob) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng!" });
    }

    await updatedJob.update(updatedFields);
    res
      .status(200)
      .json({ message: "Cập nhật bài đăng thành công!", job: updatedJob });
  } catch (error) {
    console.error("Lỗi khi cập nhật bài đăng: ", error);
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
};

// Get all jobs by recruiter_id
const getAllJobsByRecruiter = async (req, res) => {
  try {
    const { recruiter_id } = req.params; // Lấy recruiter_id từ URL
    const jobs = await Job.findAll({ where: { recruiter_id } });

    if (!jobs.length) {
      return res.status(404).json({ message: "Không có bài đăng nào" });
    }

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

const getAllJobsByCandidate = async (req, res) => {
  try {
    const userId = req.user?.id; // Có thể không tồn tại nếu chưa đăng nhập
    console.log("👤 Thông tin user:", req.user);
    console.log("📌 userId:", userId);

    // 1. Lấy tất cả công việc đã duyệt (status = "đã duyệt")
    const jobs = await Job.findAll({
      where: {
        approval_status: "Approved", // Lọc công việc đã duyệt bằng tiếng Việt
      },
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["name", "logo"],
        },
        {
          model: User,
          as: "recruiter",
          attributes: ["full_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log("✅ TỔNG SỐ CÔNG VIỆC ĐÃ DUYỆT TỪ DB:", jobs.length);

    let sortedJobs = jobs;

    // Nếu người dùng đã đăng nhập thì mới tính TF-IDF
    if (userId) {
      // 2. Lấy các công việc mà người dùng đã ứng tuyển hoặc lưu
      const savedJobs = await SaveJob.findAll({
        where: { candidate_id: userId },
        attributes: ["job_id"],
      });

      const appliedAndSavedJobIds = [
        ...new Set([...savedJobs.map((job) => job.job_id)]),
      ];

      console.log(
        "✅ Job đã lưu:",
        savedJobs.map((j) => j.job_id)
      );
      console.log("✅ Tổng hợp jobId đã lưu/ứng tuyển:", appliedAndSavedJobIds);

      // 3. Tính điểm TF-IDF cho tất cả công việc
      const jobScores = await Promise.all(
        jobs.map(async (job) => {
          const jobText = [job.title, job.description]
            .filter(Boolean)
            .join(" ");
          const tfidfScore = await getTfidfScore(
            jobText,
            appliedAndSavedJobIds
          );

          return {
            job,
            score: tfidfScore,
          };
        })
      );

      console.log(
        "✅ Điểm TF-IDF từng công việc:",
        jobScores.map((j) => ({
          jobId: j.job.id,
          title: j.job.title,
          score: j.score,
        }))
      );

      // 4. Sắp xếp công việc theo điểm TF-IDF
      sortedJobs = jobScores
        .sort((a, b) => b.score - a.score)
        .map((jobScore) => jobScore.job);

      console.log(
        "✅ Job có điểm TF-IDF cao nhất:",
        jobScores.sort((a, b) => b.score - a.score)[0]
      );
    }

    // 5. Định dạng lại dữ liệu công việc
    const formattedJobs = sortedJobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      status: job.status,
      experience_required: job.experience_required || "",
      salary_range: job.salary_range,
      work_location: job.work_location,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
      company_name: job.company ? job.company.name : "Không rõ",
      recruiter_name: job.recruiter ? job.recruiter.full_name : "Không rõ",
      company_logo: job.company ? job.company.logo : "",
      company_id: job.company_id,
      recruiter_id: job.recruiter_id,
      required_skills: job.required_skills,
      industry: job.industry,
      salary_type: job.salary_type,
      deadline: job.deadline,
      work_type: job.work_type,
      work_schedule: job.work_schedule,
      vacancies: job.vacancies,
      benefits: job.benefits,
      educational_level: job.educational_level,
      work_level: job.work_level,
      candidate_required: job.candidate_required,
    }));

    // 6. Trả về dữ liệu đã được sắp xếp và định dạng
    res.status(200).json(formattedJobs);
  } catch (error) {
    console.error("❌ Lỗi khi lấy job:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getJobDetailByCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findOne({
      where: { id },
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["name", "logo"],
        },
        {
          model: User,
          as: "recruiter",
          attributes: ["full_name"],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const formattedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      status: job.status,
      experience_required: job.experience_required || "",
      salary_range: job.salary_range,
      work_location: job.work_location,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
      company_name: job.company ? job.company.name : "Không rõ", // Lấy tên công ty nếu có
      recruiter_name: job.recruiter ? job.recruiter.full_name : "Không rõ", // Lấy tên người tuyển dụng nếu có
      company_logo: job.company ? job.company.logo : "",
      company_id: job.company_id,
      recruiter_id: job.recruiter_id,
      required_skills: job.required_skills,
      specialize: job.specialize,
      salary_type: job.salary_type,
      deadline: job.deadline,
      work_type: job.work_type,
      work_schedule: job.work_schedule,
      vacancies: job.vacancies,
      benefits: job.benefits,
      educational_level: job.educational_level,
      work_level: job.work_level,
      candidate_required: job.candidate_required,
    };

    res.status(200).json(formattedJob);
  } catch (error) {
    console.error("Error fetching job detail:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getJobsByAdmin = async (req, res) => {
  try {
    // Lấy approval_status từ query parameter (bỏ qua status)
    const { approval_status } = req.query;
    let whereClause = {};

    // Nếu có approval_status trong query, thêm vào whereClause
    if (approval_status) {
      whereClause.approval_status = approval_status; // Lọc theo approval_status
    }

    // 1. Lấy công việc dựa trên approval_status
    const jobs = await Job.findAll({
      where: whereClause, // Lọc theo approval_status nếu có
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["name", "logo"],
        },
        {
          model: User,
          as: "recruiter",
          attributes: ["full_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 2. Định dạng lại dữ liệu công việc
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      approval_status: job.approval_status, // Lấy trạng thái phê duyệt
      status: job.status, // Lấy trạng thái công việc
      experience_required: job.experience_required || "",
      salary_range: job.salary_range,
      work_location: job.work_location,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
      company_name: job.company ? job.company.name : "Không rõ",
      recruiter_name: job.recruiter ? job.recruiter.full_name : "Không rõ",
      company_logo: job.company ? job.company.logo : "",
      company_id: job.company_id,
      recruiter_id: job.recruiter_id,
      required_skills: job.required_skills,
      specialize: job.specialize,
      salary_type: job.salary_type,
      deadline: job.deadline,
      work_type: job.work_type,
      work_schedule: job.work_schedule,
      vacancies: job.vacancies,
      benefits: job.benefits,
      educational_level: job.educational_level,
      work_level: job.work_level,
      candidate_required: job.candidate_required,
    }));

    // 3. Trả về dữ liệu đã định dạng
    res.status(200).json(formattedJobs);
  } catch (error) {
    console.error("Error fetching jobs for admin:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getJobDetailByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findOne({
      where: { id },
      include: [
        {
          model: Company,
          as: "company",
          attributes: ["name", "logo"],
        },
        {
          model: User,
          as: "recruiter",
          attributes: ["full_name"],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const formattedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      status: job.status,
      approval_status: job.approval_status,
      experience_required: job.experience_required || "",
      salary_range: job.salary_range,
      work_location: job.work_location,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
      company_name: job.company ? job.company.name : "Không rõ", // Lấy tên công ty nếu có
      recruiter_name: job.recruiter ? job.recruiter.full_name : "Không rõ", // Lấy tên người tuyển dụng nếu có
      company_logo: job.company ? job.company.logo : "",
      company_id: job.company_id,
      recruiter_id: job.recruiter_id,
      required_skills: job.required_skills,
      specialize: job.specialize,
      salary_type: job.salary_type,
      deadline: job.deadline,
      work_type: job.work_type,
      work_schedule: job.work_schedule,
      vacancies: job.vacancies,
      benefits: job.benefits,
      educational_level: job.educational_level,
      work_level: job.work_level,
      candidate_required: job.candidate_required,
    };

    res.status(200).json(formattedJob);
  } catch (error) {
    console.error("Error fetching job detail:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Hàm approveJob để cập nhật trạng thái công việc
const approveJob = async (req, res) => {
  const jobId = req.params.id;

  try {
    // Tìm công việc theo ID
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Cập nhật trạng thái approval_status từ Pending sang Approved
    job.approval_status = "Approved";
    await job.save(); // Lưu thay đổi vào cơ sở dữ liệu

    res.status(200).json({ message: "Job approved successfully", job });
  } catch (error) {
    console.error("Error approving job:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const rejectJob = async (req, res) => {
  const jobId = req.params.id;

  try {
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.approval_status = "Rejected";
    await job.save();

    res.status(200).json({ message: "Job rejected successfully", job });
  } catch (error) {
    console.error("Error rejecting job:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getRecommendedJobsByCandidate = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Lấy tất cả công việc đã được duyệt
    const jobs = await Job.findAll({
      where: { approval_status: "Approved" },
      include: [
        { model: Company, as: "company", attributes: ["name", "logo"] },
        { model: User, as: "recruiter", attributes: ["full_name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Lấy danh sách công việc đã lưu của ứng viên
    const savedJobs = await SaveJob.findAll({
      where: { candidate_id: userId },
      attributes: ["job_id"],
    });
    const savedJobIds = savedJobs.map((j) => j.job_id);

    // Nếu chưa lưu công việc nào thì không thể gợi ý
    if (savedJobIds.length === 0) return res.status(200).json([]);

    // Lọc ra các công việc chưa lưu
    const unsavedJobs = jobs.filter((job) => !savedJobIds.includes(job.id));

    // Chuẩn bị mô tả các công việc đã lưu để làm "tập so sánh"
    const savedJobTextsRaw = await Promise.all(
      savedJobIds.map((jobId) => getJobDescriptionById(jobId))
    );
    // Loại bỏ trùng lặp mô tả đã lưu
    const savedJobTexts = [...new Set(savedJobTextsRaw)];

    // Lọc trùng mô tả công việc chưa lưu
    const textMap = new Map();
    const filteredJobs = [];
    for (const job of unsavedJobs) {
      const jobTextRaw = [extractMainJobTitle(job.title), job.description].filter(Boolean).join(" ");
      const jobText = preprocess(jobTextRaw); // Tiền xử lý văn bản trước khi xét trùng
      if (!textMap.has(jobText)) {
        textMap.set(jobText, true);
        filteredJobs.push({ job, jobText });
      }
    }

    // Tính điểm TF-IDF giữa từng công việc chưa lưu với các công việc đã lưu
    const jobScores = await Promise.all(
      filteredJobs.map(async ({ job, jobText }) => {
        const tfidfScore = getTfidfScoreRecruiter(jobText, savedJobTexts);
        return { job, score: tfidfScore };
      })
    );

    // Lọc trùng theo ID đề phòng trùng job (có thể không cần nhưng an toàn)
    const uniqueJobScores = [...new Map(
      jobScores.filter(Boolean).map(item => [item.job.id, item])
    ).values()];

    // Debug log điểm TF-IDF
    uniqueJobScores.forEach(item => {
      if (item) console.log(`✅ ${item.job.title} - TFIDF Score: ${item.score}`);
    });

    // Lọc ra các công việc có điểm cao, sắp xếp theo điểm giảm dần và lấy tối đa 10 kết quả
    const recommendedJobs = uniqueJobScores
      .filter((item) => item.score >= 2.4)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.job);

    // Định dạng dữ liệu trả về
    const formattedJobs = recommendedJobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      salary_range: job.salary_range,
      work_location: job.work_location,
      deadline: job.deadline,
      company: job.company,
      recruiter: job.recruiter,
    }));

    return res.status(200).json(formattedJobs);
  } catch (error) {
    console.error("❌ Lỗi khi lấy recommended jobs:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getRecommendedJobsByAppliedJobs = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Lấy danh sách các công việc đã ứng tuyển
    const appliedJobs = await Application.findAll({
      where: { candidate_id: userId },
      attributes: ["job_id"],
    });

    const appliedJobIds = [...new Set(appliedJobs.map((a) => a.job_id))];

    if (appliedJobIds.length === 0) {
      return res.status(200).json([]);
    }

    // Lấy mô tả các công việc đã ứng tuyển (dùng để tính TF-IDF)
    const appliedJobDescriptions = await Promise.all(
      appliedJobIds.map(async (id) => {
        const job = await Job.findByPk(id);
        if (!job) return "";
        return [extractMainJobTitle(job.title), job.description].filter(Boolean).join(" ");
      })
    );

    // Lấy tất cả job đã duyệt
    const allJobs = await Job.findAll({
      where: { approval_status: "Approved" },
      include: [
        { model: Company, as: "company", attributes: ["name", "logo"] },
        { model: User, as: "recruiter", attributes: ["full_name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Lọc ra các job chưa ứng tuyển
    const unsavedJobs = allJobs.filter(job => !appliedJobIds.includes(job.id));

    // Loại bỏ trùng lặp mô tả
    const textMap = new Map();
    const filteredJobs = [];
    for (const job of unsavedJobs) {
      const jobText = [extractMainJobTitle(job.title), job.description].filter(Boolean).join(" ");
      if (!textMap.has(jobText)) {
        textMap.set(jobText, true);
        filteredJobs.push({ job, jobText: preprocess(jobTextRaw) });
      }
    }

    // Tính điểm TF-IDF cho các job chưa ứng tuyển
    const jobScores = await Promise.all(
      filteredJobs.map(async ({ job, jobText }) => {
        const tfidfScore = getTfidfScoreRecruiter(jobText, appliedJobDescriptions);
        return { job, score: tfidfScore };
      })
    );

    // Lọc và sắp xếp theo score giảm dần
    const recommendedJobs = jobScores
      .filter(item => item && item.score >= 2.4)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.job);

    // Format dữ liệu trả về
    const formattedJobs = recommendedJobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      salary_range: job.salary_range,
      work_location: job.work_location,
      deadline: job.deadline,
      company: job.company,
      recruiter: job.recruiter,
    }));

    return res.status(200).json(formattedJobs);
  } catch (error) {
    console.error("❌ Lỗi khi lấy recommended jobs theo ứng tuyển:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = {
  createJob,
  updateJob,
  getAllJobsByRecruiter,
  getAllJobsByCandidate,
  getJobDetailByCandidate,
  getJobsByAdmin,
  getJobDetailByAdmin,
  approveJob,
  rejectJob,
  getRecommendedJobsByCandidate,
  getRecommendedJobsByAppliedJobs
};
