// =====================================================
// DELIVERY DRIVER CONTROLLER
// =====================================================
// Handles driver registration, profile, and status management
// - Driver registration with vehicle details
// - Driver profile retrieval
// - Status updates (available/on_delivery/offline)
// - GPS location updates and tracking
// - Driver availability search
// =====================================================

const DeliveryDriver = require("../models/DeliveryDriver");
const OrderDelivery = require("../models/OrderDelivery");
const DeliveryNotification = require("../models/DeliveryNotification");
const db = require("../config/db");

class DeliveryDriverController {
  /**
   * POST /api/delivery/driver/register
   * Register new delivery driver
   * Body: { driver_name, driver_phone, driver_email, license_number, vehicle_type, ... }
   */
  async registerDriver(req, res) {
    try {
      const { driver_name, driver_phone, driver_email, license_number, vehicle_type } =
        req.body;

      // Validation
      if (!driver_name || !driver_phone) {
        return res
          .status(400)
          .json({ message: "Driver name and phone are required" });
      }

      if (!/^[\d\s\-\+()]+$/.test(driver_phone)) {
        return res.status(400).json({ message: "Invalid phone number" });
      }

      // Create driver
      const driver = await DeliveryDriver.create({
        driver_name,
        driver_phone,
        driver_email,
        license_number,
        vehicle_type,
        vehicle_color: req.body.vehicle_color,
        vehicle_registration: req.body.vehicle_registration,
        license_image: req.body.license_image,
        vehicle_image: req.body.vehicle_image,
        user_id: req.user?.id || null
      });

      return res
        .status(201)
        .json({ message: "Driver registered successfully", driver });
    } catch (error) {
      console.error("Driver registration error:", error.message);
      return res
        .status(error.message.includes("already") ? 400 : 500)
        .json({ message: error.message || "Failed to register driver" });
    }
  }

  /**
   * GET /api/delivery/driver/me
   * Get authenticated driver's profile with stats and reviews
   */
  async getDriverProfile(req, res) {
    try {
      const driverId = req.params.driverId || req.body.driverId;

      const driver = await DeliveryDriver.findById(driverId);
      const stats = await DeliveryDriver.getStats(driverId);
      const reviews = await DeliveryDriver.getReviews(driverId, 5);

      return res.json({
        driver,
        statistics: stats,
        recent_reviews: reviews
      });
    } catch (error) {
      console.error("Get driver profile error:", error.message);
      return res.status(404).json({ message: error.message });
    }
  }

  /**
   * PATCH /api/delivery/driver/status
   * Update driver's online/offline/on-delivery status
   * Body: { status: "available" | "on_delivery" | "offline" }
   */
  async updateDriverStatus(req, res) {
    try {
      const driverId = req.params.driverId;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updated = await DeliveryDriver.updateStatus(driverId, status);

      return res.json({ message: "Status updated", driver: updated });
    } catch (error) {
      console.error("Update driver status error:", error.message);
      return res
        .status(error.message.includes("Invalid") ? 400 : 500)
        .json({ message: error.message });
    }
  }

  /**
   * POST /api/delivery/location/update
   * Update driver's current GPS location
   * Body: { latitude, longitude, address }
   * Called by driver app periodically (every few seconds/minutes)
   */
  async updateDriverLocation(req, res) {
    try {
      const driverId = req.params.driverId;
      const { latitude, longitude, address } = req.body;

      // Validation
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: "Latitude and longitude required" });
      }

      // Update driver location
      const updated = await DeliveryDriver.updateLocation(driverId, latitude, longitude);

      // If driver has active delivery, record GPS checkpoint
      const activeDelivery = await DeliveryDriver.getCurrentDelivery(driverId);
      if (activeDelivery) {
        // Record location as checkpoint
        await OrderDelivery.recordCheckpoint(
          activeDelivery.id,
          driverId,
          latitude,
          longitude,
          address
        );

        // Check if driver is arriving (within 5km) and send notification if needed
        if (activeDelivery.delivery_latitude && activeDelivery.delivery_longitude) {
          const distanceToDelivery = OrderDelivery.prototype._calculateDistance(
            latitude,
            longitude,
            activeDelivery.delivery_latitude,
            activeDelivery.delivery_longitude
          );

          // Send "arriving soon" notification when within 5 km
          if (distanceToDelivery <= 5) {
            const etaMinutes = Math.ceil((distanceToDelivery / 30) * 60);
            // Get customer ID from order
            const [order] = await db.query(
              "SELECT user_id FROM orders WHERE id = ?",
              [activeDelivery.order_id]
            );

            if (order.length > 0) {
              await DeliveryNotification.createDriverArrivingNotification(
                activeDelivery.id,
                order[0].user_id,
                etaMinutes
              );
            }
          }
        }

        // Update ETA estimation
        await OrderDelivery.updateETA(activeDelivery.id, driverId);
      }

      return res.json({
        message: "Location updated",
        location: updated,
        active_delivery: activeDelivery ? activeDelivery.id : null
      });
    } catch (error) {
      console.error("Update location error:", error.message);
      return res
        .status(error.message.includes("Invalid") ? 400 : 500)
        .json({ message: error.message });
    }
  }

  /**
   * GET /api/delivery/available-drivers
   * Get list of available drivers nearby using Haversine distance calculation
   * Query: { latitude, longitude, radius }
   */
  async getAvailableDrivers(req, res) {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      if (!latitude || !longitude) {
        return res
          .status(400)
          .json({ message: "Latitude and longitude required" });
      }

      const drivers = await DeliveryDriver.findNearby(
        parseFloat(latitude),
        parseFloat(longitude),
        parseInt(radius),
        5
      );

      return res.json({
        count: drivers.length,
        drivers
      });
    } catch (error) {
      console.error("Get available drivers error:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new DeliveryDriverController();
