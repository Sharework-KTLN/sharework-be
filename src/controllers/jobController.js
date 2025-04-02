const dayjs = require("dayjs");
const Job = require("../models/Job");

// Create a new job
const createJob = async (req, res) => {
  try {
    console.log("req.body: ", req.body);
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
    // Chuyển đổi deadline sang kiểu DATE
    const formattedDeadline = dayjs(deadline, "YYYY-MM-DD").toDate();
    try {
      const newJob = await Job.create({
        title,
        required_skills,
        industry,
        salary_range,
        salary_type,
        deadline: formattedDeadline, // Lưu vào DB
        work_type,
        work_location,
        work_schedule,
        description,
        vacancies,
        recruiter_id,
        company_id,
      });
      res
        .status(201)
        .json({ message: "Thêm bài đăng thành công!", job: newJob });
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

const getJobByJobId = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra job_id có hợp lệ không
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "job_id không hợp lệ" });
    }

    const job_details = await Job.findOne({ where: { id: Number(id) } });
    // Nếu không có bài đăng nào, trả về mảng rỗng
    if (!job_details) {
      return res.status(200).json([]); // Trả về mảng rỗng thay vì lỗi 404
    }

    // Trả về danh sách bài đăng
    res.status(200).json(job_details);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
};

module.exports = { createJob, getAllJobsByRecruiter, getJobByJobId };
