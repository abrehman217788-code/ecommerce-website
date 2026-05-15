class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      if (!err.isOperational) console.error("Unexpected error:", err);
      res.status(err.statusCode).json({
        error: err.isOperational ? err.message : "Internal server error",
      });
    });
  };
}

module.exports = { AppError, catchAsync };
