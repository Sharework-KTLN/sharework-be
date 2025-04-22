const natural = require("natural");
const Job  = require('../models/Job');
const Tfidf = natural.TfIdf;

const getJobDescriptionById = async (jobId) => {
  const job = await Job.findByPk(jobId, {
    attributes: ['title', 'description']
  });
  if (!job) return '';
  return `${job.title} ${job.description}`;
};

// Hàm tính điểm TF-IDF
const getTfidfScore = async (text, jobIds) => {
  const tfidf = new Tfidf();

  for (const jobId of jobIds) {
    const jobDescription = await getJobDescriptionById(jobId);
    tfidf.addDocument(jobDescription);
  }

  let score = 0;
  tfidf.tfidfs(text, function(i, measure) {
    if (i === 0) score = measure;
  });

  return score;
};

module.exports = { getTfidfScore };
