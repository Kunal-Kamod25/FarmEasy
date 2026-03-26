// =====================================================
// ExchangeChat.jsx
// =====================================================
// Chat interface for negotiating exchange details
// Real-time messaging between two farmers
// =====================================================

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import { Send, Loader } from "lucide-react";

const ExchangeChat = ({ matchId, user_id, otherFarmer }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // ===== AUTO-SCROLL TO LATEST MESSAGE =====
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ===== FETCH CHAT HISTORY =====
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/api/exchange/messages/${matchId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchMessages();
      // Refresh messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [matchId]);

  // ===== SEND MESSAGE =====
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const token = localStorage.getItem("token");

      // ===== SEND TO SERVER =====
      await axios.post(
        `${API_URL}/api/exchange/messages`,
        { match_id: matchId, message: newMessage.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ===== ADD TO LOCAL STATE IMMEDIATELY =====
      // (so user sees it instantly, no lag waiting for server)
      const user = JSON.parse(localStorage.getItem("user"));
      setMessages([
        ...messages,
        {
          id: Date.now(),
          message: newMessage.trim(),
          sender_id: user_id,
          sender_name: user.full_name,
          created_at: new Date().toISOString(),
        },
      ]);

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-emerald-100">
      {/* Chat Header */}
      <div className="p-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-transparent">
        <p className="font-bold text-gray-900">💬 Negotiate with {otherFarmer}</p>
        <p className="text-xs text-gray-500">
          Discuss exchange date, quantity, location
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-center text-sm">
              No messages yet. Start the conversation! 👋
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user_id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-lg ${
                  msg.sender_id === user_id
                    ? "bg-emerald-600 text-white rounded-br-none" // Your message - right side
                    : "bg-white border border-emerald-200 text-gray-900 rounded-bl-none" // Other farmer - left side
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender_id === user_id ? "text-emerald-100" : "text-gray-500"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-emerald-100">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Suggest a date, location, or ask questions..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1 px-4 py-2 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white p-2.5 rounded-xl transition-all flex items-center gap-2"
          >
            {sending ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExchangeChat;
