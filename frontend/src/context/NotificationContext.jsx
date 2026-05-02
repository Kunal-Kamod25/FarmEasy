/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useSocket } from "./SocketContext";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

// ─── helpers: persist read IDs in localStorage ───────────────────────────────
const STORAGE_KEY = "farmeasy_read_notification_ids";

const getReadIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
};

const saveReadIds = (set) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
};

// ─────────────────────────────────────────────────────────────────────────────

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { socket } = useSocket();

  // Fetch raw notifications from server, then apply local read state
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/notifications?role=${user?.role || "customer"}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const raw = res.data?.data?.notifications || [];
      const readIds = getReadIds();

      // Override server is_read with locally tracked read state
      const merged = raw.map((n) => ({
        ...n,
        is_read: readIds.has(n.id) ? true : n.is_read,
      }));

      setNotifications(merged);
      setUnreadCount(merged.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [token]);

  // Mark a single notification as read
  const markAsRead = useCallback((notificationId) => {
    const readIds = getReadIds();
    readIds.add(notificationId);
    saveReadIds(readIds);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark ALL notifications as read (call this when user opens the notifications page)
  const markAllAsRead = useCallback(() => {
    const readIds = getReadIds();
    notifications.forEach((n) => readIds.add(n.id));
    saveReadIds(readIds);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [notifications]);

  // Poll on mount and every 30 seconds
  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, fetchNotifications]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket || !user.id) return;

    socket.on("new message notification", () => {
      fetchNotifications();
    });

    return () => {
      socket.off("new message notification");
    };
  }, [socket, user.id, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
