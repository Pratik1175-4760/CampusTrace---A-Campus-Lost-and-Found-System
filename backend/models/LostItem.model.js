import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true,
    enum: ["Library", "Playground", "Classroom", "Building Block", "Seminar Hall", "Campus"],
  },
  // Only for Classroom
  block: { type: String, enum: ["F1", "A1", "A2", "A3", ""] },
  classroomName: { type: String },
  // Only for Seminar Hall
  seminarHall: { type: String, enum: ["E&TC", "COMP", "IT", ""] },
}, { _id: false });

const finderContactSchema = new mongoose.Schema({
  type: { type: String, enum: ["phone", "email"], required: true },
  value: { type: String, required: true },
}, { _id: false });

const collectorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true },
  division: { type: String, required: true },
  branch: { type: String, required: true },
  contact: { type: String, required: true },
  collectedAt: { type: Date, default: Date.now },
}, { _id: false });

const lostItemSchema = new mongoose.Schema({
  imageUrl:      { type: String, required: true },
  imagePublicId: { type: String },
  category: {
    type: String,
    required: true,
    enum: ["ID Card", "Bottle", "Calculator", "Accessory", "Other"],
    index: true,
  },
  description:   { type: String, default: "" },
  location:      { type: locationSchema, required: true },
  foundDate:     { type: Date, required: true, index: true },

  // "with_finder" → item stays with the person who found it
  // "submitted_to_center" → item has been dropped at lost & found center
  submissionType: {
    type: String,
    required: true,
    enum: ["with_finder", "submitted_to_center"],
  },

  // Only populated when submissionType === "with_finder"
  finderContact: { type: finderContactSchema, default: null },

  // reported → verified (admin confirms center has it) → collected
  status: {
    type: String,
    enum: ["reported", "verified", "collected"],
    default: "reported",
    index: true,
  },

  adminVerified:   { type: Boolean, default: false },
  adminVerifiedAt: { type: Date },

  // Populated when item is collected from center
  collectorInfo: { type: collectorSchema, default: null },

  // Gemini AI enrichment
  aiTags:        [{ type: String }],
  aiDescription: { type: String, default: "" },

}, { timestamps: true });

// Indexes
lostItemSchema.index({ "location.area": 1 });
lostItemSchema.index({ category: 1, status: 1 });
lostItemSchema.index({ foundDate: -1 });
lostItemSchema.index({ createdAt: -1 });

export const LostItem = mongoose.model("LostItem", lostItemSchema);