import rateLimit from "express-rate-limit";
import { AppError } from "./errorHandler.js";
import { VALIDATION_RULES } from "../constants/validation.js";

// General rate limiter for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: false, // disable `RateLimit-*` headers
  skip: (req) => process.env.NODE_ENV === "development", // Skip in development
});

// Stricter limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again after 15 minutes",
  skipSuccessfulRequests: false,
  skip: (req) => process.env.NODE_ENV === "development",
});

// Limiter for feedback/reporting endpoints
export const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 submissions per hour
  message: "Too many submissions. Please try again later.",
  skipSuccessfulRequests: false,
  skip: (req) => process.env.NODE_ENV === "development",
});

// Validate pagination parameters
export const validatePagination = (req, res, next) => {
  let { page = 1, limit = VALIDATION_RULES.DEFAULT_LIMIT } = req.query;

  // Parse and validate
  page = Math.max(1, Math.min(parseInt(page) || 1, VALIDATION_RULES.MAX_PAGE));
  limit = Math.max(
    VALIDATION_RULES.MIN_LIMIT,
    Math.min(parseInt(limit) || VALIDATION_RULES.DEFAULT_LIMIT, VALIDATION_RULES.MAX_LIMIT)
  );

  req.pagination = { page, limit };
  next();
};

// Sanitize string input to prevent NoSQL injection
export const sanitizeQuery = (value) => {
  if (typeof value !== "string") return value;
  // Remove dangerous characters for MongoDB
  return value.replace(/[\$\{\}]/g, "");
};

// Validate ObjectId
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }
    next();
  };
};
