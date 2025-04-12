const dayjs = require("dayjs");
const User = require("../models/User");
const SaveJob = require("../models/SaveJob");
const Job = require("../models/Job");
const Company = require("../models/Company");

const saveJobByUser = async (req, res) => {
    try {
        console.log(req.user);
        const { jobId } = req.body;
        const userId = req.user?.id; // hoặc lấy từ session/token tùy bạn dùng gì
  
        if (!userId || !jobId) {
            return res.status(400).json({ message: "Thiếu userId hoặc jobId" });
        }
  
        // Kiểm tra xem đã lưu chưa
        const existing = await SaveJob.findOne({
            where: {
            candidate_id: userId,
            job_id: jobId,
            },
        });
  
        if (existing) {
            return res.status(400).json({ message: "Công việc đã được lưu trước đó." });
        }
  
        const savedJob = await SaveJob.create({
            candidate_id: userId,
            job_id: jobId,
        });
  
        return res.status(201).json({ message: "Lưu công việc thành công", savedJob });
    }   catch (error) {
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
            where: {
                candidate_id: userId,
            },
            include: [
                {
                    model: Job,
                    as: "job",
                    attributes: ["id", "title", "salary_range", "status", "company_id", "work_location", "specialize", "deadline"],
                    include: [
                        {
                            model: Company,
                            as: "company",
                            attributes: ["id", "name", "logo"]
                        }
                    ]
                }
            ]
        });

        if (!savedJobs.length) {
            return res.status(404).json({ message: "Chưa có công việc nào được lưu" });
        }

        return res.status(200).json({
            message: "Danh sách công việc đã lưu",
            savedJobs: savedJobs.map(item => ({
                ...item.job.toJSON(), // Chuyển đổi job thành đối tượng thông thường
                saved_at: item.saved_at // Thêm thời gian lưu vào kết quả
            }))
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách công việc yêu thích:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    saveJobByUser,
    getJobsFavorite
};
