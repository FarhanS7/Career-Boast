// server/src/middlewares/error.middleware.js
export default function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      error: "Duplicate entry",
      message: "A record with this value already exists",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      error: "Not found",
      message: "The requested resource was not found",
    });
  }

  // Validation errors (Zod)
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: err.errors,
    });
  }

  // Multer file upload errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      error: "File upload error",
      message: err.message,
    });
  }

  // Default error
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
