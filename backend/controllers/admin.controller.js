import jwt from "jsonwebtoken";
import { LostItem } from "../models/LostItem.model.js";
import { TransactionLog } from "../models/TransactionLog.model.js";
import { AppError } from "../middleware/errorHandler.js";

// POST /api/admin/login
export const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    throw new AppError("Invalid credentials", 401);
  }
  const token = jwt.sign({ username, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "24h" });
  res.json({ success: true, token });
};

// GET /api/admin/items
export const getAllItemsAdmin = async (req, res) => {
  const { status, submissionType, page = 1, limit = 50 } = req.query;
  const query = {};
  if (status && status !== "all") query.status = status;
  if (submissionType && submissionType !== "all") query.submissionType = submissionType;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    LostItem.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    LostItem.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
};

// GET /api/admin/transactions
export const getTransactions = async (req, res) => {
  const { itemId, page = 1, limit = 50 } = req.query;
  const query = itemId ? { itemId } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    TransactionLog.find(query)
      .populate("itemId", "category imageUrl location status submissionType")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    TransactionLog.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: logs,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
};

// GET /api/admin/stats
export const getStats = async (req, res) => {
  const [total, reported, verified, collected, withFinder, atCenter] = await Promise.all([
    LostItem.countDocuments(),
    LostItem.countDocuments({ status: "reported" }),
    LostItem.countDocuments({ status: "verified" }),
    LostItem.countDocuments({ status: "collected" }),
    LostItem.countDocuments({ submissionType: "with_finder" }),
    LostItem.countDocuments({ submissionType: "submitted_to_center" }),
  ]);

  const byCategory = await LostItem.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({
    success: true,
    data: { total, reported, verified, collected, withFinder, atCenter, byCategory },
  });
};