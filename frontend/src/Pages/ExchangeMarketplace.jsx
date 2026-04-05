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
    <div 
      className="min-h-screen p-6 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(5, 150, 105, 0.85), rgba(16, 185, 129, 0.85)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><defs><pattern id="farm" patternUnits="userSpaceOnUse" width="200" height="200"><path d="M50,150 Q100,50 150,150" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/><circle cx="70" cy="180" r="3" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="1200" height="600" fill="url(%23farm)"/></svg>')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
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
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">
                🌾 Crop Exchange Marketplace
              </h1>
              <p className="text-emerald-50 flex items-center gap-2 text-lg">
                <MapPin size={20} />
                Trade crops with nearby farmers • Direct farmer-to-farmer
              </p>
            </div>

            {/* CREATE NEW BUTTON */}
            <button
              onClick={() => navigate("/exchange/create")}
              className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-2xl transition-all active:scale-95 backdrop-blur-sm border border-white/30"
            >
              <Plus size={24} />
              Post Exchange
            </button>
          </div>
        </div>

        {/* FILTERS BAR - Glass Morphism */}
        <div className="backdrop-blur-xl bg-white/15 rounded-3xl shadow-2xl p-8 mb-8 border border-white/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Crop Filter */}
            <div>
              <label className="block text-sm font-bold text-emerald-100 mb-3 uppercase tracking-wider">
                🌽 Search Crop
              </label>
              <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 border border-white/30 rounded-xl px-4 py-3 focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-emerald-300 transition-all">
                <Search size={20} className="text-emerald-200" />
                <input
                  type="text"
                  placeholder="E.g., Rice, Wheat, Corn..."
                  value={cropFilter}
                  onChange={(e) => setCropFilter(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent text-white placeholder-emerald-100/50"
                />
              </div>
            </div>

            {/* Radius Filter */}
            <div>
              <label className="block text-sm font-bold text-emerald-100 mb-3 uppercase tracking-wider">
                📍 Search Radius: <span className="text-emerald-300">{radiusFilter}km</span>
              </label>
              <div className="backdrop-blur-md bg-white/10 border border-white/30 rounded-xl p-4">
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={radiusFilter}
                  onChange={(e) => setRadiusFilter(Number(e.target.value))}
                  className="w-full cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {/* Location Display */}
            <div>
              <label className="block text-sm font-bold text-emerald-100 mb-3 uppercase tracking-wider">
                📌 Your Location
              </label>
              {location ? (
                <div className="backdrop-blur-md bg-emerald-400/20 border border-emerald-300/50 p-4 rounded-xl">
                  <p className="text-sm text-emerald-100 font-semibold">
                    ✅ GPS Location Active
                  </p>
                  <p className="text-xs text-emerald-50 mt-2 font-mono">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                </div>
              ) : (
                <div className="backdrop-blur-md bg-amber-400/20 border border-amber-300/50 p-4 rounded-xl">
                  <p className="text-sm text-amber-100 font-semibold">⏳ Getting location...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LISTINGS GRID */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader className="w-16 h-16 animate-spin text-emerald-300 mx-auto mb-4" />
              <p className="text-emerald-100 font-semibold">Finding nearby exchanges...</p>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24 backdrop-blur-xl bg-white/15 rounded-3xl shadow-2xl border border-white/30 p-12">
            <div className="text-8xl mb-6">🌱</div>
            <h2 className="text-3xl font-bold text-white mb-3">
              No exchanges found nearby
            </h2>
            <p className="text-emerald-100 mb-8 text-lg">
              {cropFilter
                ? `No farmers are exchanging "${cropFilter}" right now.`
                : "Be the first to post an exchange offer!"}
            </p>
            <button
              onClick={() => navigate("/exchange/create")}
              className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-white font-bold py-3 px-8 rounded-xl inline-flex items-center gap-2 transition-all active:scale-95 shadow-lg backdrop-blur-sm border border-white/30"
            >
              <Plus size={20} />
              Create First Listing
            </button>
          </div>
        ) : (
          <div>
            <p className="text-emerald-100 mb-8 font-bold text-lg">
              ✨ Found <span className="text-emerald-300">{listings.length}</span> nearby exchange {listings.length === 1 ? "listing" : "listings"}
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
              className="text-emerald-300 font-bold hover:text-white transition-colors text-lg flex items-center justify-center gap-2 mx-auto"
            >
              📋 View My Exchange Listings 
              <span className="text-xl">→</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        .glass-card {
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
        }
        
        input[type="range"]::-webkit-slider-thumb {
          background: linear-gradient(135deg, #6ee7b7, #14b8a6);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }
        
        input[type="range"]::-moz-range-thumb {
          background: linear-gradient(135deg, #6ee7b7, #14b8a6);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </div>
  );
};

export default ExchangeMarketplace;
