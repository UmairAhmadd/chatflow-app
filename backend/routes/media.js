import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Keep uploads in memory; we stream straight to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

// POST /api/media/upload — field name "file"
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const isImage = req.file.mimetype.startsWith("image/");

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "chatflow", resource_type: isImage ? "image" : "auto" },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded))
      );
      stream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      type: isImage ? "image" : "file",
      fileName: req.file.originalname,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
