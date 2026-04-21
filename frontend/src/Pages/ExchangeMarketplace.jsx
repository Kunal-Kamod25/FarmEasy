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
    <div className="min-h-screen p-6 relative bg-[#04110d] bg-[radial-gradient(circle_at_top_left,_rgba(134,239,172,0.14),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(45,212,191,0.14),_transparent_28%),linear-gradient(145deg,_#03110c_0%,_#072117_45%,_#0b2d20_100%)]">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:68px_68px]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
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
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Crop Exchange Marketplace
              </h1>
              <p className="text-white/80 flex items-center gap-2 text-lg font-medium">
                <MapPin size={20} />
                Trade crops with nearby farmers • Direct farmer-to-farmer
              </p>
            </div>

            {/* CREATE NEW BUTTON */}
            <button
              onClick={() => navigate("/exchange/create")}
              className="bg-emerald-500 hover:bg-emerald-400 backdrop-blur-md text-white font-bold py-3 px-8 rounded-2xl flex items-center gap-2 shadow-lg transition-all active:scale-95 border border-emerald-300/40"
            >
              <Plus size={24} />
              Post Exchange
            </button>
          </div>
        </div>

        {/* FILTERS BAR - Subtle Glass Effect */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-xl p-8 mb-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Crop Filter */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">
                Search Crop
              </label>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/15 rounded-2xl px-4 py-3 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-emerald-300/35 transition-all">
                <Search size={20} className="text-white/60" />
                <input
                  type="text"
                  placeholder="E.g., Rice, Wheat, Corn..."
                  value={cropFilter}
                  onChange={(e) => setCropFilter(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent text-white placeholder-white/35 font-medium"
                />
              </div>
            </div>

            {/* Radius Filter */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">
                Search Radius: <span className="text-emerald-100">{radiusFilter}km</span>
              </label>
              <div className="bg-white/5 backdrop-blur-sm border border-white/15 rounded-2xl p-4">
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={radiusFilter}
                  onChange={(e) => setRadiusFilter(Number(e.target.value))}
                  className="w-full cursor-pointer accent-white"
                />
              </div>
            </div>

            {/* Location Display */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">
                Your Location
              </label>
              {location ? (
                <div className="bg-white/5 backdrop-blur-sm border border-white/15 p-4 rounded-2xl">
                  <p className="text-sm text-emerald-100 font-semibold">
                    GPS Location Active
                  </p>
                  <p className="text-xs text-white/70 mt-2 font-mono">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm border border-white/15 p-4 rounded-2xl">
                  <p className="text-sm text-white/75 font-semibold">Getting location...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LISTINGS GRID */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader className="w-16 h-16 animate-spin text-emerald-100 mx-auto mb-4" />
              <p className="text-white/80 font-semibold">Finding nearby exchanges...</p>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24 bg-white/5 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 p-12">
            <div className="text-8xl mb-6">🌾</div>
            <h2 className="text-3xl font-bold text-white mb-3">
              No exchanges found nearby
            </h2>
            <p className="text-white/70 mb-8 text-lg font-medium">
              {cropFilter
                ? `No farmers are exchanging "${cropFilter}" right now.`
                : "Be the first to post an exchange offer!"}
            </p>
            <button
              onClick={() => navigate("/exchange/create")}
              className="bg-emerald-500 hover:bg-emerald-400 backdrop-blur-md text-white font-bold py-3 px-8 rounded-2xl inline-flex items-center gap-2 transition-all active:scale-95 shadow-lg border border-emerald-300/40"
            >
              <Plus size={20} />
              Create First Listing
            </button>
          </div>
        ) : (
          <div>
            <p className="text-white/80 mb-8 font-bold text-lg">
              Found <span className="text-white">{listings.length}</span> nearby exchange {listings.length === 1 ? "listing" : "listings"}
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
              className="text-white/80 hover:text-white font-bold transition-colors text-lg flex items-center justify-center gap-2 mx-auto"
            >
              View My Exchange Listings 
              <span className="text-xl">→</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
        }
        
        input[type="range"]::-moz-range-thumb {
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ExchangeMarketplace;
