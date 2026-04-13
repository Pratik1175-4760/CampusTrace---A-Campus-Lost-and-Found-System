export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === "development";
  
  // Log error for debugging
  console.error(`[${status}] ${err.message}`);
  if (isDevelopment) console.error(err.stack);

  // Don't expose internal error details in production
  const message = isDevelopment
    ? err.message || "Internal Server Error"
    : status === 500
    ? "An unexpected error occurred. Please try again later."
    : err.message || "An error occurred";

  const response = {
    success: false,
    message,
  };

  // Only include stack trace in development
  if (isDevelopment && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

// Validation error handler
export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400);
    this.field = field;
    this.name = "ValidationError";
  }
}