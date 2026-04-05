// =====================================================
// ExchangeDetail.jsx
// =====================================================
// View full details of an exchange listing
// Propose a match, accept/reject proposals, chat with farmers
// Glass morphism UI with farm-themed background
// =====================================================

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { Loader, Send, Check, X, MessageCircle, User } from "lucide-react";
import ExchangeChat from "../components/Exchange/ExchangeChat";
import ErrorNotification from "../components/Common/ErrorNotification";

const ExchangeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ===== STATE =====
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [proposalReason, setProposalReason] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [processingMatch, setProcessingMatch] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const user_id = user.id;

  // ===== FETCH LISTING DETAILS =====
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const result = await axios.get(`${API_URL}/api/exchange/${id}`);
        setListing(result.data);

        // Fetch proposals if this is the listing owner
        if (result.data.user_id === user_id) {
          const matchResult = await axios.get(
            `${API_URL}/api/exchange/matches/received`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Filter for this listing only
          const listingMatches = matchResult.data.filter(
            (m) => m.exchange_listing_id === parseInt(id)
          );
          setMatches(listingMatches);
        }
      } catch (_err) {
        console.error("Error fetching details:", _err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDetails();
    }
  }, [id, token, user_id]);

  // ===== PROPOSE EXCHANGE =====
  const handleProposals = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (listing.user_id === user_id) {
      alert("You can't propose to your own listing");
      return;
    }

    try {
      setSubmittingProposal(true);

      await axios.post(
        `${API_URL}/api/exchange/propose`,
        {
          exchange_listing_id: listing.id,
          match_reason: proposalReason || "I'm interested in this exchange",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Proposal sent! The farmer will review it soon.");
      setProposalReason("");
    } catch (_err) {
      console.error("Proposal error:", _err);
      alert("Error: " + (_err.response?.data?.error || _err.message));
    } finally {
      setSubmittingProposal(false);
    }
  };

  // ===== ACCEPT A PROPOSAL =====
  const handleAcceptProposal = async (match_id) => {
    try {
      setProcessingMatch(true);
      setError("");

      await axios.patch(
        `${API_URL}/api/exchange/match/${match_id}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setMatches(
        matches.map((m) =>
          m.id === match_id ? { ...m, status: "accepted" } : m
        )
      );
      setSelectedMatch({ ...selectedMatch, status: "accepted" });
    } catch (_err) {
      console.error("Accept error:", _err);
      setError(_err.response?.data?.error || "Error accepting proposal");
    } finally {
      setProcessingMatch(false);
    }
  };

  // ===== REJECT A PROPOSAL =====
  const handleRejectProposal = async (match_id) => {
    if (!confirm("Are you sure you want to reject this proposal?")) return;

    try {
      setProcessingMatch(true);
      setError("");

      await axios.patch(
        `${API_URL}/api/exchange/match/${match_id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setMatches(matches.filter((m) => m.id !== match_id));
    } catch (_err) {
      console.error("Reject error:", _err);
      setError(_err.response?.data?.error || "Error rejecting proposal");
    } finally {
      setProcessingMatch(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .floating { animation: float 3s ease-in-out infinite; }
        `}</style>
        <div className="floating">
          <Loader className="w-16 h-16 animate-spin text-emerald-300" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 p-6">
        <h2 className="text-3xl font-bold text-white mb-4">Listing not found</h2>
        <button
          onClick={() => navigate("/exchange")}
          className="bg-emerald-400 hover:bg-emerald-300 text-emerald-900 font-bold py-3 px-8 rounded-xl transition-all active:scale-95"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const isOwner = listing.user_id === user_id;

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 p-6 relative"
    >
      {/* Subtle background pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* ERROR NOTIFICATION */}
        {error && (
          <ErrorNotification 
            message={error} 
            onClose={() => setError("")}
            className="mb-6 backdrop-blur-md"
          />
        )}

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/exchange")}
          className="mb-6 text-white/90 hover:text-white font-bold transition-colors flex items-center gap-2"
        >
          ← Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: LISTING DETAILS */}
          <div className="lg:col-span-2">
            {/* FARMER CARD - Glass Morphism */}
            <div className="bg-white/15 backdrop-blur-md rounded-3xl shadow-xl p-8 mb-6 border border-white/25 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-white/40 to-white/20 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white/40">
                  <User size={40} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white">
                    {listing.full_name}
                  </h2>
                  <p className="text-white/80 text-lg">{listing.city}, {listing.state}</p>
                  <p className="text-white/90 mt-2 font-medium">
                    📞 {listing.phone_number}
                  </p>
                </div>
                {isOwner && (
                  <div className="bg-white/25 text-white px-4 py-2 rounded-full text-sm font-bold border border-white/40">
                    ⭐ Your Listing
                  </div>
                )}
              </div>
            </div>

            {/* EXCHANGE DETAILS - Glass Card */}
            <div className="backdrop-blur-xl bg-white/15 rounded-3xl shadow-2xl p-8 mb-6 border border-white/30">
              <h3 className="text-2xl font-bold text-white mb-8">🌾 Exchange Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OFFERING */}
                <div>
                  <p className="text-xs font-bold text-white mb-3 uppercase tracking-wider">
                    ✅ You Offer
                  </p>
                  <div className="bg-white/15 backdrop-blur-md p-6 rounded-2xl border border-white/25 hover:bg-white/20 transition-all">
                    <p className="text-4xl font-bold text-white">
                      {listing.offering_crop}
                    </p>
                    <p className="text-xl text-white/90 mt-3 font-semibold">
                      {listing.offering_quantity} {listing.offering_unit}
                    </p>
                    <p className="text-sm text-white/80 mt-4 leading-relaxed">
                      {listing.description || "Premium quality produce"}
                    </p>
                  </div>
                </div>

                {/* SEEKING */}
                <div>
                  <p className="text-xs font-bold text-white mb-3 uppercase tracking-wider">
                    👀 You Seek
                  </p>
                  <div className="bg-white/15 backdrop-blur-md p-6 rounded-2xl border border-white/25 hover:bg-white/20 transition-all">
                    <p className="text-4xl font-bold text-white">
                      {listing.seeking_crop}
                    </p>
                    <p className="text-xl text-white/90 mt-3 font-semibold">
                      {listing.seeking_quantity || "Any quantity"}{" "}
                      {listing.seeking_unit}
                    </p>
                    <p className="text-sm text-white/80 mt-4">
                      Search radius: {listing.radius_km}km 📍
                    </p>
                  </div>
                </div>
              </div>

              {/* IMAGES GALLERY */}
              {listing.exchange_images && listing.exchange_images.length > 0 && (
                <div className="mt-8">
                  <p className="text-sm font-bold text-white mb-4 uppercase tracking-wider">📸 Farm Images</p>
                  <div className="grid grid-cols-3 gap-4">
                    {listing.exchange_images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <img
                          src={img}
                          alt="crop"
                          className="w-full h-32 object-cover rounded-xl border-2 border-white/30 backdrop-blur-sm group-hover:border-white/50 transition-all shadow-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: ACTIONS & PROPOSALS */}
          <div className="lg:col-span-1">
            {isOwner ? (
              <div className="bg-white/15 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/25 sticky top-6 max-h-[600px] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-6">💌 Proposals</h3>

                {matches.length === 0 ? (
                  <p className="text-white/70 text-center py-8">No proposals yet</p>
                ) : (
                  <div className="space-y-3">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className={`backdrop-blur-sm p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedMatch?.id === match.id
                            ? "bg-white/25 border-white/50 shadow-lg"
                            : "bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30"
                        }`}
                        onClick={() => setSelectedMatch(match)}
                      >
                        <p className="font-bold text-white text-sm">
                          {match.proposer_name}
                        </p>
                        <p className="text-xs text-white/70 mt-1">
                          {match.proposer_city}, {match.state}
                        </p>

                        {match.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptProposal(match.id);
                              }}
                              disabled={processingMatch}
                              className="flex-1 bg-white/30 hover:bg-white/40 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 transition-all active:scale-95 backdrop-blur-sm"
                            >
                              <Check size={14} />
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectProposal(match.id);
                              }}
                              disabled={processingMatch}
                              className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50 transition-all active:scale-95 backdrop-blur-sm"
                            >
                              <X size={14} />
                              Reject
                            </button>
                          </div>
                        )}

                        {match.status === "accepted" && (
                          <div className="mt-3 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg inline-block border border-white/40 backdrop-blur-sm">
                            ✅ Accepted - Chat to finalize
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/15 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/25 sticky top-6">
                <h3 className="text-xl font-bold text-white mb-6">💬 Propose Exchange</h3>

                <textarea
                  placeholder="Why are you interested? Any special requirements?"
                  value={proposalReason}
                  onChange={(e) => setProposalReason(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 backdrop-blur-sm bg-white/20 border border-white/25 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/25 mb-4 transition-all"
                ></textarea>

                <button
                  onClick={handleProposals}
                  disabled={submittingProposal}
                  className="w-full bg-white/30 hover:bg-white/40 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg backdrop-blur-sm border border-white/25"
                >
                  {submittingProposal ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Proposal
                    </>
                  )}
                </button>

                <p className="text-xs text-white/70 mt-4 text-center">
                  ⏰ Farmer will review within 24 hours
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CHAT SECTION (if match is selected) */}
        {selectedMatch && selectedMatch.status === "accepted" && (
          <div className="mt-10">
            <ExchangeChat
              matchId={selectedMatch.id}
              user_id={user_id}
              otherFarmer={selectedMatch.proposer_name || "Farmer"}
            />
          </div>
        )}
      </div>

      <style>{`
        @supports not (backdrop-filter: blur(10px)) {
          .bg-white/15 {
            background-color: rgba(255, 255, 255, 0.1);
          }
        }
        
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ExchangeDetail;
