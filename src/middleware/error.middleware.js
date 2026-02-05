{
  /* const AppError = require("../utils/AppError");

module.exports = (err, req, res, next) => {
  console.error("ERROR STACK:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    status: false,
    message: err.message || "Internal Server Error",
  });
};
*/
}

const errorHandler = (err, req, res, next) => {
  // Log error untuk debugging
  console.error("❌ Error:", err);

  // Default error values
  let statusCode = err.http_code || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Prisma errors
  if (err.code === "P2002") {
    statusCode = 409;
    message = "Duplicate entry. Resource already exists.";
  } else if (err.code === "P2025") {
    statusCode = 404;
    message = "Resource not found.";
  } else if (err.code && err.code.startsWith("P")) {
    statusCode = 400;
    message = "Database operation failed.";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired.";
  }

  // Multer errors
  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size exceeds limit (5MB).";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files uploaded.";
    } else {
      message = "File upload error.";
    }
  }

  // Validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  }

  // Response
  const response = {
    success: false,
    message: message,
  };

  // Include stack trace ONLY in development
  if (process.env.NODE_ENV !== "production") {
    response.error = err.message;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
