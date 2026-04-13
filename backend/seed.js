/**
 * PICT Lost & Found — Database Seed Script
 *
 * Inserts realistic dummy items + transaction logs into MongoDB Atlas.
 *
 * Usage:
 *   cd backend
 *   node seed.js
 *
 * To CLEAR all data and re-seed:
 *   node seed.js --reset
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// ── Inline minimal models (avoids import issues) ─────────────────────────────

const locationSchema = new mongoose.Schema({
  area: String, block: String, classroomName: String, seminarHall: String,
}, { _id: false });

const finderContactSchema = new mongoose.Schema({
  type: String, value: String,
}, { _id: false });

const collectorSchema = new mongoose.Schema({
  name: String, rollNumber: String, division: String,
  branch: String, contact: String, collectedAt: Date,
}, { _id: false });

const lostItemSchema = new mongoose.Schema({
  imageUrl:      String,
  imagePublicId: String,
  category:      String,
  description:   String,
  location:      locationSchema,
  foundDate:     Date,
  submissionType:String,
  finderContact: finderContactSchema,
  status:        { type: String, default: "reported" },
  adminVerified: { type: Boolean, default: false },
  adminVerifiedAt: Date,
  collectorInfo: collectorSchema,
  aiTags:        [String],
  aiDescription: String,
}, { timestamps: true });

const transactionLogSchema = new mongoose.Schema({
  itemId:      { type: mongoose.Schema.Types.ObjectId, ref: "LostItem" },
  action:      String,
  fromStatus:  String,
  toStatus:    String,
  performedBy: String,
  details:     mongoose.Schema.Types.Mixed,
  note:        String,
}, { timestamps: true });

const LostItem       = mongoose.model("LostItem",       lostItemSchema);
const TransactionLog = mongoose.model("TransactionLog", transactionLogSchema);

// ── Placeholder images (real hosted images by category) ──────────────────────
const IMAGES = {
  "ID Card":    "https://images.unsplash.com/photo-1618044619888-009e412ff12a?w=400&q=80",
  "Bottle":     "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
  "Calculator": "https://images.unsplash.com/photo-1564473185935-4f44f4a89ec7?w=400&q=80",
  "Accessory":  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
  "Other":      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
};

// ── Helper: date N days ago ───────────────────────────────────────────────────
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED_ITEMS = [

  // ── 1. ID Card — Submitted to Center — Verified (At Center) ──────────────
  {
    imageUrl:      IMAGES["ID Card"],
    category:      "ID Card",
    description:   "PICT student ID card found near the library entrance. Name on card: Rohan Mehta.",
    location:      { area: "Library" },
    foundDate:     daysAgo(1),
    submissionType:"submitted_to_center",
    finderContact: null,
    status:        "verified",
    adminVerified: true,
    adminVerifiedAt: daysAgo(0),
    aiTags:        ["id", "card", "student", "pict", "library"],
    aiDescription: "A PICT college student ID card with photo and barcode visible.",
  },

  // ── 2. Bottle — With Finder — Phone shared ─────────────────────────────────
  {
    imageUrl:      IMAGES["Bottle"],
    category:      "Bottle",
    description:   "Blue insulated steel water bottle, Milton brand, found near playground benches.",
    location:      { area: "Playground" },
    foundDate:     daysAgo(0),
    submissionType:"with_finder",
    finderContact: { type: "phone", value: "9876543210" },
    status:        "reported",
    aiTags:        ["blue", "bottle", "milton", "steel", "insulated"],
    aiDescription: "A blue Milton insulated steel water bottle, approximately 750ml capacity.",
  },

  // ── 3. Calculator — Classroom A1 — Submitted — Collected ──────────────────
  {
    imageUrl:      IMAGES["Calculator"],
    category:      "Calculator",
    description:   "Casio fx-991ES Plus scientific calculator found on desk in A1-305.",
    location:      { area: "Classroom", block: "A1", classroomName: "A1-305" },
    foundDate:     daysAgo(3),
    submissionType:"submitted_to_center",
    finderContact: null,
    status:        "collected",
    adminVerified: true,
    adminVerifiedAt: daysAgo(2),
    collectorInfo: {
      name:        "Sneha Patil",
      rollNumber:  "23110245",
      division:    "B",
      branch:      "Computer Engineering",
      contact:     "9823456781",
      collectedAt: daysAgo(1),
    },
    aiTags:        ["casio", "calculator", "scientific", "fx-991", "classroom"],
    aiDescription: "A Casio fx-991ES Plus scientific calculator in good condition.",
  },

  // ── 4. Accessory (Watch) — Seminar Hall COMP — Submitted ─────────────────
  {
    imageUrl:      IMAGES["Accessory"],
    category:      "Accessory",
    description:   "Black Fastrack digital watch found on chair in COMP seminar hall after evening lecture.",
    location:      { area: "Seminar Hall", seminarHall: "COMP" },
    foundDate:     daysAgo(0),
    submissionType:"submitted_to_center",
    finderContact: null,
    status:        "reported",
    aiTags:        ["watch", "fastrack", "black", "digital", "wristwatch"],
    aiDescription: "A black Fastrack digital wristwatch with rubber strap.",
  },

  // ── 5. ID Card — Classroom F1 — With Finder — Email shared ───────────────
  {
    imageUrl:      IMAGES["ID Card"],
    category:      "ID Card",
    description:   "ID card belonging to a student from IT department. Found in F1-101.",
    location:      { area: "Classroom", block: "F1", classroomName: "F1-101" },
    foundDate:     daysAgo(2),
    submissionType:"with_finder",
    finderContact: { type: "email", value: "finder_amit@pict.edu" },
    status:        "reported",
    aiTags:        ["id", "card", "it", "department", "student"],
    aiDescription: "PICT student ID card for IT department student.",
  },

  // ── 6. Bottle — Library — Submitted — Verified ───────────────────────────
  {
    imageUrl:      IMAGES["Bottle"],
    category:      "Bottle",
    description:   "Transparent plastic water bottle with green cap, found between shelves on 2nd floor library.",
    location:      { area: "Library" },
    foundDate:     daysAgo(1),
    submissionType:"submitted_to_center",
    finderContact: null,
    status:        "verified",
    adminVerified: true,
    adminVerifiedAt: daysAgo(0),
    aiTags:        ["plastic", "bottle", "transparent", "green", "water"],
    aiDescription: "A clear plastic water bottle with a green screw cap.",
  },

  // ── 7. Accessory (Earphones) — Campus — With Finder ──────────────────────
  {
    imageUrl:      IMAGES["Accessory"],
    category:      "Accessory",
    description:   "White Apple EarPods found near the main gate parking area.",
    location:      { area: "Campus" },
    foundDate:     daysAgo(0),
    submissionType:"with_finder",
    finderContact: { type: "phone", value: "9765432109" },
    status:        "reported",
    aiTags:        ["earphones", "apple", "earpods", "white", "earbuds"],
    aiDescription: "White Apple EarPods with lightning connector, in carry case.",
  },

  // ── 8. Calculator — Seminar Hall ETC — Submitted — Collected ─────────────
  {
    imageUrl:      IMAGES["Calculator"],
    category:      "Calculator",
    description:   "Casio fx-82MS calculator, slightly worn, found after ETC lecture.",
    location:      { area: "Seminar Hall", seminarHall: "E&TC" },
    foundDate:     daysAgo(5),
    submissionType:"submitted_to_center",
    finderContact: null,
    status:        "collected",
    adminVerified: true,
    adminVerifiedAt: daysAgo(4),
    collectorInfo: {
      name:        "Arjun Deshmukh",
      rollNumber:  "22110312",
      division:    "C",
      branch:      "E&TC",
      contact:     "9812345670",
      collectedAt: daysAgo(3),
    },
    aiTags:        ["casio", "calculator", "fx-82", "etc", "seminar"],
    aiDescription: "A Casio fx-82MS basic scientific calculator with worn keys.",
  },

  // ── 9. Other (Umbrella) — Building Block — Submitted ─────────────────────
  {
    imageUrl:      IMAGES["Other"],
    category:      "Other",
    description:   "Black compact umbrella found in A2 building corridor near staircase.",
    location:      { area: "Building Block" },
    foundDate:     daysAgo(2),
    submissionType:"submitted_to_center",
    finderContact: null,
    status:        "verified",
    adminVerified: true,
    adminVerifiedAt: daysAgo(1),
    aiTags:        ["umbrella", "black", "compact", "building", "corridor"],
    aiDescription: "A folded black compact travel umbrella in good condition.",
  },

  // ── 10. Accessory (Glasses) — Library — With Finder ──────────────────────
  {
    imageUrl:      IMAGES["Accessory"],
    category:      "Accessory",
    description:   "Round frame prescription glasses with brown frame, found on reading table.",
    location:      { area: "Library" },
    foundDate:     daysAgo(0),
    submissionType:"with_finder",
    finderContact: { type: "phone", value: "9998887770" },
    status:        "reported",
    aiTags:        ["glasses", "spectacles", "round", "brown", "prescription"],
    aiDescription: "Round brown-framed prescription spectacles on a reading table.",
  },

  // ── 11. ID Card — Playground — Submitted ─────────────────────────────────
  {
    imageUrl:      IMAGES["ID Card"],
    category:      "ID Card",
    description:   "Muddy PICT ID card found near the basketball court. Partially readable.",
    location:      { area: "Playground" },
    foundDate:     daysAgo(1),
    submissionType:"submitted_to_center",
    finderContact: null,
    status:        "reported",
    aiTags:        ["id", "card", "playground", "basketball", "muddy"],
    aiDescription: "A PICT student ID card found near sports court, slightly dirty.",
  },

  // ── 12. Bottle — Classroom A2 — Submitted — Collected ────────────────────
  {
    imageUrl:      IMAGES["Bottle"],
    category:      "Bottle",
    description:   "Red Cello Puro steel bottle, 1 litre, found under bench in A2-204.",
    location:      { area: "Classroom", block: "A2", classroomName: "A2-204" },
    foundDate:     daysAgo(4),
    submissionType:"submitted_to_center",
    finderContact: null,
    status:        "collected",
    adminVerified: true,
    adminVerifiedAt: daysAgo(3),
    collectorInfo: {
      name:        "Priya Joshi",
      rollNumber:  "23110089",
      division:    "A",
      branch:      "Computer Engineering",
      contact:     "9900112233",
      collectedAt: daysAgo(2),
    },
    aiTags:        ["red", "bottle", "cello", "steel", "1litre"],
    aiDescription: "A red Cello Puro stainless steel water bottle, 1 litre capacity.",
  },

  // ── 13. Other (Keychain) — Campus — With Finder ───────────────────────────
  {
    imageUrl:      IMAGES["Other"],
    category:      "Other",
    description:   "Set of 3 keys on a PICT keychain found near canteen area.",
    location:      { area: "Campus" },
    foundDate:     daysAgo(0),
    submissionType:"with_finder",
    finderContact: { type: "email", value: "keyfinder22@gmail.com" },
    status:        "reported",
    aiTags:        ["keys", "keychain", "pict", "canteen", "lost"],
    aiDescription: "A bunch of 3 keys on a PICT branded keychain.",
  },

  // ── 14. Accessory (Pen drive) — Seminar Hall IT — Submitted ──────────────
  {
    imageUrl:      IMAGES["Accessory"],
    category:      "Accessory",
    description:   "SanDisk 32GB USB pen drive found on the podium of IT seminar hall.",
    location:      { area: "Seminar Hall", seminarHall: "IT" },
    foundDate:     daysAgo(1),
    submissionType:"submitted_to_center",
    finderContact: null,
    status:        "verified",
    adminVerified: true,
    adminVerifiedAt: daysAgo(0),
    aiTags:        ["pendrive", "sandisk", "usb", "32gb", "seminar"],
    aiDescription: "A SanDisk Cruzer 32GB USB 3.0 pen drive in black and red.",
  },

  // ── 15. Calculator — Classroom A3 — With Finder ──────────────────────────
  {
    imageUrl:      IMAGES["Calculator"],
    category:      "Calculator",
    description:   "Casio fx-100MS calculator found on windowsill in A3-102.",
    location:      { area: "Classroom", block: "A3", classroomName: "A3-102" },
    foundDate:     daysAgo(2),
    submissionType:"with_finder",
    finderContact: { type: "phone", value: "8877665544" },
    status:        "reported",
    aiTags:        ["casio", "calculator", "fx-100", "classroom", "a3"],
    aiDescription: "Casio fx-100MS scientific calculator found on classroom windowsill.",
  },
];

// ── Main seed function ────────────────────────────────────────────────────────
const seed = async () => {
  try {
    console.log("🔌  Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  Connected!\n");

    // Reset if --reset flag passed
    if (process.argv.includes("--reset")) {
      await LostItem.deleteMany({});
      await TransactionLog.deleteMany({});
      console.log("🗑️   Cleared existing data\n");
    }

    console.log(`📦  Inserting ${SEED_ITEMS.length} items...\n`);

    for (const itemData of SEED_ITEMS) {
      const item = await LostItem.create(itemData);

      // Create matching transaction logs for each item
      const logs = [];

      // Always: ITEM_REPORTED
      logs.push({
        itemId:      item._id,
        action:      "ITEM_REPORTED",
        fromStatus:  null,
        toStatus:    "reported",
        performedBy: itemData.submissionType === "with_finder" ? "finder" : "anonymous",
        details: {
          submissionType: itemData.submissionType,
          category:       itemData.category,
          location:       itemData.location,
        },
        createdAt: item.foundDate,
      });

      // If verified: ADMIN_VERIFIED
      if (itemData.adminVerified) {
        logs.push({
          itemId:      item._id,
          action:      "ADMIN_VERIFIED",
          fromStatus:  "reported",
          toStatus:    "verified",
          performedBy: "admin",
          details:     { verifiedAt: itemData.adminVerifiedAt },
          createdAt:   itemData.adminVerifiedAt,
        });
      }

      // If collected: ITEM_COLLECTED
      if (itemData.status === "collected" && itemData.collectorInfo) {
        logs.push({
          itemId:      item._id,
          action:      "ITEM_COLLECTED",
          fromStatus:  "verified",
          toStatus:    "collected",
          performedBy: itemData.collectorInfo.name,
          details:     itemData.collectorInfo,
          createdAt:   itemData.collectorInfo.collectedAt,
        });
      }

      await TransactionLog.insertMany(logs);

      const statusIcon = {
        reported: "🟡",
        verified: "🔵",
        collected:"🟢",
      }[itemData.status] || "⚪";

      console.log(`  ${statusIcon}  [${itemData.category.padEnd(12)}]  ${itemData.location.area.padEnd(14)}  →  ${itemData.status.toUpperCase()}`);
    }

    // Summary
    const counts = await LostItem.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const logCount = await TransactionLog.countDocuments();

    console.log("\n─────────────────────────────────────");
    console.log("✅  Seed complete!\n");
    console.log("   Items inserted:");
    counts.forEach(c => console.log(`     ${c._id.padEnd(12)} → ${c.count}`));
    console.log(`\n   Transaction logs: ${logCount}`);
    console.log("─────────────────────────────────────");
    console.log("\n🚀  Now run: npm run dev");

  } catch (err) {
    console.error("\n❌  Seed failed:", err.message);
    if (err.message?.includes("ENOTFOUND") || err.message?.includes("connect")) {
      console.error("   → Check your MONGO_URI in backend/.env");
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();