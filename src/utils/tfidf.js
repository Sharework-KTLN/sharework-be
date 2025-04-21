const natural = require("natural");
const Tfidf = natural.TfIdf;

// Hàm tính điểm TF-IDF

const getTfidfScore = (text, jobIds) => {
  const tfidf = new Tfidf();

  // Giả sử bạn có các mô tả công việc của người dùng đã lưu và ứng tuyển
  jobIds.forEach((jobId) => {
    const jobDescription = getJobDescriptionById(jobId); // Hàm giả định lấy mô tả công việc theo ID
    tfidf.addDocument(jobDescription);
  });

  // Tính điểm TF-IDF cho công việc hiện tại
  const jobTFIDFScore = tfidf.tfidfs(text, (i, measure) => {
    if (i === 0) return measure; // Sử dụng mức độ TF-IDF của công việc hiện tại
  });

  return jobTFIDFScore[0] || 0; // Trả về điểm TF-IDF hoặc 0 nếu không có điểm
};

module.exports = { getTfidfScore };
