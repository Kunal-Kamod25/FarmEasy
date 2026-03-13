// ===========================================================================
// Upload Middleware - Multer + Cloudinary v2 Configuration for File Uploads
// ===========================================================================
//
// HOW IT WORKS:
// 1. Multer uses memory storage to buffer the file in RAM
// 2. A custom StorageEngine streams the buffer directly to Cloudinary using upload_stream
// 3. After upload, req.file.path contains the full Cloudinary HTTPS URL
//    - req.file.path = "https://res.cloudinary.com/.../farmeasy/filename.jpg"
//
// USED IN ROUTES LIKE:
//   upload.single("product_image")  -> handles one product image upload
//   upload.single("profile_image")  -> handles one profile pic upload
//
// The field name in .single("field_name") must match the FormData key
// that the frontend uses: formData.append("product_image", file)
//
// REQUIRED ENV VARS (set in Render dashboard):
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// ===========================================================================

const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// Custom multer StorageEngine that streams directly to Cloudinary
class CloudinaryStorage {
  _handleFile(req, file, cb) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "farmeasy",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
        transformation: [{ width: 800, height: 800, crop: "limit" }],
      },
      (error, result) => {
        if (error) return cb(error);
        cb(null, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          path: result.secure_url,   // full Cloudinary HTTPS URL
          size: result.bytes,
          filename: result.public_id, // cloudinary public_id for future deletion
        });
      }
    );
    file.stream.pipe(uploadStream);
  }

  _removeFile(req, file, cb) {
    if (file.filename) {
      cloudinary.uploader.destroy(file.filename, cb);
    } else {
      cb(null);
    }
  }
}

const upload = multer({ storage: new CloudinaryStorage() });

module.exports = upload;