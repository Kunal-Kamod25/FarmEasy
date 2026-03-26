// =====================================================
// ORDER TRACKING PAGE
// =====================================================
// Display real-time delivery tracking for customers
// Shows driver info, current location, route, status timeline, ETA
// Updates via polling every 5 seconds
// =====================================================

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Phone, Clock, AlertCircle, CheckCircle } from "lucide-react";

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Get tracking data from API
  const fetchTracking = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/delivery/track/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setDelivery(response.data);
      setError(null);
    } catch (err) {
      console.error("Tracking fetch error:", err);
      setError(
        err.response?.data?.message || "Failed to load tracking information"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and set up polling
  useEffect(() => {
    fetchTracking();

    // Poll for updates every 5 seconds
    pollingIntervalRef.current = setInterval(fetchTracking, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [orderId]);

  // Calculate ETA from now
  const calculateTimeRemaining = () => {
    if (!delivery?.eta) return null;
    const eta = new Date(delivery.eta);
    const now = new Date();
    const diffMinutes = Math.ceil((eta - now) / (1000 * 60));
    return diffMinutes > 0 ? diffMinutes : 0;
  };

  // Get status icon and color
  const getStatusDisplay = (status) => {
    const statusMap = {
      pending_assignment: {
        label: "Finding Driver",
        color: "bg-gray-100",
        textColor: "text-gray-700",
        icon: "⏳"
      },
      assigned: {
        label: "Driver Assigned",
        color: "bg-blue-100",
        textColor: "text-blue-700",
        icon: "✓"
      },
      accepted: {
        label: "Driver Accepted",
        color: "bg-blue-100",
        textColor: "text-blue-700",
        icon: "✓"
      },
      picked_up: {
        label: "Order Picked Up",
        color: "bg-amber-100",
        textColor: "text-amber-700",
        icon: "📦"
      },
      on_the_way: {
        label: "On the Way",
        color: "bg-emerald-100",
        textColor: "text-emerald-700",
        icon: "🚗"
      },
      delivered: {
        label: "Delivered",
        color: "bg-green-100",
        textColor: "text-green-700",
        icon: "✓"
      },
      failed: {
        label: "Delivery Failed",
        color: "bg-red-100",
        textColor: "text-red-700",
        icon: "✗"
      }
    };
    return statusMap[status] || statusMap.pending_assignment;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-700 mb-2">Error</h3>
              <p className="text-gray-600 text-sm">{error}</p>
              <button
                onClick={() => navigate("/my-orders")}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition text-sm"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
        <p className="text-gray-600">No delivery information available</p>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(delivery.status);
  const timeRemaining = calculateTimeRemaining();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* ===== HEADER ===== */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Order #{delivery.order_id}</p>
        </div>

        {/* ===== STATUS CARD ===== */}
        <div className={`${statusInfo.color} rounded-lg p-6 mb-6 border-l-4 border-emerald-600`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Status</p>
              <p className={`text-2xl font-bold ${statusInfo.textColor}`}>
                {statusInfo.icon} {statusInfo.label}
              </p>
            </div>
            {timeRemaining !== null && delivery.status !== "delivered" && (
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Estimated Time</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {timeRemaining} min
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===== DRIVER CARD ===== */}
        {delivery.driver && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">
              🚗 Driver Information
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Driver Name</span>
                <span className="font-semibold text-gray-800">{delivery.driver.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Vehicle</span>
                <span className="font-semibold text-gray-800">
                  {delivery.driver.vehicle}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rating</span>
                <span className="font-semibold text-amber-600">
                  ★ {delivery.driver.rating ? delivery.driver.rating.toFixed(1) : "N/A"}
                </span>
              </div>

              <div className="border-t pt-3">
                <a
                  href={`tel:${delivery.driver.phone}`}
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition"
                >
                  <Phone size={18} />
                  Call Driver: {delivery.driver.phone}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ===== LOCATION CARD ===== */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">
            📍 Location Information
          </h2>

          {/* Pickup */}
          <div className="mb-4 pb-4 border-b">
            <p className="text-sm text-green-600 font-semibold mb-1">Pickup Location ✓</p>
            <p className="text-gray-700">{delivery.location.pickup.address}</p>
          </div>

          {/* Current Location */}
          {delivery.location.current_driver && (
            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-blue-600 font-semibold mb-1">
                🚗 Driver Current Location
              </p>
              <p className="text-gray-700">{delivery.location.current_driver.address}</p>
              <p className="text-xs text-gray-500 mt-1">
                Updated: {new Date(delivery.location.current_driver.timestamp).toLocaleTimeString()}
              </p>

              <button
                onClick={() => setMapVisible(!mapVisible)}
                className="mt-2 text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition"
              >
                {mapVisible ? "Hide Map" : "Show Route on Map"}
              </button>
            </div>
          )}

          {/* Delivery Destination */}
          <div>
            <p className="text-sm text-emerald-600 font-semibold mb-1">
              Delivery Destination
            </p>
            <p className="text-gray-700">{delivery.location.delivery.address}</p>
          </div>
        </div>

        {/* ===== DELIVERY METRICS ===== */}
        {delivery.metrics && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">📊 Delivery Metrics</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Estimated Distance</p>
                <p className="font-semibold text-lg text-gray-800">
                  {delivery.metrics.estimated_distance_km} km
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Estimated Time</p>
                <p className="font-semibold text-lg text-gray-800">
                  {delivery.metrics.estimated_time_minutes} min
                </p>
              </div>

              {delivery.metrics.actual_distance_km && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Actual Distance</p>
                  <p className="font-semibold text-lg text-gray-800">
                    {delivery.metrics.actual_distance_km} km
                  </p>
                </div>
              )}

              {delivery.metrics.actual_time_minutes && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600 mb-1">Actual Time</p>
                  <p className="font-semibold text-lg text-gray-800">
                    {delivery.metrics.actual_time_minutes} min
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== STATUS TIMELINE ===== */}
        {delivery.status_history && delivery.status_history.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">📅 Status Timeline</h2>

            <div className="space-y-4">
              {delivery.status_history.map((status, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                    {idx < delivery.status_history.length - 1 && (
                      <div className="w-0.5 h-8 bg-emerald-200 my-1"></div>
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="font-semibold text-gray-800 capitalize">{status.status}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(status.timestamp).toLocaleString("en-IN")}
                    </p>
                    {status.notes && (
                      <p className="text-sm text-gray-500 mt-1 italic">{status.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ACTION BUTTONS ===== */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/my-orders")}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Back to Orders
          </button>

          {delivery.status === "delivered" && (
            <button
              onClick={() => navigate(`/order-success/${delivery.order_id}`)}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Rate Delivery
            </button>
          )}
        </div>

        {/* ===== MAP PLACEHOLDER ===== */}
        {mapVisible && delivery.location.current_driver && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">🗺️ Route Map</h2>
            <div className="bg-gray-100 rounded h-[300px] flex items-center justify-center text-gray-500">
              {/* TODO: Integrate with Google Maps or similar */}
              <div className="text-center">
                <p className="font-semibold mb-2">delivery.location.current_driver</p>
                <p className="text-sm">Driver Current: {delivery.location.current_driver.lat.toFixed(4)}, {delivery.location.current_driver.lng.toFixed(4)}</p>
                <p className="text-sm mt-2">Destination: {delivery.location.delivery.lat.toFixed(4)}, {delivery.location.delivery.lng.toFixed(4)}</p>
                <p className="text-xs text-gray-400 mt-4">Map integration coming soon</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
