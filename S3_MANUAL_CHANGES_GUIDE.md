# AWS S3 Manual Changes Guide for FarmEasy (UPDATED - Split Controllers)

**Purpose:** This guide shows you exactly what to change in each file to replace Cloudinary with AWS S3.

**Note:** vendorController.js has been split into 5 separate files for better organization.

---

## 📋 Summary of Files to Update

| File | Function | Change Type | Line # | Priority |
|------|----------|------------|--------|----------|
| `backend/controllers/vendorProductController.js` | `deleteProduct()` | Delete image logic | ~195 | HIGH ⭐ |
| `backend/controllers/vendorProfileController.js` | `updateProfile()` | Delete old image logic | ~70 | HIGH ⭐ |
| `backend/controllers/profileController.js` | Delete image logic | HIGH |
| `backend/controllers/exchangeListingController.js` | Delete image logic | HIGH |
| `backend/config/cloudinary.js` | DELETE FILE | HIGH |
| `backend/routes/*.js` | No changes needed | - |

---

## 🔄 ALREADY DONE ✅

### vendorProductController.js - deleteProduct()
**Location:** Line ~195
**Status:** ✅ **ALREADY IMPLEMENTED**

The `deleteProduct()` function already includes:
- S3 image deletion logic
- `extractS3KeyFromUrl()` helper function
- Error handling for S3 delete failures

**No action needed!** This is ready to use.

---

## 🔄 TODO: vendorProfileController.js - updateProfile()

**Location:** `backend/controllers/vendorProfileController.js` - Line ~70

### ❌ CURRENT CODE (No image deletion)
**Current State:**
```javascript
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      vendor_name, email, phone, address, city, state, pincode,
      bio, store_name, gst_number
    } = req.body;

    // S3Storage middleware uploads to S3 and req.file.path is the full S3 URL
    const profilePic = req.file ? req.file.path : null;

    // Update users table with personal info
    if (profilePic) {
      await db.query(`
        UPDATE users 
        SET full_name = ?, phone_number = ?, address = ?, city = ?, state = ?, pincode = ?, bio = ?, profile_pic = ?
        WHERE id = ?
      `, [...]);
    }
    // ... rest of code
  }
}
```

### ✅ WHAT TO ADD:
Before updating the profile picture in database, **delete the old S3 image** if it exists.

**Add this code after line 65 (after getting req.file.path):**

```javascript
// Get old profile picture to delete from S3
const [user] = await db.query(
  "SELECT profile_pic FROM users WHERE id = ?",
  [userId]
);

// Delete old image from S3
if (user[0].profile_pic && profilePic) {
  const s3Key = extractS3KeyFromUrl(user[0].profile_pic);
  
  s3.deleteObject(
    {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key
    },
    (error) => {
      if (error) {
        console.error("S3 Delete Error:", error);
        // Continue even if delete fails
      }
    }
  );
}
```

**Also add these imports at TOP of vendorProfileController.js:**
```javascript
const s3 = require("../config/s3");

// Helper function at BOTTOM of file
function extractS3KeyFromUrl(url) {
  try {
    const parts = url.split('.amazonaws.com/');
    if (parts.length > 1) {
      return parts[1];
    }
    return url;
  } catch (error) {
    console.error("Error extracting S3 key:", error);
    return url;
  }
}
```

---

## 🔄 TODO: profileController.js

### ❌ OLD CODE (Cloudinary)
## 🔄 TODO: profileController.js - Delete Profile Image

**Location:** `backend/controllers/profileController.js`

**Find the function that updates or deletes profile images and apply the same S3 deletion logic:**

Similar to vendorProfileController.js, when a user updates their profile picture:
1. Get the old profile picture URL
2. Extract S3 key from the URL
3. Delete from S3
4. Update database with new URL

**Same pattern as vendorProfileController.js** - look for functions that handle profile image updates and add S3 deletion.

---

## 🔄 TODO: exchangeListingController.js - Delete Exchange Image

**Location:** `backend/controllers/exchangeListingController.js`

**Find the delete listing function and apply S3 deletion logic:**

When deleting a crop exchange listing that has an image:
1. Get the listing with its image URL
2. Extract S3 key from the URL
3. Delete from S3
4. Delete listing from database

**Same pattern as vendorProductController.deleteProduct()** - look for delete listing functions.

---

## 🗑️ Change 4: Delete Cloudinary Config File

### Action: **DELETE THIS FILE**
- **File:** `backend/config/cloudinary.js`
- **Reason:** No longer needed (replaced by S3)

### Confirm deletion:
```bash
# Check if file exists
dir backend\config\cloudinary.js

# Delete it
del backend\config\cloudinary.js
```

---

## ✅ IMPORTANT REMINDERS

### Files Already Updated (No action needed)
✅ **vendorProductController.js** - deleteProduct() already has S3 deletion code
✅ **backend/middleware/upload.js** - Already uses S3 storage
✅ **backend/config/s3.js** - Already configured for S3
✅ **backend/.env** - AWS credentials already added

### Files That Still Need Updates
⚠️ **vendorProfileController.js** - Add S3 deletion to updateProfile()
⚠️ **profileController.js** - Add S3 deletion to profile image updates
⚠️ **exchangeListingController.js** - Add S3 deletion to delete listing function

### For Each File Update (DO THIS):

1. **Add import at TOP:**
```javascript
const s3 = require("../config/s3");
```

2. **Add helper function at BOTTOM:**
```javascript
function extractS3KeyFromUrl(url) {
  try {
    const parts = url.split('.amazonaws.com/');
    if (parts.length > 1) {
      return parts[1];
    }
    return url;
  } catch (error) {
    console.error("Error extracting S3 key:", error);
    return url;
  }
}
```

3. **Before updating/uploading new image, add:**
```javascript
// Get old image and delete it
if (oldImageUrl) {
  const s3Key = extractS3KeyFromUrl(oldImageUrl);
  
  s3.deleteObject(
    {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key
    },
    (error) => {
      if (error) console.error("S3 Delete Error:", error);
    }
  );
}
```

---

## 📊 Update Status Checklist

- [ ] **vendorProductController.js** ~ DONE ✅ (Already has S3 code)
- [ ] **vendorProfileController.js** - Add S3 deletion to updateProfile() (Line ~70)
- [ ] **profileController.js** - Add S3 deletion to profile functions
- [ ] **exchangeListingController.js** - Add S3 deletion to delete listing
- [ ] Remove Cloudinary imports from all files
- [ ] Delete `backend/config/cloudinary.js` file
- [ ] Test file deletion functionality

---

## 🚀 Test After Changes

1. **Upload a product image** → Should appear in S3 bucket
2. **Delete the product** → Image should be deleted from S3
3. **Check AWS S3 console** → Verify files are in `farmeasy/` folder
4. **Check backend logs** → Look for S3 connection success
5. **No Cloudinary images** → Confirm no images created in Cloudinary

---

## 📞 Quick Reference by Controller

**vendorProductController.js**
- File: `backend/controllers/vendorProductController.js`
- Function: `deleteProduct()` at line ~195
- Status: ✅ Already updated with S3 deletion

**vendorProfileController.js**
- File: `backend/controllers/vendorProfileController.js`
- Function: `updateProfile()` at line ~70
- Action: Add S3 deletion when profilePic exists

**profileController.js**
- File: `backend/controllers/profileController.js`
- Find: Profile picture update/delete functions
- Action: Add S3 deletion logic

**exchangeListingController.js**
- File: `backend/controllers/exchangeListingController.js`
- Find: Delete listing function
- Action: Add S3 deletion logic

---

**Status:** Most of the work is DONE ✅. You just need to add S3 deletion to 2-3 more functions!

If you encounter errors:
1. Check that `AWS_S3_BUCKET_NAME` is set in `.env`
2. Verify S3 credentials are correct
3. Check browser console for upload errors
4. Check backend logs for deletion errors

