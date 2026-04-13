// Status enums
export const ITEM_STATUS = {
  REPORTED: "reported",
  VERIFIED: "verified",
  COLLECTED: "collected",
};

export const SUBMISSION_TYPE = {
  WITH_FINDER: "with_finder",
  SUBMITTED_TO_CENTER: "submitted_to_center",
};

export const FEEDBACK_STATUS = {
  PENDING: "pending",
  REVIEWED: "reviewed",
  RESOLVED: "resolved",
};

export const FEEDBACK_CATEGORY = {
  BUG_REPORT: "Bug Report",
  FEATURE_REQUEST: "Feature Request",
  IMPROVEMENT: "improvement",
  OTHER: "Other",
};

export const CONTACT_TYPE = {
  PHONE: "phone",
  EMAIL: "email",
};

// Validation rules
export const VALIDATION_RULES = {
  // Pagination
  MIN_PAGE: 1,
  MAX_PAGE: 1000,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  DEFAULT_LIMIT: 20,

  // Feedback
  FEEDBACK_MESSAGE_MIN: 10,
  FEEDBACK_MESSAGE_MAX: 1000,
  FEEDBACK_RATING_MIN: 1,
  FEEDBACK_RATING_MAX: 5,

  // Item description
  DESCRIPTION_MAX: 500,

  // File sizes
  IMAGE_MAX_SIZE: 15 * 1024 * 1024, // 15MB
};

// API response templates
export const API_RESPONSE = {
  SUCCESS: (message = "Success", data = null) => ({
    success: true,
    message,
    ...(data && { data }),
  }),
  ERROR: (message = "An error occurred", statusCode = 400) => ({
    success: false,
    message,
    statusCode,
  }),
};

export const Transaction_ACTIONS = {
  ITEM_REPORTED: "ITEM_REPORTED",
  ADMIN_VERIFIED: "ADMIN_VERIFIED",
  ITEM_COLLECTED: "ITEM_COLLECTED",
};
