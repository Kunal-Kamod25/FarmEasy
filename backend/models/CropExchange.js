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

    return new Promise((resolve, reject) => {
      db.query(
        query,
        [
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
        ],
        (err, result) => {
          if (err) reject(err);
          else resolve(result.insertId); // Return the new listing ID
        }
      );
    });
  }

  // ===== FIND LISTINGS BY ID =====
  // Get full details of one exchange listing
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ce.*, u.full_name, u.phone_number, u.city, u.state, u.profile_pic
        FROM crop_exchanges ce
        JOIN users u ON ce.user_id = u.id
        WHERE ce.id = ?
      `;

      db.query(query, [id], (err, results) => {
        if (err) reject(err);
        else {
          if (results.length > 0) {
            // Parse JSON images array
            results[0].exchange_images = JSON.parse(
              results[0].exchange_images || "[]"
            );
            resolve(results[0]);
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  // ===== FIND NEARBY LISTINGS =====
  // Returns all open listings within radius_km using Haversine formula
  // Haversine = math formula to calculate distance between 2 GPS coordinates
  static async findNearby(latitude, longitude, radiusKm = 50) {
    return new Promise((resolve, reject) => {
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

      db.query(
        query,
        [latitude, latitude, longitude, radiusKm],
        (err, results) => {
          if (err) reject(err);
          else {
            // Parse images for each listing
            results.forEach((listing) => {
              listing.exchange_images = JSON.parse(
                listing.exchange_images || "[]"
              );
            });
            resolve(results);
          }
        }
      );
    });
  }

  // ===== SEARCH BY CROP TYPE =====
  // Find all listings seeking a specific crop (like all listings needing "rice")
  static async searchBySeeking(seekingCrop) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ce.*, u.full_name, u.city, u.state
        FROM crop_exchanges ce
        JOIN users u ON ce.user_id = u.id
        WHERE ce.status = 'open' 
          AND LOWER(ce.seeking_crop) LIKE LOWER(?)
        ORDER BY ce.created_at DESC
      `;

      db.query(query, [`%${seekingCrop}%`], (err, results) => {
        if (err) reject(err);
        else {
          results.forEach((listing) => {
            listing.exchange_images = JSON.parse(
              listing.exchange_images || "[]"
            );
          });
          resolve(results);
        }
      });
    });
  }

  // ===== GET USER'S OWN LISTINGS =====
  // Return all listings created by a specific farmer
  static async getByUserId(user_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM crop_exchanges 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `;

      db.query(query, [user_id], (err, results) => {
        if (err) reject(err);
        else {
          results.forEach((listing) => {
            listing.exchange_images = JSON.parse(
              listing.exchange_images || "[]"
            );
          });
          resolve(results);
        }
      });
    });
  }

  // ===== UPDATE LISTING STATUS =====
  // Change status from 'open' to 'matched' or 'completed' or 'cancelled'
  static async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE crop_exchanges 
        SET status = ?, updated_at = NOW() 
        WHERE id = ?
      `;

      db.query(query, [status, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
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

    if (fields.length === 0) return Promise.resolve({ affectedRows: 0 });

    const values = Object.keys(data)
      .filter((key) => allowedFields.includes(key))
      .map((key) => data[key]);

    const query = `UPDATE crop_exchanges SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.query(query, [...values, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // ===== DELETE LISTING =====
  // Farmer cancels their exchange listing
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM crop_exchanges WHERE id = ?`;
      db.query(query, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // ===== GET TRENDING CROPS =====
  // Show what crops are being exchanged the most
  static async getTrendingCrops() {
    return new Promise((resolve, reject) => {
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

      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
}

module.exports = CropExchange;
