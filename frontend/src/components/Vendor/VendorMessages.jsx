import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import { 
  Send, Loader, X, ArrowLeft, MessageCircle, Search, 
  Sprout, Sparkles, User, UserCircle2, Clock, Check,
  Users, Store, Paperclip, FileText, Download, Trash2
} from "lucide-react";
import { useSocket } from "../../context/SocketContext";

const VendorMessages = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const messagesEndRef = useRef(null);

  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState("chats"); // "chats" or "vendors"
  const [allVendors, setAllVendors] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [deletingMessageId, setDeletingMessageId] = useState(null);

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

  const fetchAllVendors = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/vendor/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllVendors(res.data.data || []);
    } catch (err) {
      console.error("Error fetching vendor list:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
    fetchAllVendors();
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fetchConversations, fetchAllVendors]);

  // Socket setup
  useEffect(() => {
    if (!socket) return;

    socket.on("message received", (newMessage) => {
      if (newMessage.conversation_id === selectedConvId) {
        setMessages((prev) => {
          if (prev.find(m => m?.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        fetchConversations();
      } else {
        fetchConversations();
      }
    });

    return () => {
      socket.off("message received");
    };
  }, [socket, selectedConvId, fetchConversations]);

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
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
    // No more manual polling - socket handles real-time!
  }, [selectedConvId, token]);



  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConvId) return;

    try {
      setSending(true);
      let attachment_url = null;

      // Handle file upload if present
      if (selectedFile) {
        const formData = new FormData();
        formData.append("attachment", selectedFile);
        const uploadRes = await axios.post(`${API_URL}/api/messages/upload-attachment`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
        });
        attachment_url = uploadRes.data.data.url;
      }

      const res = await axios.post(
        `${API_URL}/api/messages/send`,
        {
          conversation_id: selectedConvId,
          message_text: messageText,
          receiver_id: currentConversation?.other_user_id,
          attachment_url
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...messages, res.data.data]);
      setMessageText("");
      setSelectedFile(null);
      setFilePreview(null);

      // Refresh conversations to update sidebar
      await fetchConversations();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const confirmed = window.confirm("Delete this message? This action cannot be undone.");
    if (!confirmed) return;

    try {
      setDeletingMessageId(messageId);

      await axios.delete(`${API_URL}/api/vendor/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages((prev) => prev.filter((message) => message.id !== messageId));
      await fetchConversations();
    } catch (err) {
      console.error("Error deleting message:", err);
      setError(err.response?.data?.message || "Failed to delete message");
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleSelectConversation = async (conv) => {
    setCurrentConversation(conv);
    setSelectedConvId(conv.conversation_id);
    
    if (conv.unread_count > 0) {
      try {
        await axios.put(
          `${API_URL}/api/vendor/messages/${conv.conversation_id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

  const filteredConversations = conversations.filter((conv) =>
    (conv.other_user_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fieldShell =
    "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-emerald-300/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-200/20";

  if (loading && conversations.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#04110d] font-Lora">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-10 w-10 animate-spin text-emerald-400" />
          <p className="text-white/60 animate-pulse">Establishing secure connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#04110d] font-Lora text-white overflow-hidden relative">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute inset-0 opacity-20 pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* ===== SIDEBAR: CONVERSATIONS ===== */}
      <div
        className={`${
          isMobileView && selectedConvId ? "hidden" : "w-full md:w-[380px]"
        } z-10 flex flex-col h-full border-r border-white/10 bg-white/5 backdrop-blur-2xl transition-all duration-300 shadow-2xl`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <MessageCircle size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Inbox</h2>
          </div>

          <div className="relative group mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-emerald-300 transition" />
            <input
              type="text"
              placeholder={activeTab === 'chats' ? "Search customers..." : "Search vendors..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${fieldShell} pl-11`}
            />
          </div>

          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'chats' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'}`}
            >
              <MessageCircle size={14} />
              Conversations
            </button>
            <button
              onClick={() => setActiveTab("vendors")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'vendors' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'}`}
            >
              <Users size={14} />
              All Vendors
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {activeTab === "chats" ? (
            filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-white/2 rounded-3xl mt-4 mx-2">
                <div className="p-4 rounded-full bg-white/5 mb-4">
                  <MessageCircle className="h-8 w-8 text-white/20" />
                </div>
                <p className="text-white/40 text-sm">No customers found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.conversation_id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 border border-transparent ${
                      selectedConvId === conv.conversation_id
                        ? "bg-emerald-500/10 border-emerald-500/20 shadow-lg"
                        : "hover:bg-white/5 hover:border-white/5"
                    }`}
                  >
                    {selectedConvId === conv.conversation_id && (
                      <div className="absolute left-0 top-4 bottom-4 w-1 bg-emerald-400 rounded-full" />
                    )}
                    
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-300 font-bold uppercase overflow-hidden">
                        {conv.other_user_pic ? (
                          <img src={conv.other_user_pic} alt="" className="h-full w-full object-cover" />
                        ) : (
                          conv.other_user_name?.charAt(0)
                        )}
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-[#04110d]" />
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className="font-semibold text-white/90 truncate">
                          {conv.other_user_name || "Unknown"}
                        </h3>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">
                          {conv.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 truncate leading-relaxed">
                        {conv.last_message || "Start conversation..."}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            /* ALL VENDORS TAB */
            <div className="space-y-1">
              {allVendors
                .filter(v => v.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) || (v.store_name || "").toLowerCase().includes(searchTerm.toLowerCase()))
                .map((v) => (
                  <button
                    key={v.id}
                    onClick={async () => {
                      if (v.id === user.id) return;
                      try {
                        const res = await axios.post(
                          `${API_URL}/api/messages/conversation/start`,
                          { vendor_id: v.id },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        if (res.data.success) {
                          const convId = res.data.data.conversationId;
                          setActiveTab("chats");
                          await fetchConversations();
                          setSelectedConvId(convId);
                          setCurrentConversation({
                            conversation_id: convId,
                            other_user_id: v.id,
                            other_user_name: v.store_name || v.vendor_name,
                            other_user_pic: v.profile_image
                          });
                        }
                      } catch (err) {
                        console.error("Error starting conversation:", err);
                        setError("Could not start conversation");
                      }
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 border border-transparent hover:bg-white/5 hover:border-white/5 active:scale-[0.98]"
                  >
                    <div className="h-12 w-12 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/30 text-teal-300 font-bold uppercase overflow-hidden">
                      {v.profile_image ? (
                        <img src={v.profile_image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Store size={20} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-white/90 leading-tight mb-1">
                        {v.store_name || v.vendor_name}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                        <User size={10} />
                        <span>{v.vendor_name}</span>
                        {v.city && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-white/10" />
                            <span>{v.city}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== CHAT VIEW ===== */}
      <div className={`flex-1 z-10 flex flex-col bg-white/2 backdrop-blur-md transition-all ${isMobileView && !selectedConvId ? "hidden md:flex" : "flex"}`}>
        {selectedConvId && currentConversation ? (
          <>
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-emerald-900/10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedConvId(null);
                    setCurrentConversation(null);
                  }}
                  className="md:hidden p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold border border-emerald-500/30">
                  {currentConversation.other_user_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none mb-1">
                    {currentConversation.other_user_name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400/80 uppercase tracking-widest font-semibold font-sans">Active Session</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar scroll-smooth">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
                  <div className="p-6 rounded-full bg-white/5 border border-white/5">
                    <Sparkles className="h-8 w-8 text-emerald-400/40" />
                  </div>
                  <p className="text-center max-w-xs text-sm">Send a message to start dealing with {currentConversation.other_user_name}!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  if (!msg) return null;
                  const isSentByMe = msg.sender_id === user.id;
                  return (
                    <div key={idx} className={`flex ${isSentByMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[85%] md:max-w-[70%] group`}>
                        <div className={`px-5 py-3.5 rounded-3xl shadow-xl ${
                          isSentByMe 
                            ? "bg-emerald-600/90 text-white rounded-br-none backdrop-blur-xl border border-emerald-400/30 shadow-emerald-900/20"
                            : "bg-white/10 text-white/90 rounded-bl-none backdrop-blur-xl border border-white/10 shadow-black/20"
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.message_text}</p>
                          {msg.attachment_url && (
                             <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                               {msg.attachment_url.toLowerCase().endsWith('.pdf') ? (
                                 <div className="bg-white/5 p-4 flex items-center justify-between gap-4">
                                   <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                                         <FileText size={20} />
                                      </div>
                                      <span className="text-xs font-medium truncate max-w-[150px]">Document.pdf</span>
                                   </div>
                                   <a 
                                     href={msg.attachment_url} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 transition shadow-lg"
                                   >
                                     <Download size={16} />
                                   </a>
                                 </div>
                               ) : (
                                 <div className="relative group/img">
                                   <img src={msg.attachment_url} className="w-full max-h-80 object-cover" alt="Attachment" />
                                   <a 
                                     href={msg.attachment_url} 
                                     download={`FarmEasy_Image_${idx}.jpg`}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="absolute top-3 right-3 p-2 rounded-full bg-emerald-500 text-white shadow-xl opacity-0 group-hover/img:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95"
                                     title="Download Image"
                                   >
                                     <Download size={16} />
                                   </a>
                                 </div>
                               )}
                             </div>
                          )}
                        </div>
                        <div className={`flex items-center gap-2 mt-2 px-1 ${isSentByMe ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="text-[10px] text-white/20 uppercase font-sans tracking-tighter">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isSentByMe && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                disabled={deletingMessageId === msg.id}
                                className="inline-flex items-center gap-1 rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                title="Delete message"
                              >
                                <Trash2 size={10} />
                                {deletingMessageId === msg.id ? "Deleting" : "Delete"}
                              </button>
                              <Check size={10} className="text-emerald-400/60" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 md:p-6 border-t border-white/5 bg-black/20 backdrop-blur-3xl">
              {/* Attachment Preview */}
              {filePreview && (
                <div className="max-w-5xl mx-auto mb-4 animate-in slide-in-from-bottom duration-300">
                  <div className="relative inline-block group">
                    {selectedFile?.type === "application/pdf" ? (
                      <div className="w-28 h-28 rounded-2xl bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-2">
                        <FileText size={32} className="text-rose-400" />
                        <span className="text-[9px] px-2 truncate w-full text-center">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <img src={filePreview} className="w-28 h-28 rounded-2xl object-cover border border-emerald-500/50 shadow-2xl" alt="Preview" />
                    )}
                    <button 
                      onClick={() => { setSelectedFile(null); setFilePreview(null); }}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-500 text-white shadow-xl hover:bg-rose-400 transition active:scale-90"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex gap-3 max-w-5xl mx-auto items-center">
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*,application/pdf"
                   onChange={(e) => {
                     const file = e.target.files[0];
                     if (!file) return;
                     setSelectedFile(file);
                     if (file.type.startsWith('image/')) {
                       setFilePreview(URL.createObjectURL(file));
                     } else {
                       setFilePreview('pdf-placeholder');
                     }
                   }}
                 />
                 <button
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   className="h-10 w-10 shrink-0 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-emerald-400 hover:bg-white/10 transition flex items-center justify-center"
                 >
                   <Paperclip size={18} />
                 </button>
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={filePreview ? "Add a caption..." : "Write a message..."}
                    disabled={sending}
                    className={`${fieldShell} !bg-white/5 !rounded-full pr-12 focus:!bg-white/10 transition-all duration-300 border-white/5 focus:border-emerald-500/40`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full transition-all duration-500 ${messageText.trim() ? "bg-emerald-400 scale-100 shadow-lg shadow-emerald-400/50" : "bg-white/10 scale-50"}`} />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-white/10 text-white h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
                >
                  {sending ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send size={20} className="ml-1" />
                  )}
                </button>
              </form>
              <p className="text-[10px] text-center text-white/20 mt-4 uppercase tracking-[0.2em]">Secure End-To-End Communication</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
             {/* ANIMATED BG FOR EMPTY STATE */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
            </div>

            <div className="z-10 relative space-y-6 max-w-sm">
                <div className="mx-auto w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center justify-center backdrop-blur-xl shadow-2xl animate-in zoom-in duration-700">
                    <MessageCircle className="h-10 w-10 text-emerald-400/40" />
                </div>
                <div>
                   <h3 className="text-2xl font-bold mb-2">Connect with Farmers</h3>
                   <p className="text-white/40 text-sm leading-relaxed">
                    Select a conversation from the left to manage your customer interactions and close deals.
                   </p>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                    <Sparkles size={12} /> Live Marketplace Sync
                </div>
            </div>
          </div>
        )}
      </div>

      {/* ERROR TOAST */}
      {error && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right duration-500">
          <div className="bg-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl">
             <div className="bg-white/20 p-1.5 rounded-lg">
                <X size={16} />
             </div>
             <p className="text-sm font-semibold">{error}</p>
             <button onClick={() => setError("")} className="ml-4 text-white/50 hover:text-white transition">Dismiss</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default VendorMessages;
