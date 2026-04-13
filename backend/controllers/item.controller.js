import { LostItem } from "../models/LostItem.model.js";
import { TransactionLog } from "../models/TransactionLog.model.js";
import { AppError } from "../middleware/errorHandler.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// POST /api/items/report
export const reportItem = async (req, res) => {
  const {
    category, description, location, foundDate, submissionType,
    finderContactType, finderContactValue,
    aiTags, aiDescription,
  } = req.body;

  if (!req.file) throw new AppError("Item image is required", 400);

  const parsedLocation = typeof location === "string" ? JSON.parse(location) : location;

  if (!category || !parsedLocation || !foundDate || !submissionType) {
    throw new AppError("category, location, foundDate, submissionType are required", 400);
  }

  // If with_finder and finder wants to share contact
  let finderContact = null;
  if (submissionType === "with_finder") {
    if (finderContactType && finderContactValue) {
      finderContact = { type: finderContactType, value: finderContactValue };
    }
  }

  const parsedTags = aiTags
    ? (typeof aiTags === "string" ? JSON.parse(aiTags) : aiTags)
    : [];

  const uploadResult = await uploadToCloudinary(req.file.buffer);

const item = await LostItem.create({
  imageUrl: uploadResult.secure_url,
  imagePublicId: uploadResult.public_id,
  category,
  description: description || "",
  location: parsedLocation,
  foundDate: new Date(foundDate),
  submissionType,
  finderContact,
  status: "reported",
  aiTags: parsedTags,
  aiDescription: aiDescription || "",
});

  await TransactionLog.create({
    itemId: item._id,
    action: "ITEM_REPORTED",
    toStatus: "reported",
    performedBy: submissionType === "with_finder" ? "finder" : "anonymous",
    details: { submissionType, category, location: parsedLocation },
  });

  res.status(201).json({ success: true, message: "Item reported successfully", data: item });
};

// GET /api/items
export const getItems = async (req, res) => {
  const {
    category, area, seminarHall, status,
    dateFilter, startDate, endDate,
    search, page = 1, limit = 20,
  } = req.query;

  const query = {};
  if (category && category !== "all") query.category = category;
  if (area && area !== "all") query["location.area"] = area;
  if (seminarHall) query["location.seminarHall"] = seminarHall;
  if (status && status !== "all") query.status = status;

  const now = new Date();
  if (dateFilter === "today") {
    const s = new Date(now); s.setHours(0, 0, 0, 0);
    const e = new Date(now); e.setHours(23, 59, 59, 999);
    query.foundDate = { $gte: s, $lte: e };
  } else if (dateFilter === "yesterday") {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    const s = new Date(y); s.setHours(0, 0, 0, 0);
    const e = new Date(y); e.setHours(23, 59, 59, 999);
    query.foundDate = { $gte: s, $lte: e };
  } else if (dateFilter === "custom" && startDate && endDate) {
    query.foundDate = { $gte: new Date(startDate), $lte: new Date(new Date(endDate).setHours(23,59,59,999)) };
  }

  if (search) {
    query.$or = [
      { description: { $regex: search, $options: "i" } },
      { aiDescription: { $regex: search, $options: "i" } },
      { aiTags: { $elemMatch: { $regex: search, $options: "i" } } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    LostItem.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    LostItem.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) },
  });
};

// GET /api/items/:id
export const getItemById = async (req, res) => {
  const item = await LostItem.findById(req.params.id).lean();
  if (!item) throw new AppError("Item not found", 404);
  res.json({ success: true, data: item });
};

// PATCH /api/items/:id/verify  [admin only]
export const verifyItem = async (req, res) => {
  const item = await LostItem.findById(req.params.id);
  if (!item) throw new AppError("Item not found", 404);
  if (item.submissionType !== "submitted_to_center") {
    throw new AppError("Only 'Submitted to Center' items can be verified", 400);
  }

  const prev = item.status;
  item.adminVerified = true;
  item.adminVerifiedAt = new Date();
  item.status = "verified";
  await item.save();

  await TransactionLog.create({
    itemId: item._id,
    action: "ADMIN_VERIFIED",
    fromStatus: prev,
    toStatus: "verified",
    performedBy: "admin",
    details: { verifiedAt: item.adminVerifiedAt },
  });

  res.json({ success: true, message: "Item verified", data: item });
};

// POST /api/items/:id/collect
export const collectItem = async (req, res) => {
  const { name, rollNumber, division, branch, contact } = req.body;
  if (!name || !rollNumber || !division || !branch || !contact) {
    throw new AppError("All collector fields (name, rollNumber, division, branch, contact) are required", 400);
  }

  const item = await LostItem.findById(req.params.id);
  if (!item) throw new AppError("Item not found", 404);
  if (item.status === "collected") throw new AppError("Item already collected", 400);

  const prev = item.status;
  item.collectorInfo = { name, rollNumber, division, branch, contact };
  item.status = "collected";
  await item.save();

  await TransactionLog.create({
    itemId: item._id,
    action: "ITEM_COLLECTED",
    fromStatus: prev,
    toStatus: "collected",
    performedBy: name,
    details: { name, rollNumber, division, branch, contact },
  });

  res.json({ success: true, message: "Item collected successfully", data: item });
};

// PATCH /api/items/:id/status [admin only]
export const updateStatus = async (req, res) => {
  const { status, note } = req.body;
  const item = await LostItem.findById(req.params.id);
  if (!item) throw new AppError("Item not found", 404);

  const prev = item.status;
  item.status = status;
  await item.save();

  await TransactionLog.create({
    itemId: item._id,
    action: "STATUS_UPDATED",
    fromStatus: prev,
    toStatus: status,
    performedBy: "admin",
    note: note || "",
  });

  res.json({ success: true, data: item });
};