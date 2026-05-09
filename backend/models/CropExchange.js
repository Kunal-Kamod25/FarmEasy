// =====================================================
// CropExchange Model
// =====================================================
// Handles all database operations for crop exchange listings
// Like: create listing, find nearby, search, update status
// =====================================================

const db = require("../config/db");

class CropExchange {
  // ===== CREATE NEW EXCHANGE LISTING =====
  // A farmer creates a new listing saying:
  // "I have 50kg wheat, I want 30kg rice within 50km radius"
  static async create(data) {
    const {
      user_id,
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
    } = data;

    const query = `
      INSERT INTO crop_exchanges 
      (user_id, offering_crop, offering_quantity, offering_unit, 
       seeking_crop, seeking_quantity, seeking_unit, 
       latitude, longitude, radius_km, description, exchange_images, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
    `;

    const [result] = await db.query(query, [
      user_id,
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
      JSON.stringify(exchange_images || []),
    ]);

    return result.insertId;
  }

  // ===== FIND LISTINGS BY ID =====
  // Get full details of one exchange listing
  static async findById(id) {
    const query = `
      SELECT ce.*, u.full_name, u.phone_number, u.city, u.state, u.profile_pic
      FROM crop_exchanges ce
      JOIN users u ON ce.user_id = u.id
      WHERE ce.id = ?
    `;

    const [results] = await db.query(query, [id]);

    if (results.length > 0) {
      // Parse JSON images array
      results[0].exchange_images = JSON.parse(results[0].exchange_images || "[]");
      return results[0];
    }
    return null;
  }

  // ===== FIND NEARBY LISTINGS =====
  // Returns all open listings within radius_km using Haversine formula
  // Haversine = math formula to calculate distance between 2 GPS coordinates
  static async findNearby(latitude, longitude, radiusKm = 50) {
    const query = `
      SELECT 
        ce.*,
        u.full_name,
        u.phone_number,
        u.city,
        u.state,
        u.profile_pic,
        (
          6371 * 2 * ASIN(SQRT(
            POWER(SIN((RADIANS(ce.latitude) - RADIANS(?)) / 2), 2) +
            COS(RADIANS(?)) * COS(RADIANS(ce.latitude)) *
            POWER(SIN((RADIANS(ce.longitude) - RADIANS(?)) / 2), 2)
          ))
        ) AS distance_km
      FROM crop_exchanges ce
      JOIN users u ON ce.user_id = u.id
      WHERE ce.status = 'open'
      HAVING distance_km <= ?
      ORDER BY distance_km ASC
    `;

    const [results] = await db.query(query, [latitude, latitude, longitude, radiusKm]);

    // Parse images for each listing
    results.forEach((listing) => {
      listing.exchange_images = JSON.parse(listing.exchange_images || "[]");
    });
    return results;
  }

  // ===== SEARCH BY CROP TYPE =====
  // Find all listings seeking a specific crop (like all listings needing "rice")
  static async searchBySeeking(seekingCrop) {
    const query = `
      SELECT ce.*, u.full_name, u.city, u.state
      FROM crop_exchanges ce
      JOIN users u ON ce.user_id = u.id
      WHERE ce.status = 'open' 
        AND LOWER(ce.seeking_crop) LIKE LOWER(?)
      ORDER BY ce.created_at DESC
    `;

    const [results] = await db.query(query, [`%${seekingCrop}%`]);

    results.forEach((listing) => {
      listing.exchange_images = JSON.parse(listing.exchange_images || "[]");
    });
    return results;
  }

  // ===== GET USER'S OWN LISTINGS =====
  // Return all listings created by a specific farmer
  static async getByUserId(user_id) {
    const query = `
      SELECT * FROM crop_exchanges 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;

    const [results] = await db.query(query, [user_id]);

    results.forEach((listing) => {
      listing.exchange_images = JSON.parse(listing.exchange_images || "[]");
    });
    return results;
  }

  // ===== UPDATE LISTING STATUS =====
  // Change status from 'open' to 'matched' or 'completed' or 'cancelled'
  static async updateStatus(id, status) {
    const query = `
      UPDATE crop_exchanges 
      SET status = ?, updated_at = NOW() 
      WHERE id = ?
    `;

    const [result] = await db.query(query, [status, id]);
    return result;
  }

  // ===== UPDATE LISTING DETAILS =====
  // Farmer can edit their listing before it's matched
  static async update(id, data) {
    const allowedFields = [
      "offering_crop",
      "offering_quantity",
      "offering_unit",
      "seeking_crop",
      "seeking_quantity",
      "seeking_unit",
      "description",
      "radius_km",
    ];

    // Build dynamic UPDATE query to be secure
    const fields = Object.keys(data)
      .filter((key) => allowedFields.includes(key))
      .map((key) => `${key} = ?`);

    if (fields.length === 0) return { affectedRows: 0 };

    const values = Object.keys(data)
      .filter((key) => allowedFields.includes(key))
      .map((key) => data[key]);

    const query = `UPDATE crop_exchanges SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;

    const [result] = await db.query(query, [...values, id]);
    return result;
  }

  // ===== DELETE LISTING =====
  // Farmer cancels their exchange listing
  static async delete(id) {
    const query = `DELETE FROM crop_exchanges WHERE id = ?`;
    const [result] = await db.query(query, [id]);
    return result;
  }

  // ===== GET TRENDING CROPS =====
  // Show what crops are being exchanged the most
  static async getTrendingCrops() {
    const query = `
      SELECT 
        seeking_crop as crop_name,
        COUNT(*) as demand_count
      FROM crop_exchanges
      WHERE status = 'open'
      GROUP BY seeking_crop
      ORDER BY demand_count DESC
      LIMIT 10
    `;

    const [results] = await db.query(query);
    return results;
  }
}

module.exports = CropExchange;
