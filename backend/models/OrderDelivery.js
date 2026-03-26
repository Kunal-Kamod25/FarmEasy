// =====================================================
// ORDER DELIVERY MODEL
// =====================================================
// Handles delivery operations
// - Create deliveries from orders
// - Assign drivers to deliveries
// - Update delivery status (pending→assigned→picked_up→on_way→delivered)
// - Track GPS locations & checkpoints
// - Manage delivery metrics (distance, time, ETA)
// =====================================================

const db = require("../config/db");

class OrderDelivery {
  // ========== CREATE DELIVERY ==========

  /**
   * Create delivery record from order
   * Called when order is confirmed
   */
  async createFromOrder(orderId, orderData) {
    const {
      pickup_address,
      delivery_address,
      pickup_latitude,
      pickup_longitude,
      delivery_latitude,
      delivery_longitude,
      special_instructions
    } = orderData;

    // Check order exists and isn't already assigned delivery
    const [existing] = await db.query(
      "SELECT id FROM order_deliveries WHERE order_id = ?",
      [orderId]
    );
    if (existing.length > 0) {
      throw new Error("Delivery already exists for this order");
    }

    // Calculate estimated distance & time using Haversine
    // Distance formula (in km)
    const estimatedDistance = this._calculateDistance(
      pickup_latitude,
      pickup_longitude,
      delivery_latitude,
      delivery_longitude
    );

    // Estimate time: ~30 km/hour average speed in city traffic
    const estimatedMinutes = Math.ceil((estimatedDistance / 30) * 60);

    // Calculate estimated delivery time (add buffer based on distance)
    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(
      estimatedDeliveryTime.getMinutes() + estimatedMinutes
    );

    const [result] = await db.query(
      `INSERT INTO order_deliveries (
        order_id, pickup_address, delivery_address,
        pickup_latitude, pickup_longitude,
        delivery_latitude, delivery_longitude,
        estimated_distance_km, estimated_time_minutes,
        estimated_delivery_time, special_instructions,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_assignment')`,
      [
        orderId,
        pickup_address || null,
        delivery_address || null,
        pickup_latitude || null,
        pickup_longitude || null,
        delivery_latitude || null,
        delivery_longitude || null,
        estimatedDistance,
        estimatedMinutes,
        estimatedDeliveryTime,
        special_instructions || null
      ]
    );

    return {
      id: result.insertId,
      order_id: orderId,
      status: "pending_assignment",
      estimated_distance_km: estimatedDistance,
      estimated_time_minutes: estimatedMinutes
    };
  }

  // ========== FIND & RETRIEVE ==========

  /**
   * Get delivery by ID with all details
   */
  async findById(deliveryId) {
    const [rows] = await db.query(
      `SELECT 
        od.*,
        CONCAT(u.firstName, ' ', u.lastName) as customer_name,
        u.phone as customer_phone,
        u.email as customer_email,
        CONCAT(d.driver_name) as driver_name,
        d.driver_phone,
        d.vehicle_type,
        d.vehicle_color,
        d.average_rating as driver_rating,
        o.total_amount as order_amount
      FROM order_deliveries od
      LEFT JOIN orders o ON od.order_id = o.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN delivery_drivers d ON od.driver_id = d.id
      WHERE od.id = ?`,
      [deliveryId]
    );

    if (rows.length === 0) {
      throw new Error("Delivery not found");
    }

    return rows[0];
  }

  /**
   * Get delivery by order ID
   */
  async findByOrderId(orderId) {
    const [rows] = await db.query(
      "SELECT * FROM order_deliveries WHERE order_id = ?",
      [orderId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get customer's delivery status for order tracking page
   */
  async getCustomerDelivery(orderId, userId) {
    const [rows] = await db.query(
      `SELECT 
        od.*,
        CONCAT(d.driver_name) as driver_name,
        d.driver_phone,
        d.vehicle_type,
        d.vehicle_color,
        d.current_latitude as driver_latitude,
        d.current_longitude as driver_longitude
      FROM order_deliveries od
      LEFT JOIN order_details o_detail ON od.order_id = o_detail.order_id
      LEFT JOIN delivery_drivers d ON od.driver_id = d.id
      WHERE od.order_id = ? AND o_detail.user_id = ?`,
      [orderId, userId]
    );

    if (rows.length === 0) {
      throw new Error("Order delivery not found");
    }

    return rows[0];
  }

  /**
   * Get deliveries by status
   */
  async findByStatus(status, limit = 20, offset = 0) {
    const [rows] = await db.query(
      `SELECT od.*, d.driver_name, d.driver_phone
      FROM order_deliveries od
      LEFT JOIN delivery_drivers d ON od.driver_id = d.id
      WHERE od.status = ?
      ORDER BY od.updated_at DESC
      LIMIT ? OFFSET ?`,
      [status, limit, offset]
    );

    return rows;
  }

  // ========== DRIVER ASSIGNMENT ==========

  /**
   * Assign driver to delivery
   * Must find available driver and update delivery
   */
  async assignDriver(deliveryId, driverId) {
    // Verify delivery exists and is unassigned
    const delivery = await this.findById(deliveryId);
    
    if (delivery.driver_id) {
      throw new Error("Delivery already has assigned driver");
    }

    if (delivery.status !== "pending_assignment") {
      throw new Error("Can only assign driver to pending deliveries");
    }

    // Update delivery with driver
    const [result] = await db.query(
      `UPDATE order_deliveries 
      SET driver_id = ?, status = 'assigned', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [driverId, deliveryId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to assign driver");
    }

    // Update driver status if no other active delivery
    return this.findById(deliveryId);
  }

  // ========== DELIVERY STATUS UPDATES ==========

  /**
   * Update delivery status with audit trail
   * Valid transitions: assigned → accepted → picked_up → on_the_way → delivered
   */
  async updateStatus(deliveryId, newStatus, driverId, notes = null) {
    // Get current delivery to verify status transition
    const delivery = await this.findById(deliveryId);

    // Define valid status transitions
    const validTransitions = {
      pending_assignment: ["assigned"],
      assigned: ["accepted", "failed"],
      accepted: ["picked_up", "failed"],
      picked_up: ["on_the_way", "failed"],
      on_the_way: ["delivered", "failed"],
      delivered: [],
      failed: []
    };

    // Verify valid transition
    if (!validTransitions[delivery.status]?.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from '${delivery.status}' to '${newStatus}'`
      );
    }

    // Get driver's current location
    const driver = await db.query(
      "SELECT current_latitude, current_longitude FROM delivery_drivers WHERE id = ?",
      [driverId]
    );

    let latitude = null,
      longitude = null;
    if (driver[0].length > 0) {
      latitude = driver[0][0].current_latitude;
      longitude = driver[0][0].current_longitude;
    }

    // Update delivery status
    const updateData = {
      status: newStatus,
      updated_at: new Date()
    };

    // Track completion metrics
    if (newStatus === "delivered") {
      updateData.actual_delivery_time = new Date();
      // Calculate actual delivery time in minutes
      const createdTime = new Date(delivery.created_at);
      updateData.actual_time_minutes = Math.round(
        (updateData.actual_delivery_time - createdTime) / (1000 * 60)
      );
    }

    // Build and execute update
    let query = "UPDATE order_deliveries SET ";
    const values = [];
    const fields = [];

    for (const [key, val] of Object.entries(updateData)) {
      fields.push(`${key} = ?`);
      values.push(val);
    }

    query += fields.join(", ") + " WHERE id = ?";
    values.push(deliveryId);

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      throw new Error("Failed to update delivery status");
    }

    // Log status change in history table
    await db.query(
      `INSERT INTO delivery_status_history (
        delivery_id, previous_status, new_status, changed_by, notes, latitude, longitude
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        deliveryId,
        delivery.status,
        newStatus,
        driverId,
        notes || null,
        latitude,
        longitude
      ]
    );

    return this.findById(deliveryId);
  }

  /**
   * Get status history for delivery
   */
  async getStatusHistory(deliveryId) {
    const [rows] = await db.query(
      `SELECT 
        dsh.*,
        d.driver_name
      FROM delivery_status_history dsh
      LEFT JOIN delivery_drivers d ON dsh.changed_by = d.id
      WHERE dsh.delivery_id = ?
      ORDER BY dsh.changed_at ASC`,
      [deliveryId]
    );

    return rows;
  }

  // ========== GPS CHECKPOINTS ==========

  /**
   * Record GPS checkpoint as driver moves
   * Called by driver app periodically with location update
   */
  async recordCheckpoint(deliveryId, driverId, latitude, longitude, address = null) {
    // Validate GPS coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error("Invalid GPS coordinates");
    }

    // Verify delivery is active
    const delivery = await this.findById(deliveryId);
    if (!["picked_up", "on_the_way"].includes(delivery.status)) {
      throw new Error("Checkpoints can only be recorded for active deliveries");
    }

    // Insert checkpoint
    const [result] = await db.query(
      `INSERT INTO gps_checkpoints (
        delivery_id, driver_id, latitude, longitude, address
      ) VALUES (?, ?, ?, ?, ?)`,
      [deliveryId, driverId, latitude, longitude, address || null]
    );

    // Update driver's current location
    await db.query(
      "UPDATE delivery_drivers SET current_latitude = ?, current_longitude = ? WHERE id = ?",
      [latitude, longitude, driverId]
    );

    return {
      id: result.insertId,
      delivery_id: deliveryId,
      latitude,
      longitude
    };
  }

  /**
   * Get GPS route/path for delivery
   * Shows all checkpoint locations driven by driver
   */
  async getRoute(deliveryId) {
    const [rows] = await db.query(
      `SELECT 
        id, latitude, longitude, address, timestamp
      FROM gps_checkpoints
      WHERE delivery_id = ?
      ORDER BY timestamp ASC`,
      [deliveryId]
    );

    return rows;
  }

  /**
   * Get latest GPS location of delivery
   */
  async getLatestLocation(deliveryId) {
    const [rows] = await db.query(
      `SELECT 
        id, latitude, longitude, address, timestamp
      FROM gps_checkpoints
      WHERE delivery_id = ?
      ORDER BY timestamp DESC
      LIMIT 1`,
      [deliveryId]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  // ========== DISTANCE & ETA ==========

  /**
   * Calculate distance using Haversine formula
   * Returns distance in kilometers
   */
  _calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c + Number.EPSILON) * 100) / 100; // 2 decimals
  }

  /**
   * Update ETA based on current location and remaining distance
   */
  async updateETA(deliveryId, driverId) {
    // Get delivery details
    const delivery = await this.findById(deliveryId);

    // Get driver's current location
    const [driver] = await db.query(
      "SELECT current_latitude, current_longitude FROM delivery_drivers WHERE id = ?",
      [driverId]
    );

    if (driver.length === 0) {
      throw new Error("Driver not found");
    }

    // Calculate remaining distance
    const remainingDistance = this._calculateDistance(
      driver[0].current_latitude,
      driver[0].current_longitude,
      delivery.delivery_latitude,
      delivery.delivery_longitude
    );

    // Estimate remaining time (30 km/hour average)
    const remainingMinutes = Math.ceil((remainingDistance / 30) * 60);

    // Calculate new ETA
    const newETA = new Date();
    newETA.setMinutes(newETA.getMinutes() + remainingMinutes);

    await db.query(
      "UPDATE order_deliveries SET estimated_delivery_time = ? WHERE id = ?",
      [newETA, deliveryId]
    );

    return {
      estimated_delivery_time: newETA,
      remaining_distance_km: remainingDistance,
      remaining_time_minutes: remainingMinutes
    };
  }

  // ========== ANALYTICS & REPORTS ==========

  /**
   * Get delivery analytics
   */
  async getAnalytics(startDate, endDate) {
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total_deliveries,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        AVG(actual_distance_km) as avg_distance_km,
        AVG(actual_time_minutes) as avg_time_minutes,
        AVG(DATEDIFF(actual_delivery_time, estimated_delivery_time)) as avg_time_variance_days
      FROM order_deliveries
      WHERE created_at BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    return stats[0];
  }

  /**
   * Get pending deliveries needing driver assignment
   */
  async getPendingAssignments() {
    const [rows] = await db.query(
      `SELECT 
        od.*,
        CONCAT(u.firstName, ' ', u.lastName) as customer_name,
        u.phone as customer_phone,
        o.total_amount
      FROM order_deliveries od
      JOIN orders o ON od.order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE od.status = 'pending_assignment'
      ORDER BY od.created_at ASC`,
      []
    );

    return rows;
  }

  /**
   * Get deliveries nearing timeout (not delivered past ETA)
   */
  async getDelayedDeliveries() {
    const [rows] = await db.query(
      `SELECT 
        od.*,
        CONCAT(u.firstName, ' ', u.lastName) as customer_name,
        TIMESTAMPDIFF(MINUTE, od.estimated_delivery_time, NOW()) as minutes_delayed
      FROM order_deliveries od
      JOIN orders o ON od.order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE od.status IN ('assigned', 'accepted', 'picked_up', 'on_the_way')
        AND od.estimated_delivery_time < NOW()
      ORDER BY minutes_delayed DESC`,
      []
    );

    return rows;
  }
}

module.exports = new OrderDelivery();
