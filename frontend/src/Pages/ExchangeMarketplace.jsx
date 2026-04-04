// =====================================================
// ExchangeMarketplace.jsx
// =====================================================
// Main page for browsing crop exchange listings
// Shows nearby farmers' crop exchange offers
// Filter by crop type, sort by distance
// =====================================================

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { Search, MapPin, Plus, Loader } from "lucide-react";
import ExchangeCard from "../components/Exchange/ExchangeCard";
import { useLanguage } from "../context/language/LanguageContext";
import ErrorNotification from "../components/Common/ErrorNotification";

const ExchangeMarketplace = () => {
  const navigate = useNavigate();
  const { t: _t } = useLanguage();

  // ===== STATE =====
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [cropFilter, setCropFilter] = useState("");
  const [radiusFilter, setRadiusFilter] = useState(50);
  const [locationError, setLocationError] = useState("");
  const token = localStorage.getItem("token");

  // ===== FETCH NEARBY LISTINGS =====
  const fetchListings = useCallback(async (lat, lon) => {
    try {
      setLoading(true);
      const params = {
        latitude: lat,
        longitude: lon,
        radius: radiusFilter,
      };

      if (cropFilter) {
        params.crop_type = cropFilter;
      }

      const res = await axios.get(`${API_URL}/api/exchange/browse`, {
        params,
      });

      setListings(res.data);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [cropFilter, radiusFilter]);

  // ===== GET USER LOCATION ON MOUNT =====
  useEffect(() => {
    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      setLocationError("Please enable location services");
      return;
    }

    // Get current GPS location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLocationError("");
        fetchListings(latitude, longitude);
      },
      (error) => {
        console.error("Location error:", error);
        setLocationError("Could not access your location. Please enable GPS.");
      }
    );
  }, [fetchListings]);

  // ===== REFETCH WHEN FILTERS CHANGE =====
  useEffect(() => {
    if (location && fetchListings) {
      fetchListings(location.latitude, location.longitude);
    }
  }, [radiusFilter, cropFilter, location, fetchListings]);

  // ===== REDIRECT TO LOGIN IF NOT AUTHENTICATED ======
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ERROR NOTIFICATION */}
        {locationError && (
          <ErrorNotification 
            message={locationError} 
            onClose={() => setLocationError("")}
            className="mb-6"
          />
        )}
        {/* ERROR NOTIFICATION */}
        {locationError && (
          <ErrorNotification 
            message={locationError} 
            onClose={() => setLocationError("")}
            className="mb-6"
          />
        )}
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🌾 Crop Exchange Marketplace
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <MapPin size={18} />
                Trade crops with nearby farmers • Direct farmer-to-farmer
              </p>
            </div>

            {/* CREATE NEW BUTTON */}
            <button
              onClick={() => navigate("/exchange/create")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <Plus size={22} />
              Post Exchange
            </button>
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-emerald-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Crop Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                🌽 Search Crop
              </label>
              <div className="flex items-center gap-2 border border-emerald-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-600">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="E.g., Rice, Wheat, Corn..."
                  value={cropFilter}
                  onChange={(e) => setCropFilter(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent"
                />
              </div>
            </div>

            {/* Radius Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📍 Search Radius: {radiusFilter}km
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={radiusFilter}
                onChange={(e) => setRadiusFilter(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Show listings within {radiusFilter}km radius
              </p>
            </div>

            {/* Location Display */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📌 Your Location
              </label>
              {location ? (
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-700">
                    ✅ GPS Location Active
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Lat: {location.latitude.toFixed(4)} | Lon:{" "}
                    {location.longitude.toFixed(4)}
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700">⏳ Getting location...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LISTINGS GRID */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader className="w-12 h-12 animate-spin text-emerald-600" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-md border border-emerald-100">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No exchanges found nearby
            </h2>
            <p className="text-gray-600 mb-6">
              {cropFilter
                ? `No farmers are exchanging "${cropFilter}" right now.`
                : "Be the first to post an exchange offer!"}
            </p>
            <button
              onClick={() => navigate("/exchange/create")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create First Listing
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-6 font-semibold">
              Found {listings.length} nearby exchange{" "}
              {listings.length === 1 ? "listing" : "listings"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ExchangeCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}

        {/* MY LISTINGS SHORTCUT */}
        {token && (
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate("/exchange/my-listings")}
              className="text-emerald-600 font-semibold hover:underline"
            >
              📋 View My Exchange Listings →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExchangeMarketplace;
