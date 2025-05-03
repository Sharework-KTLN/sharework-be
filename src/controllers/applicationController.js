const Application = require("../models/Application");

const uploadCV = async (req, res) => {
  try {
    // Sau khi upload xong qua middleware, file sẽ có req.file
    if (!req.file)
      return res.status(400).json({ error: "Không có file được tải lên!" });

    const { originalname, path } = req.file;
    const { fullName, email, phone, coverLetter, jobId, candidateId } =
      req.body;

    // Tạo mới bản ghi application
    const newApplication = await Application.create({
      full_name: fullName,
      phone: phone,
      email: email,
      cover_letter: coverLetter,
      file_name: originalname,
      cv_url: path,
      status: "pending",
      job_id: jobId,
      candidate_id: candidateId,
    });

    return res.status(200).json({
      message: "Ứng tuyển công việc thành công!",
      application: newApplication,
    });
  } catch (err) {
    console.error("Lỗi khi ứng tuyển công việc:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = { uploadCV };
