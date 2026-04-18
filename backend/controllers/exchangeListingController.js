// =====================================================
// EXCHANGE LISTING CONTROLLER
// =====================================================
// Handles all crop exchange listing operations
// Create, browse, view, update, delete listings
// =====================================================

const CropExchange = require("../models/CropExchange");
const s3 = require("../config/s3");

// ===== UPLOAD EXCHANGE IMAGE TO S3 =====
// POST /api/exchange/upload-image
// Frontend uploads image, backend returns S3 URL
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided",
      });
    }

    // req.file.path is the full S3 HTTPS URL from S3Storage middleware
    const imageUrl = req.file.path;

    res.json({
      success: true,
      imageUrl, // Return S3 URL to frontend
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload image",
    });
  }
};

// ===== CREATE A NEW EXCHANGE LISTING =====
// POST /api/exchange/create
// Farmer creates a "I have X, I want Y" listing
exports.createListing = async (req, res) => {
  try {
    const {
      offering_crop,
      offering_quantity,
      offering_unit,
      seeking_crop,
      seeking_quantity,
      seeking_unit,
      latitude,
      longitude,
      radius_km,
      description,
      exchange_images,
    } = req.body;

    const user_id = req.user.id; // From auth middleware

    // ===== VALIDATION =====
    if (!offering_crop || !offering_quantity) {
      return res.status(400).json({
        error: "Offering crop and quantity are required",
      });
    }

    if (!seeking_crop) {
      return res.status(400).json({ error: "Seeking crop is required" });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: "Location (latitude, longitude) is required",
      });
    }

    // ===== CREATE LISTING =====
    const listingId = await CropExchange.create({
      user_id,
      offering_crop,
      offering_quantity,
      offering_unit: offering_unit || "kg",
      seeking_crop,
      seeking_quantity,
      seeking_unit: seeking_unit || "kg",
      latitude,
      longitude,
      radius_km: radius_km || 50,
      description,
      exchange_images,
    });

    res.json({
      success: true,
      message: "Exchange listing created successfully!",
      listingId,
    });
  } catch (err) {
    console.error("Create listing error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ===== BROWSE NEARBY LISTINGS =====
// GET /api/exchange/browse?latitude=28.123&longitude=77.456&crop=rice&radius=50
// Shows all available exchange listings within radius
exports.browseNearby = async (req, res) => {
  try {
    const { latitude, longitude, radius = 50, crop_type } = req.query;

    // ===== VALIDATION =====
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: "latitude and longitude required",
      });
    }

    // ===== FIND NEARBY LISTINGS =====
    let listings = await CropExchange.findNearby(latitude, longitude, radius);

    // ===== OPTIONAL CROP FILTER =====
    if (crop_type) {
      listings = listings.filter((l) =>
        l.seeking_crop.toLowerCase().includes(crop_type.toLowerCase())
      );
    }

    res.json(listings);
  } catch (err) {
    console.error("Browse nearby error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ===== GET SINGLE LISTING =====
// GET /api/exchange/:id
// View full details of one exchange listing
exports.getListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await CropExchange.findById(id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== GET USER'S OWN LISTINGS =====
// GET /api/exchange/my/listings
// Farmer sees all their own exchange listings
exports.getMyListings = async (req, res) => {
  try {
    const user_id = req.user.id;

    const listings = await CropExchange.getByUserId(user_id);

    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== UPDATE A LISTING =====
// PATCH /api/exchange/:id
// Farmer edits their listing before any match is made
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // ===== VERIFY OWNERSHIP =====
    const listing = await CropExchange.findById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (listing.user_id !== user_id) {
      return res.status(403).json({ error: "Not authorized to edit this listing" });
    }

    // ===== UPDATE =====
    await CropExchange.update(id, req.body);

    res.json({ success: true, message: "Listing updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== DELETE A LISTING =====
// DELETE /api/exchange/:id
// Farmer cancels their exchange listing
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // ===== VERIFY OWNERSHIP =====
    const listing = await CropExchange.findById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (listing.user_id !== user_id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // ===== DELETE IMAGES FROM S3 =====
    if (listing.exchange_images) {
      try {
        const imageUrls = Array.isArray(listing.exchange_images) 
          ? listing.exchange_images 
          : [listing.exchange_images];
        
        imageUrls.forEach(imageUrl => {
          if (imageUrl && imageUrl.includes('.amazonaws.com')) {
            const s3Key = extractS3KeyFromUrl(imageUrl);
            
            s3.deleteObject(
              {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: s3Key
              },
              (error) => {
                if (error) {
                  console.error("S3 Delete Error for exchange image:", error);
                }
              }
            );
          }
        });
      } catch (error) {
        console.error("Error deleting exchange images:", error);
        // Continue with deletion even if S3 delete fails
      }
    }

    // ===== DELETE =====
    await CropExchange.delete(id);

    res.json({ success: true, message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== HELPER FUNCTION: Extract S3 key from full S3 URL =====
function extractS3KeyFromUrl(url) {
  try {
    const parts = url.split('.amazonaws.com/');
    if (parts.length > 1) {
      return parts[1]; // Returns: farmeasy/filename.jpg
    }
    return url;
  } catch (error) {
    console.error("Error extracting S3 key:", error);
    return url;
  }
}
