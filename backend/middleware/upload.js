// ===========================================================================
// Upload Middleware - Multer + AWS S3 Configuration for File Uploads
// ===========================================================================
//
// HOW IT WORKS:
// 1. Multer uses memory storage to buffer the file in RAM
// 2. Custom StorageEngine uploads buffer directly to S3 using putObject
// 3. After upload, req.file.path contains the full S3 HTTPS URL
//    - req.file.path = "https://farmeasy-uploads.s3.amazonaws.com/farmeasy/filename.jpg"
//
// USED IN ROUTES LIKE:
//   upload.single("product_image")  -> handles one product image upload
//   upload.single("profile_image")  -> handles one profile pic upload
//
// The field name in .single("field_name") must match the FormData key
// that the frontend uses: formData.append("product_image", file)
//
// REQUIRED ENV VARS (set in .env):
//   AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME
// ===========================================================================

const multer = require("multer");
const s3 = require("../config/s3");

// Custom multer StorageEngine that uploads directly to S3
class S3Storage {
  _handleFile(req, file, cb) {
    // Generate unique filename with timestamp to avoid collisions
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = file.originalname.split('.').pop();
    const filename = `${process.env.AWS_S3_FOLDER || 'farmeasy'}/${timestamp}-${randomStr}.${extension}`;

    const s3params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL disabled - bucket has ACL blocking enabled
    };

    s3.putObject(s3params, (error, result) => {
      if (error) {
        console.error('S3 Upload Error:', error);
        return cb(error);
      }

      // Construct full S3 URL
      const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

      cb(null, {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        path: s3Url, // Full HTTPS URL for display in frontend
        size: file.size,
        filename: filename, // S3 key for future deletion
      });
    });
  }

  _removeFile(req, file, cb) {
    if (file.filename) {
      const s3params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: file.filename,
      };

      s3.deleteObject(s3params, (error) => {
        if (error) {
          console.error('S3 Delete Error:', error);
          return cb(error);
        }
        cb(null);
      });
    } else {
      cb(null);
    }
  }
}

// Configure multer with memory storage + our custom S3 storage engine
const upload = multer({
  storage: new S3Storage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and AVIF images are allowed'), false);
    }
  },
});

module.exports = upload;