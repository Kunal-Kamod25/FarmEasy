// =====================================================
// ExchangeCard.jsx
// =====================================================
// Displays a single exchange listing in the marketplace
// Shows what farmer is offering, what they're seeking
// Distance, farmer details, action button
// =====================================================

import React from "react";
import { MapPin, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/language/LanguageContext";

const ExchangeCard = ({ listing }) => {
  const navigate = useNavigate();
  const { t: _t } = useLanguage();

  // ===== HANDLE PROPOSAL CLICK =====
  const handlePropose = () => {
    // Navigate to negotiation/chat page for this listing
    navigate(`/exchange/${listing.id}`, { state: { listing } });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-emerald-100 overflow-hidden hover:border-emerald-300">
      {/* Farmer Header */}
      <div className="flex items-center gap-3 p-5 border-b border-emerald-50 bg-gradient-to-r from-emerald-50 to-transparent">
        <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
          <User size={24} className="text-emerald-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">
            {listing.full_name}
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} />
            <span className="truncate">
              {listing.city}, {listing.state}
            </span>
          </div>
        </div>
        {/* Distance Badge */}
        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0">
          {listing.distance_km ? listing.distance_km.toFixed(1) : "N/A"} km
        </div>
      </div>

      {/* Exchange Details */}
      <div className="p-5 space-y-4">
        {/* Offering Section */}
        <div>
          <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wider">
            ✅ Offering
          </p>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <p className="text-lg font-bold text-emerald-700">
              {listing.offering_crop}
            </p>
            <p className="text-sm text-gray-600">
              {listing.offering_quantity} {listing.offering_unit}
            </p>
          </div>
        </div>

        {/* Arrow Icon */}
        <div className="flex justify-center">
          <div className="bg-gray-100 p-2 rounded-full">
            <ArrowRight size={20} className="text-gray-400 rotate-90" />
          </div>
        </div>

        {/* Seeking Section */}
        <div>
          <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wider">
            👀 Seeking
          </p>
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
            <p className="text-lg font-bold text-indigo-700">
              {listing.seeking_crop}
            </p>
            <p className="text-sm text-gray-600">
              {listing.seeking_quantity || "Any quantity"}{" "}
              {listing.seeking_unit}
            </p>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">
              Description
            </p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {listing.description}
            </p>
          </div>
        )}

        {/* Radius Info */}
        <div className="text-xs text-gray-500 flex justify-between">
          <span>📍 Search radius: {listing.radius_km}km</span>
          <span>{new Date(listing.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 border-t border-emerald-50 bg-emerald-50/50">
        <button
          onClick={handlePropose}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all active:scale-95 shadow-md"
        >
          💬 Propose Exchange
        </button>
      </div>
    </div>
  );
};

export default ExchangeCard;
