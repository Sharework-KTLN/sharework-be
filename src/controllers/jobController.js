const dayjs = require("dayjs");
const Job = require("../models/Job");
const Company = require("../models/Company");
const User = require("../models/User");

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
        specialize,
        salary_range,
        salary_type,
        deadline: formattedDeadline, // Lưu vào DB
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
    const jobs = await Job.findAll({
      include: [
        {
          model: Company, // Liên kết với Company để lấy thông tin công ty
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
      company_name: job.Company?.name || "Không rõ", // Lấy tên công ty nếu có
      recruiter_name: job.recruiter?.full_name || "Không rõ", // Lấy tên người tuyển dụng nếu có
      company_logo: job.Company?.logo || "",
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

const getJobDetailByCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findOne({
      where: { id },
      include: [
        {
          model: Company,
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
      company_name: job.Company?.name || "Không rõ",
      recruiter_name: job.recruiter?.full_name || "Không rõ",
      company_logo: job.Company?.logo || "",
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
};
