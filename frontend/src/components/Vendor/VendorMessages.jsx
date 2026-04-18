import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import { Send, Loader, X, ArrowLeft, MessageCircle, Search } from "lucide-react";

const VendorMessages = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const messagesEndRef = useRef(null);

  // ===== STATE =====
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // ===== LOAD CONVERSATIONS =====
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/vendor/messages/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConversations(res.data.data?.conversations || []);
      setError("");
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fetchConversations]);

  // ===== FETCH MESSAGES FOR CONVERSATION =====
  useEffect(() => {
    if (!selectedConvId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/vendor/messages/conversation/${selectedConvId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data.data?.messages || []);
        scrollToBottom();
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
      }
    };

    fetchMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedConvId, token]);

  // ===== AUTO-SCROLL =====
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ===== SEND MESSAGE =====
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConvId) return;

    try {
      setSending(true);
      const res = await axios.post(
        `${API_URL}/api/vendor/messages/send`,
        {
          conversation_id: selectedConvId,
          message_text: messageText,
          receiver_id: currentConversation?.other_user_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages([...messages, res.data.data?.message]);
      setMessageText("");
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // ===== MARK AS READ =====
  const handleSelectConversation = async (conv) => {
    setCurrentConversation(conv);
    setSelectedConvId(conv.conversation_id);
    setIsMobileView(false);

    // Mark conversation messages as read
    if (conv.unread_count > 0) {
      try {
        await axios.put(
          `${API_URL}/api/vendor/messages/${conv.conversation_id}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Update unread count
        setConversations(
          conversations.map((c) =>
            c.conversation_id === conv.conversation_id
              ? { ...c, unread_count: 0 }
              : c
          )
        );
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    }
  };

  // ===== FILTER CONVERSATIONS =====
  const filteredConversations = conversations.filter((conv) =>
    (conv.other_user_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ===== CONVERSATIONS LIST ===== */}
      <div
        className={`${
          isMobileView && selectedConvId ? "hidden" : "w-full md:w-80"
        } bg-white border-r border-gray-200 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-emerald-600 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Customer Messages
          </h2>
          <p className="text-sm text-emerald-100 mt-1">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.conversation_id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-3 border-b border-gray-100 cursor-pointer transition ${
                  selectedConvId === conv.conversation_id
                    ? "bg-emerald-50 border-l-4 border-l-emerald-600"
                    : "hover:bg-gray-50"
                } ${conv.unread_count > 0 ? "bg-blue-50" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {conv.other_user_name || "Unknown User"}
                    </h3>
                    <p className="text-xs text-gray-600 truncate">
                      {conv.last_message || "No messages yet"}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center ml-2 flex-shrink-0">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== MESSAGE VIEW ===== */}
      {selectedConvId && currentConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">
                {currentConversation.other_user_name || "Customer"}
              </h3>
              <p className="text-sm text-emerald-100">
                Chat with customer
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedConvId(null);
                setCurrentConversation(null);
                setMessages([]);
              }}
              className="md:hidden p-2 hover:bg-emerald-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.sender_id === user.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender_id === user.id
                        ? "bg-emerald-600 text-white rounded-br-none"
                        : "bg-gray-300 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.message_text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender_id === user.id
                          ? "text-emerald-100"
                          : "text-gray-600"
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
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200 bg-white flex gap-2"
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              {sending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Select a conversation to start messaging</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg flex items-center gap-2">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default VendorMessages;
