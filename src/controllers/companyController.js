const Company = require("../models/Company");
const User = require("../models/User")
const Job = require("../models/Job");

const getAllCompaniesByCandidate = async (req, res) => {
    try {
        // Bắt đầu truy vấn dữ liệu công ty
        const companies = await Company.findAll({
            include: [
            {
                model: User, // Liên kết với User để lấy thông tin người tuyển dụng
                as: 'recruiter', // Đặt tên alias là 'recruiter'
                attributes: ['full_name'] // Lấy tên người tuyển dụng
            },
            {
                model: Job,
                as: 'Jobs',
                attributes: ['id'] // Chỉ cần id để đếm số lượng
            }
            ],
            order: [['createdAt', 'DESC']], // Sắp xếp theo thời gian tạo công ty
        });
    
        if (!companies || companies.length === 0) {
            // Nếu không có công ty nào
            return res.status(404).json({ message: "Không tìm thấy công ty nào." });
        }
    
        // Định dạng lại dữ liệu trước khi trả về client
        const formattedCompanies = companies.map(company => ({
            id: company.id,
            name: company.name,
            address: company.address,
            phone: company.phone,
            email: company.email,
            logo: company.logo || '', // Logo công ty
            specialize: company.specialize || '',
            image_company: company.image_company || '',
            link: company.link || '',
            location: company.location || '',
            job_count: company.Jobs?.length || 0, // Số lượng công việc đăng tuyển
            description: company.description || '',
            recruiter_name: company.recruiter?.full_name || 'Không rõ', // Lấy tên người tuyển dụng nếu có
        }));
    
        // Trả về dữ liệu đã được định dạng
        res.status(200).json(formattedCompanies);
        } catch (error) {
        // In thông báo lỗi chi tiết hơn trong console và trả lại cho client
        console.error("Lỗi khi lấy thông tin công ty:", error);
        
        if (error.name === 'SequelizeDatabaseError') {
            // Lỗi cơ sở dữ liệu (ví dụ: câu truy vấn sai hoặc kết nối gặp sự cố)
            return res.status(500).json({ message: "Lỗi cơ sở dữ liệu", error: error.message });
        } else if (error.name === 'SequelizeValidationError') {
            // Lỗi xác thực của Sequelize (ví dụ: lỗi khi model không khớp với dữ liệu)
            return res.status(400).json({ message: "Lỗi xác thực dữ liệu", error: error.message });
        } else {
            // Lỗi khác không xác định
            return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
        }
    }
};
const getCompanyDetail = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Tìm công ty theo ID và lấy danh sách công việc
      const company = await Company.findOne({
        where: { id },
        include: [
          {
            model: User,
            as: "recruiter",
            attributes: ["full_name"],
          },
          {
            model: Job,
            as: "Jobs",
            attributes: ["id", "title", "description", "salary_range", "work_location"],
          },
        ],
      });
  
      if (!company) {
        return res.status(404).json({ message: "Không tìm thấy công ty này." });
      }
  
      // Tính số lượng công việc liên kết với công ty
      const jobCount = await Job.count({ where: { company_id: company.id } });
  
      const formattedCompany = {
        id: company.id,
        name: company.name,
        address: company.address,
        phone: company.phone,
        email: company.email,
        logo: company.logo || '',
        specialize: company.specialize || '',
        image_company: company.image_company || '',
        link: company.link || '',
        location: company.location || '',
        job_count: jobCount,  // Hiển thị số lượng công việc
        description: company.description || '',
        recruiter_name: company.recruiter?.full_name || 'Không rõ',
        jobs: company.Jobs || [],
      };
  
      res.status(200).json(formattedCompany);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin công ty:", error);
      res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
  };
module.exports = {getAllCompaniesByCandidate, getCompanyDetail};