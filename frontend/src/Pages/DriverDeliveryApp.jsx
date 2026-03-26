// =====================================================
// DRIVER DELIVERY APP PAGE
// =====================================================
// For delivery drivers to manage their deliveries
// - Accept/reject deliveries
// - Update GPS location
// - Change delivery status (picked up, on way, delivered)
// - View instructions and customer info
// - See current assignment and ETA
// =====================================================

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Loader
} from "lucide-react";

const DriverDeliveryApp = () => {
  const navigate = useNavigate();
  const [driverId, setDriverId] = useState(null);
  const [driverStatus, setDriverStatus] = useState("offline");
  const [assignments, setAssignments] = useState([]);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [updating, setUpdating] = useState(false);
  const locationWatchRef = useRef(null);
  const gpsIntervalRef = useRef(null);

  // Initialize driver
  useEffect(() => {
    const driverId = localStorage.getItem("driverId");
    if (!driverId) {
      navigate("/driver-login");
      return;
    }
    setDriverId(driverId);
    fetchAssignments(driverId);
    setLoading(false);
  }, [navigate]);

  // Fetch driver assignments
  const fetchAssignments = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/delivery/driver/${id}/assignments`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAssignments(response.data.deliveries);
    } catch (err) {
      console.error("Fetch assignments error:", err);
    }
  };

  // Start GPS tracking
  const startGPS = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported on this device");
      return;
    }

    setUpdating(true);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLastLocation({ latitude, longitude });

        // Send to backend
        await updateLocationToBackend(latitude, longitude);

        // Watch for continuous updates every 10 seconds
        locationWatchRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setLastLocation({ latitude: lat, longitude: lng });
            updateLocationToBackend(lat, lng);
          },
          (err) => {
            console.error("GPS error:", err);
            setError("GPS tracking error: " + err.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );

        setGpsEnabled(true);
        setUpdating(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Unable to access GPS. Please enable location services.");
        setUpdating(false);
      }
    );
  };

  // Stop GPS tracking
  const stopGPS = () => {
    if (locationWatchRef.current) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
    }
    setGpsEnabled(false);
    setLastLocation(null);
  };

  // Update location on backend
  const updateLocationToBackend = async (latitude, longitude) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/delivery/location/update/${driverId}`,
        { latitude, longitude },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (err) {
      console.error("Location update error:", err);
    }
  };

  // Update driver status
  const updateDriverStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("authToken");

      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/delivery/driver/${driverId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setDriverStatus(newStatus);
      if (newStatus === "offline") {
        stopGPS();
      }
    } catch (err) {
      setError("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // Accept delivery
  const acceptDelivery = async (deliveryId) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("authToken");

      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/delivery/${deliveryId}/status/${driverId}`,
        { status: "accepted" },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setCurrentDelivery(assignments.find(a => a.id === deliveryId));
      fetchAssignments(driverId);
    } catch (err) {
      setError("Failed to accept delivery");
    } finally {
      setUpdating(false);
    }
  };

  // Update delivery status
  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("authToken");

      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/delivery/${deliveryId}/status/${driverId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update current delivery
      if (currentDelivery?.id === deliveryId) {
        setCurrentDelivery(prev => ({ ...prev, status: newStatus }));
      }

      fetchAssignments(driverId);
    } catch (err) {
      setError("Failed to update delivery status");
    } finally {
      setUpdating(false);
    }
  };

  // Logout
  const handleLogout = () => {
    stopGPS();
    updateDriverStatus("offline");
    localStorage.removeItem("driverId");
    localStorage.removeItem("authToken");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader className="mx-auto animate-spin text-blue-600 mb-3" size={32} />
          <p className="text-gray-600">Loading delivery app...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "on_delivery":
        return "bg-blue-100 text-blue-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Driver Dashboard</h1>
            <p className="text-gray-600">ID: {driverId}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* ===== ERROR ALERT ===== */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-6 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== STATUS CARD ===== */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">Status Management</h2>

          <div className="space-y-4">
            {/* Current Status */}
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(driverStatus)}`}>
                {driverStatus.toUpperCase()}
              </span>
            </div>

            {/* GPS Status */}
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-semibold">GPS Tracking:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                gpsEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>
                {gpsEnabled ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            {/* Location Info */}
            {lastLocation && (
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                📍 {lastLocation.latitude.toFixed(6)}, {lastLocation.longitude.toFixed(6)}
              </div>
            )}

            {/* Status Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button
                onClick={() => {
                  updateDriverStatus("available");
                  if (!gpsEnabled) startGPS();
                }}
                disabled={updating}
                className={`py-2 rounded font-semibold transition ${
                  driverStatus === "available"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-800 hover:bg-green-200"
                } disabled:opacity-50`}
              >
                {updating? <Loader size={18} className="mx-auto animate-spin" /> : "Go Online"}
              </button>

              <button
                onClick={() => updateDriverStatus("on_delivery")}
                disabled={updating}
                className={`py-2 rounded font-semibold transition ${
                  driverStatus === "on_delivery"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                } disabled:opacity-50`}
              >
                {updating ? <Loader size={18} className="mx-auto animate-spin" /> : "On Delivery"}
              </button>

              <button
                onClick={() => updateDriverStatus("offline")}
                disabled={updating}
                className={`py-2 rounded font-semibold transition ${
                  driverStatus === "offline"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                } disabled:opacity-50`}
              >
                {updating ? <Loader size={18} className="mx-auto animate-spin" /> : "Go Offline"}
              </button>
            </div>

            {/* GPS Controls */}
            {driverStatus !== "offline" && (
              <div className="border-t pt-4">
                <button
                  onClick={() => {
                    if (gpsEnabled) stopGPS();
                    else startGPS();
                  }}
                  disabled={updating}
                  className={`w-full py-2 px-4 rounded font-semibold transition ${
                    gpsEnabled
                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  } disabled:opacity-50`}
                >
                  {gpsEnabled ? "Stop GPS Tracking" : "Start GPS Tracking"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===== CURRENT DELIVERY ===== */}
        {currentDelivery && (
          <div className="bg-white rounded-lg shadow p-6 mb-6 border-l-4 border-blue-600">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">
              🚗 Current Delivery
            </h2>

            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-blue-600 font-semibold mb-2">Customer</p>
                <p className="font-semibold text-gray-800">{currentDelivery.customer_name}</p>
                <a
                  href={`tel:${currentDelivery.customer_phone}`}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 mt-2"
                >
                  <Phone size={16} />
                  {currentDelivery.customer_phone}
                </a>
              </div>

              {/* Pickup & Delivery Addresses */}
              <div>
                <p className="text-sm text-green-600 font-semibold mb-1">Pickup Address ✓</p>
                <p className="text-gray-700">{currentDelivery.pickup_address}</p>
              </div>

              <div>
                <p className="text-sm text-emerald-600 font-semibold mb-1">Delivery Address</p>
                <p className="text-gray-700">{currentDelivery.delivery_address}</p>
              </div>

              {/* Special Instructions */}
              {currentDelivery.special_instructions && (
                <div className="bg-yellow-50 p-3 rounded border-l-2 border-yellow-400">
                  <p className="text-sm text-yellow-800 font-semibold mb-1">⚠️ Special Instructions</p>
                  <p className="text-yellow-900">{currentDelivery.special_instructions}</p>
                </div>
              )}

              {/* Status Actions */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-3 font-semibold">Current Status: {currentDelivery.status}</p>

                <div className="grid grid-cols-2 gap-2">
                  {currentDelivery.status === "assigned" && (
                    <button
                      onClick={() => acceptDelivery(currentDelivery.id)}
                      disabled={updating}
                      className="col-span-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                    >
                      {updating ? <Loader size={18} className="mx-auto animate-spin" /> : "Accept Delivery"}
                    </button>
                  )}

                  {["accepted", "picked_up", "on_the_way"].includes(currentDelivery.status) && (
                    <>
                      {currentDelivery.status === "accepted" && (
                        <button
                          onClick={() => updateDeliveryStatus(currentDelivery.id, "picked_up")}
                          disabled={updating}
                          className="py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-semibold disabled:opacity-50"
                        >
                          {updating ? <Loader size={16} className="animate-spin" /> : "Picked Up"}
                        </button>
                      )}

                      {(currentDelivery.status === "picked_up" || currentDelivery.status === "on_the_way") && (
                        <button
                          onClick={() => updateDeliveryStatus(currentDelivery.id, "on_the_way")}
                          disabled={updating || currentDelivery.status === "on_the_way"}
                          className="py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                        >
                          On the Way
                        </button>
                      )}

                      <button
                        onClick={() => updateDeliveryStatus(currentDelivery.id, "delivered")}
                        disabled={updating}
                        className="py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {updating ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={18} />}
                        Delivered
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== PENDING DELIVERIES ===== */}
        {assignments.length > 0 && !currentDelivery && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">
              📦 Available Deliveries ({assignments.length})
            </h2>

            <div className="space-y-3">
              {assignments.map((delivery) => (
                <div
                  key={delivery.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => acceptDelivery(delivery.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-800">
                      {delivery.customer_name}
                    </p>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      {delivery.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    📍 {delivery.delivery_address}
                  </p>
                  <p className="text-sm text-gray-500">
                    Distance: {delivery.estimated_distance_km} km | Time: {delivery.estimated_time_minutes} min
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {assignments.length === 0 && !currentDelivery && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 text-lg">No deliveries assigned yet</p>
            <p className="text-gray-500 text-sm mt-2">Come back later or go online to receive deliveries</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDeliveryApp;
