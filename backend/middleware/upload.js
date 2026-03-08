// ===========================================================================
// Upload Middleware - Multer Configuration for File Uploads
// ===========================================================================
//
// HOW IT WORKS:
// 1. Multer intercepts multipart/form-data requests (when frontend sends FormData)
// 2. It saves uploaded files to the /backend/uploads/ directory
// 3. Each file gets a unique name: timestamp + original extension (e.g. 1712345678.jpg)
// 4. After saving, the file info is available in req.file:
//    - req.file.filename = "1712345678.jpg"
//    - req.file.path = "uploads/1712345678.jpg"
//
// USED IN ROUTES LIKE:
//   upload.single("product_image")  -> handles one product image upload
//   upload.single("profile_image")  -> handles one profile pic upload
//
// The field name in .single("field_name") must match the FormData key
// that the frontend uses: formData.append("product_image", file)
// ===========================================================================

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  // where to save files
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  // how to name files: timestamp + original extension to avoid conflicts
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = upload;