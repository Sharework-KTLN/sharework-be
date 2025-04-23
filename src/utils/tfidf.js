const natural = require("natural");
const Job = require("../models/Job");
const Tfidf = natural.TfIdf;

const getJobDescriptionById = async (jobId) => {
  const job = await Job.findByPk(jobId, {
    attributes: ["title", "description"],
  });
  if (!job) return "";
  return `${job.title} ${job.description}`;
};

/**
 * @param {string} targetText - Văn bản cần tính điểm tương đồng (ví dụ: mô tả ứng viên, mô tả công việc mới)
 * @param {string[]} comparedTexts - Danh sách văn bản dùng để so sánh
 * @returns {number} - Điểm TF-IDF cao nhất
 */
const getTfidfScoreRecruiter = (targetText, comparedTexts) => {
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

/**
 * @param {string} targetText - Văn bản cần tính điểm tương đồng (ví dụ: mô tả ứng viên, mô tả công việc mới)
 * @param {string[]} comparedTexts - Danh sách văn bản dùng để so sánh
 * @returns {number} - Điểm TF-IDF cao nhất
 */
const getTfidfScore = async (targetText, comparedTexts) => {
  const tfidf = new Tfidf();

  for (const jobId of jobIds) {
    const jobDescription = await getJobDescriptionById(jobId);
    tfidf.addDocument(jobDescription);
  }

  let score = 0;
  tfidf.tfidfs(text, function (i, measure) {
    if (i === 0) score = measure;
  });

  return score;
};

module.exports = { getTfidfScore, getTfidfScoreRecruiter };
