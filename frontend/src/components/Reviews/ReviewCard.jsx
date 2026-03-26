// =====================================================
// ReviewCard.jsx
// =====================================================
// Reusable review card component
// Displays individual review with rating and actions
// =====================================================

import React from "react";
import { Star, ThumbsUp, Trash2, Edit2 } from "lucide-react";

const ReviewCard = ({
  review,
  type = "product", // 'product' or 'vendor'
  onMarkHelpful,
  onDelete,
  onEdit,
}) => {
  // Format date
  const reviewDate = new Date(review.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Determine if user owns this review
  const currentUserId = localStorage.getItem("userId");
  const isOwner = review.user_id === parseInt(currentUserId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-lg text-gray-800">
            {type === "product" ? review.title : review.customer_name}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
            <span>{review.reviewer_name || review.customer_name || "Anonymous"}</span>
            <span>•</span>
            <span>{reviewDate}</span>
            {(review.verified_purchase || review.verified_buyer) && (
              <>
                <span>•</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                  ✓ Verified
                </span>
              </>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(review.id)}
                className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                title="Edit review"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                title="Delete review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* RATINGS */}
      <div className="mb-4">
        {type === "product" ? (
          // Product review - single rating
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        ) : (
          // Vendor review - multiple ratings
          <div className="space-y-2">
            {/* OVERALL */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-20">
                Overall
              </span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* COMMUNICATION */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-20">
                Communication
              </span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.communication_rating
                        ? "fill-blue-400 text-blue-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* DELIVERY */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-20">
                Delivery
              </span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.delivery_rating
                        ? "fill-orange-400 text-orange-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* QUALITY */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-20">
                Quality
              </span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.quality_rating
                        ? "fill-green-400 text-green-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COMMENT */}
      <p className="text-gray-700 text-sm mb-4">{review.comment}</p>

      {/* IMAGES */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {review.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Review attachment"
              className="w-16 h-16 object-cover rounded-md border border-gray-200"
            />
          ))}
        </div>
      )}

      {/* FOOTER - HELPFUL BUTTON */}
      {type === "product" && onMarkHelpful && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => onMarkHelpful(review.id)}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition text-sm"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Helpful</span>
            {review.helpfulness_count > 0 && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {review.helpfulness_count}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
