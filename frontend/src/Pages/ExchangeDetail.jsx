// =====================================================
// ExchangeDetail.jsx
// =====================================================
// View full details of an exchange listing
// Propose a match, accept/reject proposals, chat with farmers
// =====================================================

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { Loader, Send, Check, X, MessageCircle, User } from "lucide-react";
import ExchangeChat from "../components/Exchange/ExchangeChat";

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

      await axios.patch(
        `${API_URL}/api/exchange/match/${match_id}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Proposal accepted! Start chatting to finalize details.");

      // Update local state
      setMatches(
        matches.map((m) =>
          m.id === match_id ? { ...m, status: "accepted" } : m
        )
      );
      setSelectedMatch({ ...selectedMatch, status: "accepted" });
      // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      alert("Error accepting proposal");
    } finally {
      setProcessingMatch(false);
    }
  };

  // ===== REJECT A PROPOSAL =====
  const handleRejectProposal = async (match_id) => {
    if (!confirm("Are you sure you want to reject this proposal?")) return;

    try {
      setProcessingMatch(true);

      await axios.patch(
        `${API_URL}/api/exchange/match/${match_id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Proposal rejected");

      // Update local state
      setMatches(matches.filter((m) => m.id !== match_id));
      // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      alert("Error rejecting proposal");
    } finally {
      setProcessingMatch(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
        <Loader className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h2>
        <button
          onClick={() => navigate("/exchange")}
          className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const isOwner = listing.user_id === user_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/exchange")}
          className="mb-6 text-emerald-600 hover:underline font-semibold"
        >
          ← Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: LISTING DETAILS */}
          <div className="lg:col-span-2">
            {/* FARMER CARD */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-emerald-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={32} className="text-emerald-700" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {listing.full_name}
                  </h2>
                  <p className="text-gray-600">{listing.city}, {listing.state}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    📞 {listing.phone_number}
                  </p>
                </div>
                {isOwner && (
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                    Your Listing
                  </div>
                )}
              </div>
            </div>

            {/* EXCHANGE DETAILS */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-emerald-100">
              <h3 className="text-xl font-bold mb-6">Exchange Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OFFERING */}
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase">
                    ✅ Offering
                  </p>
                  <div className="bg-emerald-50 p-4 rounded-lg border-2 border-emerald-200">
                    <p className="text-3xl font-bold text-emerald-700">
                      {listing.offering_crop}
                    </p>
                    <p className="text-lg text-gray-600 mt-2">
                      {listing.offering_quantity} {listing.offering_unit}
                    </p>
                    <p className="text-xs text-gray-500 mt-3">
                      Quality: {listing.description || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* SEEKING */}
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase">
                    👀 Seeking
                  </p>
                  <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
                    <p className="text-3xl font-bold text-indigo-700">
                      {listing.seeking_crop}
                    </p>
                    <p className="text-lg text-gray-600 mt-2">
                      {listing.seeking_quantity || "Any quantity"}{" "}
                      {listing.seeking_unit}
                    </p>
                    <p className="text-xs text-gray-500 mt-3">
                      {listing.radius_km}km search radius
                    </p>
                  </div>
                </div>
              </div>

              {/* IMAGES */}
              {listing.exchange_images && listing.exchange_images.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-bold mb-3">Images</p>
                  <div className="grid grid-cols-3 gap-3">
                    {listing.exchange_images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="crop"
                        className="w-full h-24 object-cover rounded-lg border border-emerald-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: ACTIONS & PROPOSALS */}
          <div className="lg:col-span-1">
            {isOwner ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100 sticky top-6">
                <h3 className="text-lg font-bold mb-4">Proposals Received</h3>

                {matches.length === 0 ? (
                  <p className="text-gray-500 text-sm">No proposals yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className={`p-4 rounded-lg border cursor-pointer transition ${
                          selectedMatch?.id === match.id
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-gray-200 hover:border-emerald-300"
                        }`}
                        onClick={() => setSelectedMatch(match)}
                      >
                        <p className="font-bold text-gray-900">
                          {match.proposer_name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
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
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1 disabled:bg-gray-300"
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
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1 disabled:bg-gray-300"
                            >
                              <X size={14} />
                              Reject
                            </button>
                          </div>
                        )}

                        {match.status === "accepted" && (
                          <div className="mt-2 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded inline-block">
                            ✅ Accepted - Chat to finalize
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
                <h3 className="text-lg font-bold mb-4">💬 Propose Exchange</h3>

                <textarea
                  placeholder="Why are you interested? Any special requirements?"
                  value={proposalReason}
                  onChange={(e) => setProposalReason(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 mb-3"
                ></textarea>

                <button
                  onClick={handleProposals}
                  disabled={submittingProposal}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
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

                <p className="text-xs text-gray-500 mt-3 text-center">
                  ⏰ Farmer will review and accept or reject within 24 hours
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CHAT SECTION (if match is selected) */}
        {selectedMatch && selectedMatch.status === "accepted" && (
          <div className="mt-8">
            <ExchangeChat
              matchId={selectedMatch.id}
              user_id={user_id}
              otherFarmer={selectedMatch.proposer_name || "Farmer"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExchangeDetail;
