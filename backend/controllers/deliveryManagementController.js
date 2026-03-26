// =====================================================
// DELIVERY MANAGEMENT CONTROLLER
// =====================================================
// Handles delivery operations and lifecycle management
// - Delivery creation from orders
// - Driver assignment to deliveries
// - Status updates with state validation
// - Customer tracking and route information
// - Admin alerts for late/pending deliveries
// =====================================================

const OrderDelivery = require("../models/OrderDelivery");
const DeliveryNotification = require("../models/DeliveryNotification");
const db = require("../config/db");

class DeliveryManagementController {
  /**
   * POST /api/delivery/create/:orderId
   * Create delivery from order and optionally assign driver
   * Body: { pickup_address, delivery_address, delivery_latitude, delivery_longitude, driver_id? }
   */
  async createDelivery(req, res) {
    try {
      const orderId = req.params.orderId;
      const { driver_id, ...locationData } = req.body;

      // Create delivery record
      const delivery = await OrderDelivery.createFromOrder(orderId, locationData);

      // If driver_id provided, assign immediately
      if (driver_id) {
        try {
          const assigned = await OrderDelivery.assignDriver(delivery.id, driver_id);

          // Send notification to customer
          const [order] = await db.query("SELECT user_id FROM orders WHERE id = ?", [
            orderId
          ]);

          if (order.length > 0) {
            await DeliveryNotification.createStatusChangeNotification(
              delivery.id,
              order[0].user_id,
              "pending_assignment",
              "assigned"
            );
          }

          return res.status(201).json({
            message: "Delivery created and driver assigned",
            delivery: assigned
          });
        } catch (assignError) {
          console.warn("Driver assignment failed:", assignError.message);
          // Return delivery created, but not assigned
        }
      }

      return res.status(201).json({
        message: "Delivery created. Awaiting driver assignment",
        delivery
      });
    } catch (error) {
      console.error("Create delivery error:", error.message);
      return res
        .status(error.message.includes("already") ? 400 : 500)
        .json({ message: error.message });
    }
  }

  /**
   * PATCH /api/delivery/:deliveryId/assign
   * Assign driver to delivery
   * Body: { driver_id }
   */
  async assignDriver(req, res) {
    try {
      const deliveryId = req.params.deliveryId;
      const { driver_id } = req.body;

      if (!driver_id) {
        return res.status(400).json({ message: "Driver ID required" });
      }

      const delivery = await OrderDelivery.assignDriver(deliveryId, driver_id);

      // Get customer and send notification
      const [order] = await db.query(
        `SELECT o.user_id FROM orders o
        JOIN order_deliveries od ON o.id = od.order_id
        WHERE od.id = ?`,
        [deliveryId]
      );

      if (order.length > 0) {
        await DeliveryNotification.createStatusChangeNotification(
          deliveryId,
          order[0].user_id,
          "pending_assignment",
          "assigned"
        );
      }

      return res.json({
        message: "Driver assigned successfully",
        delivery
      });
    } catch (error) {
      console.error("Assign driver error:", error.message);
      return res
        .status(
          error.message.includes("Invalid") || error.message.includes("already")
            ? 400
            : 500
        )
        .json({ message: error.message });
    }
  }

  /**
   * PATCH /api/delivery/:deliveryId/status
   * Update delivery status (accepted/picked_up/on_the_way/delivered)
   * Body: { status, notes? }
   * Auth required: Driver
   */
  async updateDeliveryStatus(req, res) {
    try {
      const deliveryId = req.params.deliveryId;
      const driverId = req.params.driverId;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      // Update status
      const delivery = await OrderDelivery.updateStatus(
        deliveryId,
        status,
        driverId,
        notes
      );

      // Get customer and send notification
      const [order] = await db.query(
        `SELECT o.user_id FROM orders o
        JOIN order_deliveries od ON o.id = od.order_id
        WHERE od.id = ?`,
        [deliveryId]
      );

      if (order.length > 0) {
        // Only send notification for specific statuses
        if (["assigned", "accepted", "picked_up", "on_the_way", "delivered"].includes(status)) {
          await DeliveryNotification.createStatusChangeNotification(
            deliveryId,
            order[0].user_id,
            delivery.status,
            status
          );
        }
      }

      return res.json({
        message: "Delivery status updated",
        delivery
      });
    } catch (error) {
      console.error("Update delivery status error:", error.message);
      return res
        .status(error.message.includes("Invalid") ? 400 : 500)
        .json({ message: error.message });
    }
  }

  /**
   * GET /api/delivery/:deliveryId/status-history
   * Get timeline of all status changes with timestamps and driver info
   */
  async getStatusHistory(req, res) {
    try {
      const deliveryId = req.params.deliveryId;

      const history = await OrderDelivery.getStatusHistory(deliveryId);

      return res.json({
        delivery_id: deliveryId,
        history: history.map(h => ({
          status: h.new_status,
          changed_at: h.changed_at,
          driver_name: h.driver_name,
          notes: h.notes,
          location: h.latitude && h.longitude
            ? { lat: h.latitude, lng: h.longitude }
            : null
        }))
      });
    } catch (error) {
      console.error("Get status history error:", error.message);
      return res.status(404).json({ message: error.message });
    }
  }

  /**
   * GET /api/delivery/track/:orderId
   * Get delivery tracking information for customer
   * Shows driver info, current location, ETA, status, and route
   */
  async trackDelivery(req, res) {
    try {
      const orderId = req.params.orderId;
      const userId = req.user.id;

      // Get delivery details with customer verification
      const delivery = await OrderDelivery.getCustomerDelivery(orderId, userId);

      // Get GPS route
      const route = await OrderDelivery.getRoute(delivery.id);

      // Get status history
      const statusHistory = await OrderDelivery.getStatusHistory(delivery.id);

      // Get latest location
      const latestLocation = await OrderDelivery.getLatestLocation(delivery.id);

      return res.json({
        status: delivery.status,
        order_id: delivery.order_id,
        driver: delivery.driver_id
          ? {
              id: delivery.driver_id,
              name: delivery.driver_name,
              phone: delivery.driver_phone,
              vehicle: `${delivery.vehicle_color || ""} ${delivery.vehicle_type || ""}`,
              rating: delivery.driver_rating
            }
          : null,
        location: {
          pickup: {
            address: delivery.pickup_address,
            lat: delivery.pickup_latitude,
            lng: delivery.pickup_longitude
          },
          delivery: {
            address: delivery.delivery_address,
            lat: delivery.delivery_latitude,
            lng: delivery.delivery_longitude
          },
          current_driver: latestLocation
            ? {
                lat: latestLocation.latitude,
                lng: latestLocation.longitude,
                address: latestLocation.address,
                timestamp: latestLocation.timestamp
              }
            : null
        },
        eta: delivery.estimated_delivery_time,
        route: route.map(r => ({
          lat: r.latitude,
          lng: r.longitude,
          timestamp: r.timestamp
        })),
        status_history: statusHistory.map(h => ({
          status: h.new_status,
          timestamp: h.changed_at,
          notes: h.notes
        })),
        metrics: {
          estimated_distance_km: delivery.estimated_distance_km,
          actual_distance_km: delivery.actual_distance_km,
          estimated_time_minutes: delivery.estimated_time_minutes,
          actual_time_minutes: delivery.actual_time_minutes
        }
      });
    } catch (error) {
      console.error("Track delivery error:", error.message);
      return res.status(404).json({ message: error.message });
    }
  }

  /**
   * GET /api/delivery/pending-assignments
   * Get deliveries waiting for driver assignment (Admin use)
   */
  async getPendingAssignments(req, res) {
    try {
      const deliveries = await OrderDelivery.getPendingAssignments();

      return res.json({
        count: deliveries.length,
        deliveries
      });
    } catch (error) {
      console.error("Get pending assignments error:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * GET /api/delivery/delayed
   * Get deliveries running late (Admin alerts)
   */
  async getDelayedDeliveries(req, res) {
    try {
      const deliveries = await OrderDelivery.getDelayedDeliveries();

      return res.json({
        count: deliveries.length,
        deliveries: deliveries.map(d => ({
          delivery_id: d.id,
          customer_name: d.customer_name,
          minutes_delayed: d.minutes_delayed,
          status: d.status
        }))
      });
    } catch (error) {
      console.error("Get delayed deliveries error:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new DeliveryManagementController();
