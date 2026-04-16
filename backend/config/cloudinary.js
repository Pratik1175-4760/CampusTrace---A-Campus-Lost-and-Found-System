import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import sharp from "sharp";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB upload limit (sharp compresses to ~300KB before storing)
});

// ── Image compression with sharp ──────────────────────────────────────────────
// Target: 200–300 KB output. Resizes to max 900×900, converts to JPEG,
// and uses adaptive quality stepping to hit the target size.
const TARGET_MAX_KB = 300;
const TARGET_MIN_KB = 150;

export const compressImage = async (fileBuffer) => {
  // Step 1: Resize to max 900×900 and convert to JPEG at quality 80
  let compressed = await sharp(fileBuffer)
    .resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();

  // Step 2: If still over target, reduce quality in steps
  let quality = 70;
  while (compressed.length > TARGET_MAX_KB * 1024 && quality >= 20) {
    compressed = await sharp(fileBuffer)
      .resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    quality -= 10;
  }

  // Step 3: If quality went very low and image is still large, resize further
  if (compressed.length > TARGET_MAX_KB * 1024) {
    compressed = await sharp(fileBuffer)
      .resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 30, mozjpeg: true })
      .toBuffer();
  }

  const sizeKB = (compressed.length / 1024).toFixed(1);
  console.log(`📸 Image compressed: ${(fileBuffer.length / 1024).toFixed(1)} KB → ${sizeKB} KB`);

  return compressed;
};

// ── Upload to Cloudinary (compression handled by sharp, no cloud transforms) ─
export const uploadToCloudinary = async (fileBuffer) => {
  // Compress before uploading
  const compressedBuffer = await compressImage(fileBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "pict-lost-found",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(compressedBuffer);
  });
};

export { cloudinary };