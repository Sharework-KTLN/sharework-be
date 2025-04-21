const dayjs = require("dayjs");
const Job = require("../models/Job");
const Company = require("../models/Company");
const User = require("../models/User");
const { getTfidfScore } = require("../utils/tfidf");

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
      work_type,
      work_location,
      work_schedule,
      description,
      vacancies,
      recruiter_id,
      company_id,
    } = req.body;

    // Chuyển đổi deadline sang kiểu Date (nếu có)
    const formattedDeadline = deadline
      ? dayjs(deadline, "YYYY-MM-DD").toDate()
      : undefined;

    // Tạo object chứa các trường cần cập nhật
    const updatedFields = {
      title,
      required_skills,
      industry,
      salary_range,
      salary_type,
      deadline: formattedDeadline,
      work_type,
      work_location,
      work_schedule,
      description,
      vacancies,
      recruiter_id,
      company_id,
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
    // ------------Ứng dụng thuật toán tf-idf để gợi ý việc làm phù hợp------------
    // 1. Lấy tất cả các công việc từ cơ sở dữ liệu
    // 2. Lấy tất cả công việc: người dùng đã ứng tuyển, người dùng đã yêu thích
    // 3. Tính toán độ tương đồng giữa các công việc và người dùng (áp dùng TF-IDF)
    // 4. Sắp xếp công việc theo độ tương đồng
    // 5. Định dạng lại dữ liệu công việc trước khi trả về cho client
    // 6. Trả về danh sách công việc đã được định dạng
    const jobs = await Job.findAll({
      include: [
        {
          model: Company, // Liên kết với Company để lấy thông tin công ty
          as: "company",
          attributes: ["name", "logo"], // Lấy tên công ty
        },
        {
          model: User, // Liên kết với User để lấy thông tin người tuyển dụng
          as: "recruiter", // Đặt tên alias là 'recruiter'
          attributes: ["full_name"], // Lấy tên người tuyển dụng
        },
      ],
      order: [["createdAt", "DESC"]], // Sắp xếp theo thời gian tạo công việc
    });

    // Định dạng lại dữ liệu trước khi trả về client
    const formattedJobs = jobs.map((job) => ({
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

    // Trả về dữ liệu đã được định dạng
    res.status(200).json(formattedJobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// API lấy tất cả các công việc, đồng thời tính toán điểm TF-IDF và sắp xếp theo độ phù hợp
// const getAllJobsByCandidate = async (req, res) => {
//   try {
//     const userId = req.user.id; // Lấy userId từ token hoặc session

//     // 1. Lấy tất cả công việc
//     const jobs = await Job.findAll({
//       include: [
//         {
//           model: Company,
//           as: "company",
//           attributes: ["name", "logo"],
//         },
//         {
//           model: User,
//           as: "recruiter",
//           attributes: ["full_name"],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     // 2. Lấy các công việc mà người dùng đã ứng tuyển hoặc lưu
//     const appliedJobs = await Application.findAll({
//       where: { candidate_id: userId },
//       attributes: ['job_id']
//     });
//     const savedJobs = await SaveJob.findAll({
//       where: { user_id: userId },
//       attributes: ['job_id']
//     });

//     const appliedAndSavedJobIds = [
//       ...new Set([
//         ...appliedJobs.map(job => job.job_id),
//         ...savedJobs.map(job => job.job_id),
//       ])
//     ];

//     // 3. Tính điểm TF-IDF cho tất cả công việc
//     const jobScores = jobs.map(job => {
//       const jobDescription = job.description || '';
//       const jobTitle = job.title || '';
//       const jobText = `${jobTitle} ${jobDescription}`; // Ghép tiêu đề và mô tả công việc

//       // Tính điểm TF-IDF dựa trên mô tả và tiêu đề công việc
//       const tfidfScore = getTFIDFScore(jobText, appliedAndSavedJobIds);

//       return {
//         job,
//         score: tfidfScore, // Điểm TF-IDF
//       };
//     });

//     // 4. Sắp xếp công việc theo điểm TF-IDF (công việc có điểm cao nhất sẽ xuất hiện đầu tiên)
//     const sortedJobs = jobScores.sort((a, b) => b.score - a.score).map(jobScore => jobScore.job);

//     // 5. Định dạng lại dữ liệu công việc
//     const formattedJobs = sortedJobs.map((job) => ({
//       id: job.id,
//       title: job.title,
//       description: job.description,
//       status: job.status,
//       experience_required: job.experience_required || "",
//       salary_range: job.salary_range,
//       work_location: job.work_location,
//       created_at: job.createdAt,
//       updated_at: job.updatedAt,
//       company_name: job.company ? job.company.name : "Không rõ",
//       recruiter_name: job.recruiter ? job.recruiter.full_name : "Không rõ",
//       company_logo: job.company ? job.company.logo : "",
//       company_id: job.company_id,
//       recruiter_id: job.recruiter_id,
//       required_skills: job.required_skills,
//       industry: job.industry,
//       salary_type: job.salary_type,
//       deadline: job.deadline,
//       work_type: job.work_type,
//       work_schedule: job.work_schedule,
//       vacancies: job.vacancies,
//       benefits: job.benefits,
//       educational_level: job.educational_level,
//       work_level: job.work_level,
//       candidate_required: job.candidate_required,
//     }));

//     // 6. Trả về dữ liệu đã được sắp xếp và định dạng
//     res.status(200).json(formattedJobs);
//   } catch (error) {
//     console.error("Error fetching jobs:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

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
    const jobs = await Job.findAll({
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

    const formattedJobs = jobs.map((job) => ({
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
    }));

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
module.exports = {
  createJob,
  getAllJobsByRecruiter,
  getAllJobsByCandidate,
  getJobDetailByCandidate,
  getJobsByAdmin,
  getJobDetailByAdmin,
};
