/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useSocket } from "./SocketContext";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { socket } = useSocket();

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/notifications?unreadOnly=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(res.data.data.unread_count || 0);
      setNotifications(res.data.data.notifications || []);
    } catch (err) {
      console.error("Error fetching notification count:", err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [token, fetchUnreadCount]);

  // Listen for socket events to update count in real-time
  useEffect(() => {
    if (!socket || !user.id) return;

    socket.on("new message notification", () => {
      fetchUnreadCount();
    });

    return () => {
      socket.off("new message notification");
    };
  }, [socket, user.id, fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, refreshNotifications: fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
