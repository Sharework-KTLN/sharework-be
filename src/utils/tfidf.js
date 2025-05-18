const natural = require("natural");
const Job = require("../models/Job");
const Tfidf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

const stopwords = new Set([
  "và", "là", "của", "có", "cho", "để", "trong", "các", "một", "những", "với",
  "đã", "ra", "đó", "này", "tôi", "bạn", "anh", "chị", "em", "chúng", "họ",
  "cũng", "như", "này", "làm", "tôi", "được", "đến", "còn", "nếu", "thì", "ở",
]);

function preprocess(text) {
  if (!text) return "";

  // Chuyển chữ thường
  let lowerText = text.toLowerCase();

  // Loại bỏ dấu câu và ký tự đặc biệt, thay bằng khoảng trắng
  lowerText = lowerText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+"]/g, " ");

  // Tách từ
  const tokens = tokenizer.tokenize(lowerText);

  // Lọc stopwords
  const filteredTokens = tokens.filter(token => !stopwords.has(token));

  // Nối lại thành chuỗi
  return filteredTokens.join(" ");
}

const extractMainJobTitle = (title) => {
  if (!title) return "";
  const parts = title.split("/");
  return parts[parts.length - 1].trim();
};

const getJobDescriptionById = async (jobId) => {
  const job = await Job.findByPk(jobId, {
    attributes: ["title", "description"],
  });
  if (!job) return "";

  const mainTitle = extractMainJobTitle(job.title);
  const fullText = `${mainTitle} ${job.description}`;
  return preprocess(fullText);
};

// Hàm tính điểm TF-IDF
// const getTfidfScore = async (text, jobIds) => {
//   const tfidf = new Tfidf();

//   for (const jobId of jobIds) {
//     const jobDescription = await getJobDescriptionById(jobId);
//     tfidf.addDocument(jobDescription);
//   }

//   let score = 0;
//   tfidf.tfidfs(text, function (i, measure) {
//     if (i === 0) score = measure;
//   });

//   return score;
// };
// const getTfidfScore = async (text, jobIds) => {
//   const tfidf = new Tfidf();

//   // Thêm từng mô tả công việc vào tfidf corpus
//   for (const jobId of jobIds) {
//     const jobDescription = await getJobDescriptionById(jobId);
//     tfidf.addDocument(jobDescription);
//   }

//   let maxScore = 0;

//   // Tính điểm TF-IDF giữa text với từng document
//   tfidf.tfidfs(text, function (i, measure) {
//     if (measure > maxScore) {
//       maxScore = measure;
//     }
//   });

//   return maxScore;
// };
const getTfidfScore = async (text, jobIds) => {
  const tfidf = new Tfidf();

  // Lấy mô tả của các job đã lưu
  let jobDescriptions = await Promise.all(
    jobIds.map((id) => getJobDescriptionById(id))
  );

  // Loại bỏ mô tả trùng nhau (giúp tránh nhân đôi điểm)
  jobDescriptions = [...new Set(jobDescriptions)];

  jobDescriptions.forEach((desc) => tfidf.addDocument(desc));

  const cleanText = preprocess(text);

  let maxScore = 0;
  tfidf.tfidfs(cleanText, (i, measure) => {
    if (measure > maxScore) maxScore = measure;
  });

  return maxScore;
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

module.exports = { getTfidfScore, getTfidfScoreRecruiter, getJobDescriptionById, extractMainJobTitle, preprocess};
