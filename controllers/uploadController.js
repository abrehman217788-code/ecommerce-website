const { AppError } = require("../utils/AppError");

exports.uploadSingle = (req, res) => {
  if (!req.file) throw new AppError("No file uploaded", 400);
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
};

exports.uploadMultiple = (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError("No files uploaded", 400);
  }
  const urls = req.files.map((f) => `/uploads/${f.filename}`);
  res.json({ urls });
};
