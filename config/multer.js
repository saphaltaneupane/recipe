import multer from "multer";

// Multer setup (memory storage)
export const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { files: 10, fileSize: 5 * 1024 * 1024 }, // max 10 files, 5MB each
fileFilter: (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, WebP are allowed"), false);
  }
  cb(null, true);
},
});