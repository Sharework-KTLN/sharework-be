const WORK_TYPE_MAP = {
  full_time: "Toàn thời gian",
  part_time: "Bán thời gian",
  remote: "Làm việc từ xa",
};

const SALARY_RANGE_MAP = {
  negotiable: "Thỏa thuận",
  "<10_trieu": "Dưới 10 triệu",
  "10-15_trieu": "10 - 15 triệu",
  "15-20_trieu": "15 - 20 triệu",
  "20-25_trieu": "20 - 25 triệu",
  ">30_trieu": "Trên 30 triệu",
};

const INDUSTRY_MAP = {
  it: "Công nghệ thông tin",
  marketing: "Marketing",
  finance: "Tài chính / Ngân hàng",
  education: "Giáo dục / Đào tạo",
  design: "Thiết kế / Sáng tạo",
  sales: "Bán hàng / Kinh doanh",
  customer_service: "Chăm sóc khách hàng",
  engineering: "Kỹ thuật",
  human_resources: "Nhân sự",
  legal: "Pháp lý / Luật",
  logistics: "Vận chuyển / Logistics",
  media: "Truyền thông / Báo chí",
  medical: "Y tế / Sức khỏe",
  construction: "Xây dựng",
  hospitality: "Nhà hàng / Khách sạn",
  real_estate: "Bất động sản",
  manufacturing: "Sản xuất / Chế biến",
  agriculture: "Nông nghiệp / Thực phẩm",
  environment: "Môi trường",
  science: "Nghiên cứu / Khoa học",
};

const EXPERIENCE_MAP = {
  no_experience: "Không yêu cầu kinh nghiệm",
  "<1": "Dưới 1 năm",
  "1-2": "1 - 2 năm",
  "2-3": "2 - 3 năm",
  "3-4": "3 - 4 năm",
  "4-5": "4 - 5 năm",
  ">5": "Trên 5 năm",
};

const EDUCATION_MAP = {
  university: "Đại học",
  college: "Cao đẳng",
};

const WORK_LEVEL_MAP = {
  intern: "Thực tập sinh",
  staff: "Nhân viên",
};

module.exports = {
  WORK_TYPE_MAP,
  SALARY_RANGE_MAP,
  INDUSTRY_MAP,
  EXPERIENCE_MAP,
  EDUCATION_MAP,
  WORK_LEVEL_MAP,
};
