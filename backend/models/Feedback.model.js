import mongoose from "mongoose";
import { FEEDBACK_CATEGORY, FEEDBACK_STATUS, VALIDATION_RULES } from "../constants/validation.js";

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      minlength: [1, "Name cannot be empty"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      // Simple and efficient email regex (less vulnerable to ReDoS)
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address"
      ],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: Object.values(FEEDBACK_CATEGORY),
        message: `Category must be one of: ${Object.values(FEEDBACK_CATEGORY).join(", ")}`,
      },
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [VALIDATION_RULES.FEEDBACK_RATING_MIN, "Rating must be at least 1"],
      max: [VALIDATION_RULES.FEEDBACK_RATING_MAX, "Rating cannot exceed 5"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [VALIDATION_RULES.FEEDBACK_MESSAGE_MIN, `Message must be at least ${VALIDATION_RULES.FEEDBACK_MESSAGE_MIN} characters`],
      maxlength: [VALIDATION_RULES.FEEDBACK_MESSAGE_MAX, `Message cannot exceed ${VALIDATION_RULES.FEEDBACK_MESSAGE_MAX} characters`],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(FEEDBACK_STATUS),
        message: `Status must be one of: ${Object.values(FEEDBACK_STATUS).join(", ")}`,
      },
      default: FEEDBACK_STATUS.PENDING,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Add text index for search
feedbackSchema.index({ message: "text", category: 1 });

export const Feedback = mongoose.model("Feedback", feedbackSchema);
