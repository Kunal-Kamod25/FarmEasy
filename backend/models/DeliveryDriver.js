// =====================================================
// DELIVERY DRIVER MODEL
// =====================================================
// Handles database operations for delivery drivers
// - Register/onboard drivers
// - Manage driver availability & location
// - Track driver statistics & ratings
// - Driver profile management
// =====================================================

const db = require("../config/db");

class DeliveryDriver {
  // ========== CREATE & REGISTRATION ==========
  
  /**
   * Register a new delivery driver
   * @param {Object} driverData - Driver information
   * @returns {Promise<{id, driver_name, driver_phone}>} Created driver
   */
  async create(driverData) {
    const {
      driver_name,
      driver_phone,
      driver_email,
      license_number,
      vehicle_type,
      vehicle_color,
      vehicle_registration,
      license_image,
      vehicle_image,
      user_id
    } = driverData;

    // Validation
    if (!driver_name || !driver_phone) {
      throw new Error("Driver name and phone are required");
    }

    // Check phone already exists
    const [existing] = await db.query(
      "SELECT id FROM delivery_drivers WHERE driver_phone = ?",
      [driver_phone]
    );
    if (existing.length > 0) {
      throw new Error("Phone number already registered as driver");
    }

    // Insert new driver
    const [result] = await db.query(
      "INSERT INTO delivery_drivers (driver_name, driver_phone, driver_email, license_number, vehicle_type, vehicle_color, vehicle_registration, license_image, vehicle_image, user_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'offline')",
      [
        driver_name,
        driver_phone,
        driver_email || null,
        license_number || null,
        vehicle_type || null,
        vehicle_color || null,
        vehicle_registration || null,
        license_image || null,
        vehicle_image || null,
        user_id || null
      ]
    );

    return {
      id: result.insertId,
      driver_name,
      driver_phone,
      status: "offline"
    };
  }

  // ========== FIND & SEARCH ==========

  /**
   * Get single driver by ID with full details
   */
  async findById(driverId) {
    const [rows] = await db.query(
      `SELECT 
        d.*,
        COUNT(od.id) as total_assignments,
        COUNT(CASE WHEN od.status = 'delivered' THEN 1 END) as completed_deliveries
      FROM delivery_drivers d
      LEFT JOIN order_deliveries od ON d.id = od.driver_id
      WHERE d.id = ?
      GROUP BY d.id`,
      [driverId]
    );

    if (rows.length === 0) {
      throw new Error("Driver not found");
    }

    return rows[0];
  }

  /**
   * Get driver by phone number
   */
  async findByPhone(phone) {
    const [rows] = await db.query(
      "SELECT * FROM delivery_drivers WHERE driver_phone = ?",
      [phone]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find available drivers near pickup location
   * Use Haversine formula to find drivers within radius
   * @param {number} latitude - Pickup latitude
   * @param {number} longitude - Pickup longitude  
   * @param {number} radiusKm - Search radius in km
   * @param {number} limit - Max results to return
   */
  async findNearby(latitude, longitude, radiusKm = 10, limit = 5) {
    // Haversine SQL formula for distance calculation
    // Returns distance in kilometers
    const [rows] = await db.query(
      `SELECT 
        d.*,
        (
          6371 * acos(
            cos(radians(?)) * 
            cos(radians(d.current_latitude)) * 
            cos(radians(d.current_longitude) - radians(?)) + 
            sin(radians(?)) * 
            sin(radians(d.current_latitude))
          )
        ) as distance_km
      FROM delivery_drivers d
      WHERE d.status = 'available'
        AND d.current_latitude IS NOT NULL
        AND d.current_longitude IS NOT NULL
      HAVING distance_km <= ?
      ORDER BY distance_km ASC
      LIMIT ?`,
      [latitude, longitude, latitude, radiusKm, limit]
    );

    return rows;
  }

  /**
   * Get all available drivers (sorting by rating & recent deliveries)
   */
  async getAvailableDrivers(limit = 10) {
    const [rows] = await db.query(
      `SELECT 
        d.*,
        COUNT(od.id) as active_deliveries
      FROM delivery_drivers d
      LEFT JOIN order_deliveries od ON d.id = od.driver_id AND od.status IN ('assigned', 'accepted', 'picked_up', 'on_the_way')
      WHERE d.status = 'available'
      GROUP BY d.id
      HAVING active_deliveries < 3
      ORDER BY d.average_rating DESC, d.successful_deliveries DESC
      LIMIT ?`,
      [limit]
    );

    return rows;
  }

  // ========== STATUS MANAGEMENT ==========

  /**
   * Update driver online/offline status
   */
  async updateStatus(driverId, status) {
    if (!["available", "on_delivery", "offline"].includes(status)) {
      throw new Error("Invalid status. Must be: available, on_delivery, or offline");
    }

    const [result] = await db.query(
      "UPDATE delivery_drivers SET status = ? WHERE id = ?",
      [status, driverId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Driver not found");
    }

    return { id: driverId, status };
  }

  /**
   * Update driver's current GPS location
   * Called by driver app when location changes
   */
  async updateLocation(driverId, latitude, longitude) {
    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error("Invalid GPS coordinates");
    }

    const [result] = await db.query(
      "UPDATE delivery_drivers SET current_latitude = ?, current_longitude = ? WHERE id = ?",
      [latitude, longitude, driverId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Driver not found");
    }

    return { id: driverId, latitude, longitude };
  }

  // ========== DELIVERY ASSIGNMENTS ==========

  /**
   * Get all deliveries assigned to driver
   */
  async getAssignedDeliveries(driverId) {
    const [rows] = await db.query(
      `SELECT 
        od.*,
        CONCAT(u.firstName, ' ', u.lastName) as customer_name,
        u.phone as customer_phone,
        o.total_amount as order_amount
      FROM order_deliveries od
      JOIN orders o ON od.order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE od.driver_id = ? AND od.status IN ('assigned', 'accepted', 'picked_up', 'on_the_way')
      ORDER BY od.updated_at DESC`,
      [driverId]
    );

    return rows;
  }

  /**
   * Get current active delivery for driver (if any)
   */
  async getCurrentDelivery(driverId) {
    const [rows] = await db.query(
      `SELECT od.*, o.total_amount 
      FROM order_deliveries od
      JOIN orders o ON od.order_id = o.id
      WHERE od.driver_id = ? AND od.status IN ('picked_up', 'on_the_way')
      ORDER BY od.updated_at DESC LIMIT 1`,
      [driverId]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  // ========== STATISTICS & RATINGS ==========

  /**
   * Get driver statistics
   */
  async getStats(driverId) {
    const [rows] = await db.query(
      `SELECT 
        COUNT(*) as total_deliveries,
        COUNT(CASE WHEN od.status = 'delivered' THEN 1 END) as successful_deliveries,
        COUNT(CASE WHEN od.status = 'failed' THEN 1 END) as failed_deliveries,
        AVG(dr.rating) as average_rating,
        SUM(od.actual_distance_km) as total_distance_km,
        AVG(od.actual_time_minutes) as avg_delivery_time_minutes
      FROM order_deliveries od
      LEFT JOIN delivery_reviews dr ON od.id = dr.delivery_id
      WHERE od.driver_id = ?`,
      [driverId]
    );

    return rows[0] || {
      total_deliveries: 0,
      successful_deliveries: 0,
      failed_deliveries: 0,
      average_rating: null,
      total_distance_km: null,
      avg_delivery_time_minutes: null
    };
  }

  /**
   * Update driver's overall rating (called after new review submitted)
   */
  async updateAverageRating(driverId) {
    const [ratings] = await db.query(
      `SELECT AVG(rating) as avg_rating
      FROM delivery_reviews
      WHERE driver_id = ?`,
      [driverId]
    );

    const avgRating = ratings[0]?.avg_rating || 0;

    await db.query(
      "UPDATE delivery_drivers SET average_rating = ? WHERE id = ?",
      [avgRating, driverId]
    );

    return { id: driverId, average_rating: avgRating };
  }

  /**
   * Get recent reviews for driver
   */
  async getReviews(driverId, limit = 10) {
    const [rows] = await db.query(
      `SELECT 
        dr.*,
        CONCAT(u.firstName, ' ', u.lastName) as reviewer_name,
        od.order_id
      FROM delivery_reviews dr
      JOIN users u ON dr.user_id = u.id
      JOIN order_deliveries od ON dr.delivery_id = od.id
      WHERE dr.driver_id = ?
      ORDER BY dr.created_at DESC
      LIMIT ?`,
      [driverId, limit]
    );

    return rows;
  }

  // ========== UPDATE PROFILE ==========

  /**
   * Update driver profile details
   */
  async update(driverId, updateData) {
    const allowedFields = [
      "driver_name",
      "driver_email",
      "vehicle_type",
      "vehicle_color",
      "vehicle_registration",
      "license_image",
      "vehicle_image"
    ];

    // Build dynamic query
    let query = "UPDATE delivery_drivers SET ";
    const values = [];
    const fields = [];

    for (const key in updateData) {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    }

    if (fields.length === 0) {
      throw new Error("No valid fields to update");
    }

    query += fields.join(", ") + " WHERE id = ?";
    values.push(driverId);

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      throw new Error("Driver not found");
    }

    return this.findById(driverId);
  }

  /**
   * Delete driver (soft delete by marking offline)
   */
  async delete(driverId) {
    const [result] = await db.query(
      "UPDATE delivery_drivers SET status = 'offline' WHERE id = ?",
      [driverId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Driver not found");
    }

    return { id: driverId, status: "offline" };
  }
}

module.exports = new DeliveryDriver();
