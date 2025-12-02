export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Prisma errors
  if (err.code === "P2002") {
    return res.status(409).json({
      error: "Duplicate entry",
      message: "A record with this value already exists",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      error: "Not found",
      message: "The requested resource was not found",
    });
  }

  // Validation errors (Zod)
  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "Validation error",
      details: err.errors,
    });
  }

  // Multer file upload errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      error: "File upload error",
      message: err.message,
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
