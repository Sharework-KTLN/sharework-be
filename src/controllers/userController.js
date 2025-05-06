const dayjs = require("dayjs");
const { Op, fn, col, literal } = require('sequelize');
const moment = require('moment'); // nếu cần xử lý thời gian
const User = require("../models/User");
const SaveJob = require("../models/SaveJob");
const Job = require("../models/Job");
const Company = require("../models/Company");
const Major = require("../models/Major");
const Skill = require("../models/Skill");
const UserInterestedMajor = require("../models/UserInterestedMajor");
const UserSkill = require("../models/UserSkill");
const Application = require("../models/Application");
const Resume = require("../models/Resume");
const { use } = require("../routes/userRoutes");

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
            return res.status(400).json({ message: "Công việc đã được lưu trước đó." });
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
                    attributes: ["id", "name", "logo"]
                }
            ]
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
                job: job // Lấy đầy đủ thông tin công việc
            }
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

        // Trả về 200 ngay cả khi không có job nào
        return res.status(200).json({
            message: savedJobs.length
                ? "Danh sách công việc đã lưu"
                : "Chưa có công việc nào được lưu",
            savedJobs: savedJobs.map(item => ({
                ...item.job.toJSON(),
                saved_at: item.saved_at
            }))
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
            return res.status(404).json({ message: "Không tìm thấy công việc đã lưu" });
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
            attributes: ['major_id'],
        });
        // Chuyển đổi danh sách major_id hiện tại thành mảng
        const currentMajorIds = currentMajors.map(item => item.major_id);
        // Tìm các ngành mới mà người dùng chọn nhưng chưa có trong cơ sở dữ liệu
        const newMajors = majors.filter(majorId => !currentMajorIds.includes(majorId));
        // Tìm các ngành nghề cũ không còn trong danh sách mới, cần xóa
        const majorsToRemove = currentMajorIds.filter(majorId => !majors.includes(majorId));

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
            const userMajors = newMajors.map(majorId => ({
                user_id: userId,
                major_id: majorId,
            }));
            await UserInterestedMajor.bulkCreate(userMajors, {
                ignoreDuplicates: true,
            });;
        }
  
        return res.status(200).json({ message: "Majors updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const getUserInterestedMajors = async (req, res) => {
    const userId = req.params.userId;
    // Kiểm tra nếu userId không tồn tại hoặc không hợp lệ
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }
  
    try {
      // Lấy danh sách các ngành nghề mà người dùng quan tâm
        const userMajors = await UserInterestedMajor.findAll({
            where: { user_id: userId },
            include: [
            {
                model: Major,
                attributes: ['id', 'name'],  // Lấy id và tên ngành
            },
            {
                model: User,
                attributes: ['id', 'full_name'], // Lấy thông tin người dùng (nếu cần)
            }
            ]
        });
    
        // Kiểm tra nếu không có dữ liệu
        if (!userMajors || userMajors.length === 0) {
            return res.status(404).json({ message: 'No majors found for this user.' });
        }
    
        // Trả về danh sách majors của người dùng
        res.json(userMajors.map(item => ({
            majorId: item.major_id,
            majorName: item.Major.name,
        })));
    } catch (error) {
        console.error("Error fetching user majors:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUserSkills = async (req, res) => {
    const userId = req.params.userId;
    // Kiểm tra nếu userId không tồn tại hoặc không hợp lệ
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }
  
    try {
      // Lấy danh sách các kỹ năng
        const userSkills = await UserSkill.findAll({
            where: { user_id: userId },
            include: [
            {
                model: Skill,
                attributes: ['id', 'name'],  // Lấy id và tên ngành
            },
            {
                model: User,
                attributes: ['id', 'full_name'], // Lấy thông tin người dùng (nếu cần)
            }
            ]
        });
    
        // Kiểm tra nếu không có dữ liệu
        if (!userSkills || userSkills.length === 0) {
            return res.status(404).json({ message: 'No skills found for this user.' });
        }
    
        // Trả về danh sách skills của người dùng
        res.json(userSkills.map(item => ({
            skillId: item.Skill.id,
            skillName : item.Skill.name,
        })));
    } catch (error) {
        console.error("Error fetching user skillrs:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const whereCondition = role ? { role } : {};  // nếu có role thì lọc, không thì lấy hết
    
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
        const userId = req.params.id;  // Lấy ID từ URL params

        // Lấy thông tin người dùng từ bảng User
        const user = await User.findByPk(userId, {
            include: [
                { 
                    model: UserSkill, 
                    include: [
                        { 
                            model: Skill, 
                            as: "skill", 
                            attributes: ["id", "name", "description"]
                        }
                    ]
                },
                { 
                    model: UserInterestedMajor, 
                    include: [
                        { 
                            model: Major, 
                            as: "major",
                            attributes: ["id", "name", "description"]
                        }
                    ] 
                },
                { model: Resume },
                { 
                    model: SaveJob,
                    include: [
                        {
                            model: Job, 
                            as: "job",  // Dùng alias "job" cho Job
                            attributes: ["id", "title", "work_location", "company_id"],  // Chỉ lấy các trường cần thiết
                            include: [
                                {
                                    model: Company,  // Bao gồm mối quan hệ với Company
                                    as: "company",  // Alias "company"
                                    attributes: ["name"]  // Lấy tên công ty
                                }
                            ]
                        }
                    ]
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
            ...user.toJSON(),  // Convert sequelize instance to plain object
            UserSkills: user.UserSkills ? user.UserSkills.map(userSkill => ({
                id: userSkill.skill.id,
                skill: userSkill.skill.name,
                description: userSkill.skill.description
            })) : [],  // Nếu không có UserSkills thì gán là mảng rỗng
            UserInterestedMajors: user.UserInterestedMajors ? user.UserInterestedMajors.map(userInterestedMajor => ({
                id: userInterestedMajor.major.id,
                major: userInterestedMajor.major.name,
                description: userInterestedMajor.major.description
            })) : [],  // Nếu không có UserInterestedMajors thì gán là mảng rỗng
            SavedJobs: user.SaveJobs ? user.SaveJobs.map(saveJob => ({
                id: saveJob.job.id,
                job_title: saveJob.job.title,
                company_name: saveJob.job.company ? saveJob.job.company.name : 'Không có tên công ty',
                job_location: saveJob.job.work_location,
                saved_at: saveJob.saved_at,
            })) : []  // Nếu không có SaveJobs thì gán là mảng rỗng
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
            totalJobs
        });
    } catch (error) {
        console.error("Lỗi khi lấy thống kê:", error);
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy thống kê",
            error: error.message
        });
    }
};

const getMonthlyStats = async (req, res) => {
    try {
        const startOfYear = moment().startOf('year').toDate();
        const endOfYear = moment().endOf('year').toDate();

        // Group theo tháng
        const userStats = await User.findAll({
            attributes: [
                [fn('to_char', col('created_at'), 'MM/YYYY'), 'month'], // Đổi sang định dạng MM/YYYY
                [fn('COUNT', col('*')), 'total']
            ],
            where: {
                created_at: {
                    [Op.between]: [startOfYear, endOfYear]
                }
            },
            group: [literal("month")],
            order: [literal("month ASC")]
        });

        const companyStats = await Company.findAll({
            attributes: [
                [fn('to_char', col('created_at'), 'MM/YYYY'), 'month'], // Đổi sang định dạng MM/YYYY
                [fn('COUNT', col('*')), 'total']
            ],
            where: {
                created_at: {
                    [Op.between]: [startOfYear, endOfYear]
                }
            },
            group: [literal("month")],
            order: [literal("month ASC")]
        });

        const jobStats = await Job.findAll({
            attributes: [
                [fn('to_char', col('created_at'), 'MM/YYYY'), 'month'], // Đổi sang định dạng MM/YYYY
                [fn('COUNT', col('*')), 'total']
            ],
            where: {
                created_at: {
                    [Op.between]: [startOfYear, endOfYear]
                }
            },
            group: [literal("month")],
            order: [literal("month ASC")]
        });

        // Tập hợp tháng và chuẩn hóa kết quả (ghép lại theo từng tháng)
        const allMonths = new Set();
        userStats.forEach(u => allMonths.add(u.get('month')));
        companyStats.forEach(c => allMonths.add(c.get('month')));
        jobStats.forEach(j => allMonths.add(j.get('month')));

        const result = Array.from(allMonths).sort().map(month => {
            const users = userStats.find(u => u.get('month') === month)?.get('total') || 0;
            const companies = companyStats.find(c => c.get('month') === month)?.get('total') || 0;
            const jobs = jobStats.find(j => j.get('month') === month)?.get('total') || 0;

            return {
                month,
                totalUsers: parseInt(users),
                totalCompanies: parseInt(companies),
                totalJobs: parseInt(jobs)
            };
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi khi lấy thống kê theo tháng:", error);
        res.status(500).json({
            message: "Đã xảy ra lỗi khi lấy thống kê theo tháng",
            error: error.message
        });
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
    getMonthlyStats
};
