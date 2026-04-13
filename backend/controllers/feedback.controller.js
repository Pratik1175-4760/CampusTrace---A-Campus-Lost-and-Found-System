import { Feedback } from "../models/Feedback.model.js";
import { AppError, ValidationError } from "../middleware/errorHandler.js";
import { FEEDBACK_CATEGORY, FEEDBACK_STATUS, VALIDATION_RULES } from "../constants/validation.js";

export const submitFeedback = async (req, res, next) => {
  try {
    const { name, email, category, rating, message } = req.body;

    // Validate all fields present
    if (!name || !email || !category || rating === undefined || !message) {
      throw new AppError("All fields are required", 400);
    }

    // Validate name
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new AppError("Name must be a non-empty string", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Please provide a valid email address", 400);
    }

    // Validate category
    if (!Object.values(FEEDBACK_CATEGORY).includes(category)) {
      throw new AppError(`Invalid category. Must be one of: ${Object.values(FEEDBACK_CATEGORY).join(", ")}`, 400);
    }

    // Validate rating
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < VALIDATION_RULES.FEEDBACK_RATING_MIN || ratingNum > VALIDATION_RULES.FEEDBACK_RATING_MAX) {
      throw new AppError(`Rating must be between ${VALIDATION_RULES.FEEDBACK_RATING_MIN} and ${VALIDATION_RULES.FEEDBACK_RATING_MAX}`, 400);
    }

    // Validate message
    if (typeof message !== "string" || message.trim().length < VALIDATION_RULES.FEEDBACK_MESSAGE_MIN) {
      throw new AppError(`Feedback message must be at least ${VALIDATION_RULES.FEEDBACK_MESSAGE_MIN} characters long`, 400);
    }

    if (message.length > VALIDATION_RULES.FEEDBACK_MESSAGE_MAX) {
      throw new AppError(`Feedback message cannot exceed ${VALIDATION_RULES.FEEDBACK_MESSAGE_MAX} characters`, 400);
    }

    // Create feedback with sanitized data
    const feedback = new Feedback({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      category,
      rating: ratingNum,
      message: message.trim(),
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Thank you for your feedback!",
      data: {
        id: feedback._id,
        status: feedback.status,
        submittedAt: feedback.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedback = async (req, res, next) => {
  try {
    const { status, sort = "-createdAt" } = req.query;
    const { page, limit } = req.pagination;
    const query = {};

    // Validate status if provided
    if (status && Object.values(FEEDBACK_STATUS).includes(status)) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const [feedback, total] = await Promise.all([
      Feedback.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Feedback.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: feedback,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id).lean();

    if (!feedback) {
      throw new AppError("Feedback not found", 404);
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError("Status is required", 400);
    }

    if (!Object.values(FEEDBACK_STATUS).includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${Object.values(FEEDBACK_STATUS).join(", ")}`, 400);
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      throw new AppError("Feedback not found", 404);
    }

    res.json({
      success: true,
      message: "Feedback status updated successfully",
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      throw new AppError("Feedback not found", 404);
    }

    res.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackStats = async (req, res, next) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    const avgRating = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    const feedbackByCategory = await Feedback.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const feedbackByStatus = await Feedback.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalFeedback,
        averageRating: avgRating[0]?.averageRating || 0,
        byCategory: feedbackByCategory,
        byStatus: feedbackByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};
