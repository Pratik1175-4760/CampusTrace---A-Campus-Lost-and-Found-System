import mongoose from "mongoose";

const transactionLogSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LostItem",
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: ["ITEM_REPORTED", "ADMIN_VERIFIED", "ITEM_COLLECTED", "STATUS_UPDATED"],
  },
  fromStatus: { type: String, default: null },
  toStatus:   { type: String, default: null },
  performedBy: { type: String, default: "system" },
  details:    { type: mongoose.Schema.Types.Mixed },
  note:       { type: String },
}, { timestamps: true });

transactionLogSchema.index({ itemId: 1, createdAt: -1 });
transactionLogSchema.index({ createdAt: -1 });

export const TransactionLog = mongoose.model("TransactionLog", transactionLogSchema);