import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

/**
 * ErrorNotification Component
 * Displays error messages as elegant toast-style notifications
 * Can be auto-dismissed or manually closed
 * 
 * Usage:
 * <ErrorNotification 
 *   message="Something went wrong" 
 *   onClose={() => setError("")}
 *   autoCloseTime={5000}
 * />
 */
const ErrorNotification = ({ message, onClose, autoCloseTime = null, className = "" }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoCloseTime || !isVisible) return;

    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseTime);

    return () => clearTimeout(timer);
  }, [autoCloseTime, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!message || !isVisible) return null;

  return (
    <div
      className={`flex items-start gap-3 bg-red-50 border-l-4 border-red-500 border border-red-100 rounded-lg p-4 mb-4 shadow-sm ${className}`}
      role="alert"
    >
      <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        <p className="text-red-800 text-sm font-medium leading-relaxed">{message}</p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={handleClose}
          className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
          aria-label="Close error notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default ErrorNotification;
