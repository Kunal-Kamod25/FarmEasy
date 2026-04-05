import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { Send, Loader, X, ArrowLeft, Package, Search } from "lucide-react";

const VendorChat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
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

  // ===== FETCH CONVERSATIONS =====
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(res.data.data.conversations || []);

        // If has conversationId, set it as current
        if (conversationId) {
          const conv = res.data.data.conversations.find(
            (c) => c.conversation_id === conversationId
          );
          if (conv) {
            setCurrentConversation(conv);
          }
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token, conversationId, navigate]);

  // ===== FETCH MESSAGES FOR CURRENT CONVERSATION =====
  useEffect(() => {
    if (!currentConversation || !conversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/messages/conversation/${conversationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data.data.messages || []);
        scrollToBottom();
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
      }
    };

    fetchMessages();

    // Polling for new messages (refresh every 3 seconds)
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [currentConversation, conversationId, token]);

  // ===== AUTO-SCROLL TO BOTTOM =====
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

    if (!messageText.trim()) return;

    try {
      setSending(true);
      await axios.post(
        `${API_URL}/api/messages/send`,
        {
          receiver_id: currentConversation.other_user_id,
          message_text: messageText,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh messages
      const res = await axios.get(
        `${API_URL}/api/messages/conversation/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(res.data.data.messages || []);
      setMessageText("");
      scrollToBottom();
    } catch (err) {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // ===== HANDLE CONVERSATION CLICK =====
  const handleConversationClick = (conv) => {
    setCurrentConversation(conv);
    navigate(`/chat/${conv.conversation_id}`);
    scrollToBottom();
  };

  // ===== HANDLE START NEW CHAT =====
  const handleStartNewChat = async (vendorId, productId) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/messages/conversation/start`,
        { vendor_id: vendorId, product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/chat/${res.data.data.conversationId}`);

      // Refresh conversations
      const convRes = await axios.get(
        `${API_URL}/api/messages/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConversations(convRes.data.data.conversations || []);
    } catch (err) {
      setError("Failed to start conversation");
    }
  };

  // ===== FILTER CONVERSATIONS =====
  const filteredConversations = conversations.filter((conv) =>
    conv.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* LEFT SIDEBAR: CONVERSATIONS */}
      <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            💬 Messages
          </h1>

          {/* SEARCH */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* CONVERSATIONS LIST */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations && filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv.conversation_id}
                onClick={() => handleConversationClick(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition hover:bg-gray-50 ${
                  currentConversation?.conversation_id === conv.conversation_id
                    ? "bg-emerald-50 border-l-4 border-emerald-600"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {conv.other_user_pic ? (
                      <img
                        src={conv.other_user_pic}
                        alt={conv.other_user_name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {conv.other_user_name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {conv.other_user_name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.last_message || "Start a conversation..."}
                      </p>
                    </div>
                  </div>

                  {conv.unread_count > 0 && (
                    <div className="ml-2 flex-shrink-0">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none bg-emerald-600 text-white rounded-full">
                        {conv.unread_count}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-600">
              {searchTerm
                ? "No conversations found"
                : "No conversations yet. Start asking vendors about products!"}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CHAT */}
      {currentConversation ? (
        <div className="hidden md:flex flex-1 flex-col bg-white">
          {/* CHAT HEADER */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-emerald-50">
            <div className="flex items-center gap-3">
              {currentConversation.other_user_pic ? (
                <img
                  src={currentConversation.other_user_pic}
                  alt={currentConversation.other_user_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {currentConversation.other_user_name?.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h2 className="font-bold text-gray-900">
                  {currentConversation.other_user_name}
                </h2>
                <p className="text-sm text-gray-600">Online</p>
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentConversation(null);
                navigate("/chat");
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <X size={24} />
            </button>
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages && messages.length > 0 ? (
              messages.map((msg) => {
                const isOwn = msg.sender_id === user.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        isOwn
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="break-words">{msg.message_text}</p>

                      {msg.attachment_url && (
                        <div className="mt-2">
                          <img
                            src={msg.attachment_url}
                            alt="Attachment"
                            className="max-w-full rounded"
                          />
                        </div>
                      )}

                      <p
                        className={`text-xs mt-2 ${
                          isOwn ? "text-emerald-100" : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Start the conversation</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* MESSAGE INPUT */}
          <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200 bg-white">
            {error && (
              <p className="text-red-600 text-sm mb-2">{error}</p>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                disabled={sending}
              />

              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition"
              >
{sending ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50">
          <Package size={64} className="text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">Select a conversation to start chatting</p>
        </div>
      )}

      {/* MOBILE VIEW MESSAGE */}
      {currentConversation && (
        <div className="md:hidden absolute inset-0 bg-white z-50 flex flex-col">
          {/* BACK BUTTON */}
          <div className="p-4 bg-emerald-600">
            <button
              onClick={() => {
                setCurrentConversation(null);
              }}
              className="text-white flex items-center gap-2"
            >
              <ArrowLeft size={24} />
              <span className="font-bold">{currentConversation.other_user_name}</span>
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages && messages.length > 0 ? (
              messages.map((msg) => {
                const isOwn = msg.sender_id === user.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-lg ${
                        isOwn
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="break-words">{msg.message_text}</p>
                      <p
                        className={`text-xs mt-2 ${
                          isOwn ? "text-emerald-100" : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Start the conversation</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                disabled={sending}
              />

              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg"
              >
                {sending ? "..." : <Send size={18} />}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VendorChat;
