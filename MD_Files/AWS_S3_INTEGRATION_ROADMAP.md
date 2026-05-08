# AWS S3 INTEGRATION ROADMAP FOR FARMEASY

**Date Created:** April 4, 2026  
**Current Setup:** Cloudinary → Migration Target: AWS S3  
**Estimated Effort:** 4-6 hours  

---

## 📋 TABLE OF CONTENTS

1. [Phase 1: AWS Setup & Credentials](#phase-1-aws-setup--credentials)
2. [Phase 2: Backend Changes](#phase-2-backend-changes)
3. [Phase 3: Frontend Changes](#phase-3-frontend-changes)
4. [Phase 4: Database Changes (Optional)](#phase-4-database-changes-optional)
5. [Phase 5: Environment Setup](#phase-5-environment-setup)
6. [Phase 6: Error Handling Update](#phase-6-error-handling-update)
7. [File Modification Summary](#file-modification-summary)
8. [Testing Checklist](#testing-checklist)
9. [Cost Estimation](#cost-estimation)
10. [Rollback Plan](#rollback-plan)

---

## PHASE 1: AWS SETUP & CREDENTIALS

### Step 1.1: Create AWS IAM User

**Navigate to:** AWS Console → IAM (Identity & Access Management)

1. Click "Create user" → Name: `farmeasy-s3-user`
2. Click "Create policy" → Select "AmazonS3FullAccess"
3. Attach policy to user
4. Generate Access Key ID & Secret Access Key
5. **⚠️ IMPORTANT:** Download CSV immediately - you can't retrieve secret key later
6. Store securely (never commit to Git)

### Step 1.2: Create S3 Bucket

**Navigate to:** AWS Console → S3

**Bucket Configuration:**
- **Bucket Name:** `farmeasy-uploads` (or `farmeasy-uploads-prod` for production)
- **Region:** `ap-south-1` (Mumbai, India - closest to your users)
- **Block public access:** Keep blocked (we'll use signed URLs if needed)
- **Enable versioning:** Optional but recommended
- **Enable server-side encryption:** ✅ Yes (AES-256)
- **Object Lock:** Optional

### Step 1.3: Set Bucket Permissions

**Bucket Policy** (if needing direct public read access):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::farmeasy-uploads/*"
    }
  ]
}
```

**CORS Configuration** (if frontend uploads directly):
```json
[
  {
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:5173"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## PHASE 2: BACKEND CHANGES

### Step 2.1: Install Dependencies

```bash
cd backend
npm install aws-sdk dotenv
```

**Current dependencies to REMOVE:**
```bash
npm uninstall cloudinary
```

### Step 2.2: Create .env File

**Location:** `backend/.env`

```env
# AWS S3 Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_from_step_1_1
AWS_SECRET_ACCESS_KEY=your_secret_key_from_step_1_1
AWS_S3_BUCKET_NAME=farmeasy-uploads
AWS_S3_FOLDER=farmeasy

# Other existing configs
JWT_SECRET=your_existing_jwt_secret
DATABASE_URL=your_database_url
CLOUDINARY_CLOUD_NAME=remove_this_eventually
```

### Step 2.3: Create AWS S3 Config File

**Location:** `backend/config/s3.js` (CREATE NEW)

```javascript
// ===========================================================================
// AWS S3 Configuration
// ===========================================================================
const AWS = require('aws-sdk');

// Configure AWS SDK with credentials from environment variables
const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Test connection on startup
s3.headBucket({ Bucket: process.env.AWS_S3_BUCKET_NAME }, (err) => {
  if (err) {
    console.error('❌ AWS S3 Bucket Error:', err.message);
    console.error('Check AWS credentials and bucket name');
  } else {
    console.log('✅ AWS S3 Connected:', process.env.AWS_S3_BUCKET_NAME);
  }
});

module.exports = s3;
```

### Step 2.4: Replace Cloudinary Upload Middleware

**Location:** `backend/middleware/upload.js` (REPLACE ENTIRE FILE)

```javascript
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

// Custom multer StorageEngine that streams directly to S3
class S3Storage {
  _handleFile(req, file, cb) {
    // Generate unique filename with timestamp to avoid collisions
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = file.originalname.split('.').pop();
    const filename = `${process.env.AWS_S3_FOLDER}/${timestamp}-${randomStr}.${extension}`;

    const s3params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Make uploaded files public (for display)
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
```

### Step 2.5: Delete Old Cloudinary Config

**Location:** `backend/config/cloudinary.js` (DELETE THIS FILE)

No longer needed, replaced by S3.

### Step 2.6: Update All Routes Using Upload

All these routes remain **UNCHANGED** in structure - the middleware handles the switch:

**Routes that use upload:**
- `backend/routes/vendorProducts.js` - Product images
- `backend/routes/profileRoutes.js` - Profile pictures
- `backend/routes/exchangeRoutes.js` - Exchange listing images

Example route (NO CHANGE NEEDED):
```javascript
router.post("/add", verifyToken, upload.single("product_image"), addProduct);
// upload.js now uses S3 instead of Cloudinary internally
```

### Step 2.7: Update Controllers - Image Deletion Logic

**Files to update:**
- `backend/controllers/vendorController.js`
- `backend/controllers/profileController.js`
- Any controller with delete product/profile functions

**OLD (Cloudinary):**
```javascript
const publicId = "farmeasy/" + imageName;
await cloudinary.uploader.destroy(publicId);
```

**NEW (S3):**
```javascript
const s3 = require("../config/s3");

// In delete endpoint:
if (product.product_image) {
  // Extract S3 key from URL or store separately
  const s3Key = extractS3KeyFromUrl(product.product_image); // helper function
  
  s3.deleteObject({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: s3Key
  }, (err, data) => {
    if (err) console.error('Error deleting image:', err);
    // Continue with product deletion
  });
}
```

**Helper function to add:**
```javascript
function extractS3KeyFromUrl(url) {
  // URL format: https://bucket.s3.region.amazonaws.com/key
  const match = url.match(/amazonaws\.com\/(.+)$/);
  return match ? match[1] : null;
}
```

### Step 2.8: Update package.json

**Location:** `backend/package.json`

```json
{
  "dependencies": {
    "aws-sdk": "^2.1400.0",
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    // ... remove: "cloudinary": "^2.9.0"
    // ... rest of dependencies
  }
}
```

---

## PHASE 3: FRONTEND CHANGES

### Step 3.1: Update Config (Optional)

**Location:** `frontend/src/config.js`

```javascript
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Optional: AWS S3 config (only if doing client-side uploads later)
export const AWS_S3_BUCKET = "farmeasy-uploads";
export const AWS_REGION = "ap-south-1";
```

### Step 3.2: No Changes to Upload Components

**Files that need NO CHANGES:**
- `frontend/src/components/Vendor/VendorAddProduct.jsx` - FormData handling stays same
- `frontend/src/components/Vendor/vendorEditProduct.jsx` - Keep as-is
- `frontend/src/components/Profile.jsx` - Keep as-is
- All components doing uploads

**Why?** The FormData is sent to backend which now handles S3 upload internally.

### Step 3.3: No Changes to Image Display

Images are already stored as full URLs in database, so display code works unchanged:

```javascript
<img src={product.product_image} /> // Still works perfectly!
```

---

## PHASE 4: DATABASE CHANGES (OPTIONAL)

### When to use this phase:

If you want to:
- Store S3 metadata separately
- Enable easier image management
- Track S3 key for deletion

### Skip this if:
- You're happy storing just the full URL (recommended for simplicity)

### Optional Migration

**Location:** `backend/migrations/2026-04-04-s3-image-metadata.sql`

```sql
-- Optional: Add S3 key tracking
ALTER TABLE product ADD COLUMN s3_key VARCHAR(255) AFTER product_image;
ALTER TABLE users ADD COLUMN s3_profile_key VARCHAR(255) AFTER profile_image;
ALTER TABLE crop_exchange ADD COLUMN s3_keys JSON AFTER images;
```

### Update Controllers (if doing Phase 4)

```javascript
// In addProduct controller:
const imageRecord = {
  product_image: req.file.path, // Full S3 URL
  s3_key: req.file.filename,    // S3 key for deletion
};

// Store both in database for maximum flexibility
```

---

## PHASE 5: ENVIRONMENT SETUP

### Development Environment

**Location:** `backend/.env`

```env
# AWS S3 Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET_NAME=farmeasy-uploads
AWS_S3_FOLDER=farmeasy

# Database
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=farmeasy

# JWT
JWT_SECRET=your_secret_key

# Payment (Razorpay, Stripe)
RAZORPAY_KEY_ID=key_xxx
RAZORPAY_KEY_SECRET=secret_xxx

# Email
NODEMAILER_EMAIL=noreply@farmeasy.com
NODEMAILER_PASSWORD=your_app_password

# Google Translate
GOOGLE_TRANSLATE_API_KEY=your_key
```

### Production Environment (Render/Railway/Vercel)

**Steps:**
1. Log into your hosting platform (Render, Railway, Vercel, etc.)
2. Navigate to project settings → Environment Variables
3. Add all the AWS variables from above
4. Redeploy application

**Example for Render:**
```
Settings → Environment → Add Variables:
- AWS_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_S3_BUCKET_NAME
- AWS_S3_FOLDER
```

---

## PHASE 6: ERROR HANDLING UPDATE

### Add to Backend Controllers

Add proper error handling for S3 failures:

```javascript
// In any controller doing uploads:

const uploadProductImage = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // req.file.path now contains S3 URL (set by upload middleware)
    const productImageUrl = req.file.path;

    // Continue with product creation...
    const result = await db.query(
      'INSERT INTO product (product_name, product_image, ...) VALUES (?, ?, ...)',
      [productName, productImageUrl, ...]
    );

    res.json({ 
      success: true, 
      message: 'Product created successfully',
      image_url: productImageUrl 
    });

  } catch (err) {
    console.error('Upload error:', err);

    // Handle specific S3 errors
    if (err.code === 'NoSuchBucket') {
      return res.status(500).json({ 
        error: 'S3 bucket not found. Check AWS configuration' 
      });
    }
    
    if (err.code === 'AccessDenied') {
      return res.status(500).json({ 
        error: 'Not authorized to access S3 bucket' 
      });
    }

    if (err.code === 'RequestTimeout') {
      return res.status(500).json({ 
        error: 'Upload timed out. Please try again' 
      });
    }

    res.status(500).json({ 
      error: 'Upload failed. Please try again' 
    });
  }
};
```

### Add Client-Side Error Handling

**Location:** `frontend/src/components/Vendor/VendorAddProduct.jsx`

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setLoading(true);
    setError("");

    // Build FormData (same as before)
    const formData = new FormData();
    formData.append("product_name", formData.product_name);
    // ... other fields
    
    if (images.length > 0) {
      formData.append("product_image", images[0].file);
    }

    const res = await axios.post(
      `${API_URL}/api/vendor/products/add`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Success
    navigate("/vendor/products");

  } catch (err) {
    const message = err.response?.data?.error || 'Upload failed';
    
    // Handle different error scenarios
    if (message.includes('S3')) {
      setError('Server storage error. Contact support.');
    } else if (message.includes('file')) {
      setError('Invalid file. Please use JPEG or PNG.');
    } else {
      setError(message);
    }

  } finally {
    setLoading(false);
  }
};
```

---

## FILE MODIFICATION SUMMARY

| File | Action | What Changes | Complexity |
|------|--------|--------------|-----------|
| `backend/.env` | CREATE/UPDATE | Add AWS credentials | ⭐ Easy |
| `backend/config/s3.js` | CREATE | Initialize S3 client | ⭐ Easy |
| `backend/config/cloudinary.js` | DELETE | Remove Cloudinary | ⭐ Easy |
| `backend/middleware/upload.js` | REPLACE | Use S3 instead of Cloudinary | ⭐⭐ Medium |
| `backend/controllers/vendorController.js` | UPDATE | Update image deletion logic | ⭐⭐ Medium |
| `backend/controllers/profileController.js` | UPDATE | Update image deletion logic | ⭐⭐ Medium |
| `backend/package.json` | UPDATE | Remove cloudinary, add aws-sdk | ⭐ Easy |
| `backend/routes/*.js` | VIEW ONLY | Check upload usage (no changes) | ⭐ Easy |
| `frontend/src/config.js` | UPDATE (Optional) | Add S3 config vars | ⭐ Easy |
| `frontend/src/components/Vendor/VendorAddProduct.jsx` | NO CHANGE | FormData stays same | ✅ N/A |
| `frontend/src/components/Vendor/vendorEditProduct.jsx` | NO CHANGE | Upload stays same | ✅ N/A |
| `frontend/src/components/Profile.jsx` | NO CHANGE | Profile upload stays same | ✅ N/A |
| Database migrations | OPTIONAL | Store S3 keys (not required) | ⭐⭐ Medium |

---

## TESTING CHECKLIST

### Local Development Testing

**✓ AWS Configuration:**
- [ ] AWS credentials in `.env` are correct
- [ ] S3 bucket exists and is accessible
- [ ] Bucket name matches `AWS_S3_BUCKET_NAME` in `.env`

**✓ Upload Tests:**
- [ ] Upload product image → Check appears in S3 bucket console
- [ ] Upload profile picture → Verify in S3 bucket
- [ ] Upload multiple images → All appear in S3
- [ ] Large file upload (5MB) → Works correctly
- [ ] Invalid file type (PDF, ZIP) → Rejected with error message

**✓ Display Tests:**
- [ ] Product image displays on product detail page
- [ ] Profile image displays on profile page
- [ ] Images load in different browsers (Chrome, Firefox, Safari)
- [ ] Mobile image display works

**✓ Delete Tests:**
- [ ] Delete product → Image removed from S3
- [ ] Delete profile picture → Image removed from S3
- [ ] Delete with no image → No error thrown

**✓ Error Handling:**
- [ ] Invalid AWS credentials → Shows clear error
- [ ] S3 bucket doesn't exist → Shows clear error
- [ ] Network timeout → Graceful error message
- [ ] File too large → Rejected before upload

### Production Testing (After Deploy)

- [ ] Upload from production frontend → Works
- [ ] Image display from production → Images load
- [ ] Check S3 bucket → Files appear correctly
- [ ] Verify file access → Images publicly readable
- [ ] Test on different devices → Mobile, tablet, desktop
- [ ] Monitor costs → Check CloudWatch for upload volumes

---

## COST ESTIMATION

### AWS S3 Pricing Example (INR)

| Operation | Cost | Notes |
|-----------|------|-------|
| Storage (1GB) | ₹0.75/month | First 1GB free tier (1 yr) |
| Data transfer OUT (10GB) | ₹30/month | Largest cost driver |
| PUT requests (10K) | ₹1.6/month | File uploads |
| GET requests (100K) | ₹13/month | Image displays |
| Delete requests (1K) | ₹0.16/month | Image deletions |
| **MONTHLY TOTAL** | **~₹45-50/month** | For moderate usage |

**Free Tier (First 12 months):**
- 5GB storage
- 20K GET requests
- 2K PUT requests
- 100GB data transfer (various AWS services)

**Cost Reduction Tips:**
- Use S3 lifecycle policies to archive old images
- Enable CloudFront CDN for popular images (additional cost but faster)
- Compress images on frontend before upload
- Set object expiration for temp files

---

## ROLLBACK PLAN

**If something goes wrong:**

### Quick Rollback to Cloudinary

1. **Revert code:**
```bash
git revert <commit_hash>  # Revert to Cloudinary version
```

2. **Restore Cloudinary:**
```bash
npm install cloudinary
```

3. **Restore old middleware:**
```bash
git checkout backend/middleware/upload.js  # From old commit
git checkout backend/config/cloudinary.js
```

4. **Environment variables:**
```env
# Switch back to Cloudinary env vars
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

5. **Redeploy:**
```bash
git push heroku main  # or your deployment command
```

### Data Migration (if needed)

If images are needed from S3:
```javascript
// One-time script to download all S3 images and re-upload to Cloudinary
const s3 = require('aws-sdk/clients/s3');
const cloudinary = require('cloudinary');

// List all objects in S3
// Download each file
// Upload to Cloudinary
// Update database URLs
```

---

## QUICK START COMMAND REFERENCE

```bash
# Install AWS SDK
npm install aws-sdk

# Copy environment variables
cp .env.example .env
# Edit .env with your AWS credentials

# Create S3 config
touch backend/config/s3.js

# Update upload middleware
# (Copy contents from Phase 2.4 above)

# Test connection
npm run dev

# Check S3 bucket in AWS Console
# Upload a test image
# Verify it appears in S3 bucket
```

---

## SUPPORT & RESOURCES

**AWS Documentation:**
- [S3 Getting Started](https://docs.aws.amazon.com/s3/index.html)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [IAM User Guide](https://docs.aws.amazon.com/iam/)

**Multer Documentation:**
- [Multer GitHub](https://github.com/expressjs/multer)
- [Custom Storage Engine](https://github.com/expressjs/multer#storage)

**Troubleshooting:**
- Check AWS CloudWatch Logs for upload errors
- Verify IAM user has S3FullAccess permission
- Confirm bucket name and region match `.env`
- Check CORS settings if frontend uploads directly

---

## SUMMARY

✅ **What stays the same:**
- Frontend upload components (FormData approach works)
- API routes and endpoints
- Database schema (only add optional fields)
- User experience

✅ **What changes:**
- Upload backend (Cloudinary → S3)
- Configuration files (new S3 config)
- Error handling (S3-specific errors)
- Cost structure (lower with S3)

✅ **Estimated time:**
- Planning & review: 30 mins
- Implementation: 2-3 hours
- Testing: 1-2 hours
- Deployment: 30 mins
- **Total: 4-6 hours**

---

**Created:** April 4, 2026  
**Status:** Ready for Review  
**Next Step:** Review & Approve → Begin Phase 1
