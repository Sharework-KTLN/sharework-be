const natural = require("natural");
const Tfidf = natural.TfIdf;

// Hàm tính điểm TF-IDF

// const getTfidfScore = (text, jobIds) => {
//   const tfidf = new Tfidf();

//   // Giả sử bạn có các mô tả công việc của người dùng đã lưu và ứng tuyển
//   jobIds.forEach((jobId) => {
//     const jobDescription = getJobDescriptionById(jobId); // Hàm giả định lấy mô tả công việc theo ID
//     tfidf.addDocument(jobDescription);
//   });

//   // Tính điểm TF-IDF cho công việc hiện tại
//   const jobTFIDFScore = tfidf.tfidfs(text, (i, measure) => {
//     if (i === 0) return measure; // Sử dụng mức độ TF-IDF của công việc hiện tại
//   });

//   return jobTFIDFScore[0] || 0; // Trả về điểm TF-IDF hoặc 0 nếu không có điểm
// };

/**
 * @param {string} targetText - Văn bản cần tính điểm tương đồng (ví dụ: mô tả ứng viên, mô tả công việc mới)
 * @param {string[]} comparedTexts - Danh sách văn bản dùng để so sánh
 * @returns {number} - Điểm TF-IDF cao nhất
 */
const getTfidfScore = (targetText, comparedTexts) => {
  const tfidf = new Tfidf();

  // Thêm tất cả văn bản vào corpus
  comparedTexts.forEach((text) => {
    tfidf.addDocument(text);
  });

  // So sánh văn bản cần tìm với toàn bộ document
  let maxScore = 0;
  tfidf.tfidfs(targetText, (i, measure) => {
    if (measure > maxScore) {
      maxScore = measure;
    }
  });

  return maxScore;
};

module.exports = { getTfidfScore };
