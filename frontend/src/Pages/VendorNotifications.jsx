import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { Bell, Check, Trash2, Loader, Package, AlertTriangle, TrendingUp } from "lucide-react";

const VendorNotifications = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ===== STATE =====
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, unread
  const [unreadCount, setUnreadCount] = useState(0);

  // ===== FETCH NOTIFICATIONS =====
  useEffect(() => {
    if (!token || user.role !== "vendor") {
      navigate("/login");
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_URL}/api/notifications?unreadOnly=${filter === "unread"}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unread_count || 0);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [token, user, filter, navigate]);

  // ===== MARK AS READ =====
  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error("Error marking notification:", err);
    }
  };

  // ===== MARK ALL AS READ =====
  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch(
        `${API_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  // ===== DELETE NOTIFICATION =====
  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(
        `${API_URL}/api/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      const deleted = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );

      if (deleted && !deleted.is_read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // ===== GET NOTIFICATION ICON =====
  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_order":
        return <Package size={24} className="text-blue-600" />;
      case "low_stock":
        return <AlertTriangle size={24} className="text-amber-600" />;
      case "order_status_change":
        return <TrendingUp size={24} className="text-emerald-600" />;
      default:
        return <Bell size={24} className="text-gray-600" />;
    }
  };

  // ===== GET NOTIFICATION COLOR =====
  const getNotificationColor = (type) => {
    switch (type) {
      case "new_order":
        return "bg-blue-50 border-blue-200";
      case "low_stock":
        return "bg-yellow-50 border-yellow-200";
      case "order_status_change":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  // ===== HANDLE NOTIFICATION CLICK =====
  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  const displayNotifications = filter === "unread"
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="bg-white rounded-t-lg p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell size={32} className="text-emerald-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Notifications
              </h1>
            </div>

            {unreadCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-4 py-2 text-lg font-bold bg-emerald-600 text-white rounded-full">
                  {unreadCount} Unread
                </span>

                {notifications.some((n) => !n.is_read) && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>
            )}
          </div>

          {/* FILTERS */}
          <div className="flex gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "all"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === "unread"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS LIST */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-4 mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {displayNotifications && displayNotifications.length > 0 ? (
          <div className="bg-white rounded-b-lg shadow divide-y">
            {displayNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 border-2 ${getNotificationColor(
                  notification.type
                )} cursor-pointer transition hover:shadow-md ${
                  !notification.is_read ? "border-l-4 border-emerald-600" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  {/* LEFT: ICON + CONTENT */}
                  <div className="flex items-start gap-4 flex-1">
                    {getNotificationIcon(notification.type)}

                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg ${
                          !notification.is_read
                            ? "text-gray-900 text-xl"
                            : "text-gray-700"
                        }`}
                      >
                        {notification.title}
                      </h3>

                      <p className="text-gray-600 mt-1 leading-relaxed">
                        {notification.message}
                      </p>

                      <p className="text-xs text-gray-500 mt-3">
                        {new Date(notification.created_at).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(notification.created_at).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>

                      {/* RELATED LINK */}
                      {notification.action_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(notification.action_url);
                          }}
                          className="mt-3 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                          View Details →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: STATUS & ACTIONS */}
                  <div className="flex items-center gap-3 ml-4">
                    {!notification.is_read && (
                      <div className="flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                          title="Mark as read"
                        >
                          <Check size={20} />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition flex-shrink-0"
                      title="Delete notification"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-b-lg p-12 text-center">
            <Bell size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600">
              {filter === "unread"
                ? "You are all caught up!"
                : "Check back later for updates about your orders and products."}
            </p>
          </div>
        )}

        {/* PAGINATION INFO */}
        {displayNotifications.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600 py-4 bg-white rounded">
            <p>
              Showing {displayNotifications.length} of {notifications.length}{" "}
              notifications
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorNotifications;
