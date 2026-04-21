import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { 
  Send, Loader, X, ArrowLeft, MessageCircle, Search, 
  Sprout, Sparkles, User, Clock, Check, ShieldCheck
} from "lucide-react";

const VendorChat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

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
        const convs = res.data.data.conversations || [];
        setConversations(convs);

        if (conversationId) {
          const conv = convs.find((c) => c.conversation_id === conversationId);
          if (conv) setCurrentConversation(conv);
        }
      } catch (_err) {
        console.error("Error fetching conversations:", _err);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token, conversationId, navigate]);

  useEffect(() => {
    if (!currentConversation || !conversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/messages/conversation/${conversationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.data.messages || []);
      } catch (_err) {
        console.error("Error fetching messages:", _err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [currentConversation, conversationId, token]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      setMessageText("");
    } catch {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleConversationClick = (conv) => {
    setCurrentConversation(conv);
    navigate(`/chat/${conv.conversation_id}`);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fieldShell =
    "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-emerald-300/60 focus:bg-white/10 focus:ring-2 focus:ring-emerald-200/20";

  if (loading && conversations.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04110d] font-Lora">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 animate-spin text-emerald-400" />
          <p className="text-white/40 text-sm tracking-widest uppercase animate-pulse">Initializing Secure Chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#04110d] font-Lora text-white overflow-hidden flex relative">
      {/* DECORATIONS */}
      <div className="absolute inset-0 opacity-20 pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* LEFT SIDEBAR: CONVERSATIONS */}
      <div className={`z-10 flex flex-col border-r border-white/10 bg-white/5 backdrop-blur-2xl transition-all duration-300 shadow-2xl ${conversationId ? "hidden md:flex w-full md:w-96" : "w-full"}`}>
        <div className="p-6 border-b border-white/5">
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300">
                <MessageCircle size={24} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
           </div>
           
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-emerald-300 transition" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${fieldShell} pl-11`}
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
           {filteredConversations.length > 0 ? (
             <div className="space-y-1">
               {filteredConversations.map((conv) => (
                  <button
                    key={conv.conversation_id}
                    onClick={() => handleConversationClick(conv)}
                    className={`w-full group relative flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent ${
                      currentConversation?.conversation_id === conv.conversation_id
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="relative h-14 w-14 shrink-0 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xl overflow-hidden shadow-lg shadow-emerald-950/40">
                      {conv.other_user_pic ? (
                        <img src={conv.other_user_pic} className="h-full w-full object-cover" alt="" />
                      ) : (
                        conv.other_user_name?.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className="font-bold text-white/90 truncate">{conv.other_user_name}</h3>
                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-sans">
                           {conv.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <p className="text-sm text-white/40 truncate leading-relaxed">
                        {conv.last_message || "No messages yet..."}
                      </p>
                    </div>

                    {conv.unread_count > 0 && (
                      <div className="absolute right-4 bottom-4 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg ring-2 ring-[#04110d]">
                        {conv.unread_count}
                      </div>
                    )}
                  </button>
               ))}
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center p-8 text-center text-white/20">
                <MessageCircle size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-sm font-semibold tracking-widest uppercase">No Conversations</p>
             </div>
           )}
        </div>
      </div>

      {/* RIGHT PANEL: CHAT */}
      <div className={`z-10 flex-1 flex flex-col bg-white/2 backdrop-blur-md transition-all ${!conversationId ? "hidden md:flex" : "flex"}`}>
        {currentConversation ? (
          <>
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-white/5 bg-emerald-900/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/chat")}
                  className="md:hidden p-3 rounded-2xl bg-white/5 border border-white/10"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="relative">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold overflow-hidden">
                    {currentConversation.other_user_pic ? (
                      <img src={currentConversation.other_user_pic} className="h-full w-full object-cover" alt="" />
                    ) : (
                      currentConversation.other_user_name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 rounded-full ring-2 ring-[#04110d]" />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-none mb-1">{currentConversation.other_user_name}</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck size={10} /> Verified User
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition group border border-white/5">
                   <Clock size={18} className="group-hover:rotate-12 transition-transform" />
                 </button>
                 <button onClick={() => navigate("/chat")} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition border border-white/5">
                   <X size={18} />
                 </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar scroll-smooth">
              {messages.length > 0 ? (
                messages.map((msg, idx) => {
                  const isSentByMe = msg.sender_id === user.id;
                  return (
                    <div key={idx} className={`flex ${isSentByMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className="max-w-[85%] md:max-w-[70%] group">
                        <div className={`px-5 py-3.5 rounded-[2rem] shadow-2xl ${
                          isSentByMe 
                            ? "bg-emerald-600/90 text-white rounded-br-none backdrop-blur-xl border border-emerald-400/30 shadow-emerald-950/40"
                            : "bg-white/5 text-white/90 rounded-bl-none backdrop-blur-xl border border-white/10 shadow-black/20"
                        }`}>
                          <p className="text-sm leading-relaxed break-words">{msg.message_text}</p>
                          {msg.attachment_url && (
                             <img src={msg.attachment_url} className="mt-3 rounded-2xl w-full max-h-64 object-cover border border-white/10 shadow-lg" alt="" />
                          )}
                        </div>
                        <div className={`mt-2 px-1 flex items-center gap-2 ${isSentByMe ? "flex-row-reverse" : ""}`}>
                           <span className="text-[10px] text-white/20 uppercase tracking-tighter">
                             {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           {isSentByMe && <Check size={10} className="text-emerald-400/60" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-6">
                   <div className="p-8 rounded-[3rem] bg-white/5 border border-white/5 shadow-2xl">
                     <Sparkles size={48} className="text-emerald-500/40" />
                   </div>
                   <p className="text-sm tracking-widest uppercase font-bold">Start a secure conversation</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-6 md:p-8 bg-black/20 border-t border-white/5 backdrop-blur-3xl">
              <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex gap-4 items-center">
                 <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message here..."
                      disabled={sending}
                      className={`${fieldShell} !rounded-[2rem] !bg-white/5 !border-white/10 h-14 pr-12 focus:!bg-white/10 focus:border-emerald-500/40 transition-all duration-300`}
                    />
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full transition-all duration-500 shadow-lg ${messageText.trim() ? "bg-emerald-400 shadow-emerald-500/50 scale-100" : "bg-white/10 shadow-transparent scale-50"}`} />
                 </div>
                 <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="h-14 w-14 shrink-0 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-300 disabled:bg-white/5 disabled:text-white/10"
                >
                  {sending ? <Loader className="animate-spin" size={20} /> : <Send size={24} className="ml-1" />}
                </button>
              </form>
              <div className="flex justify-center gap-6 mt-4 opacity-30">
                 <span className="text-[9px] uppercase tracking-[0.3em] font-bold">End-To-End Encrypted</span>
                 <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Marketplace Verified</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
             <div className="relative z-10 space-y-8 max-w-sm">
                <div className="mx-auto w-28 h-28 rounded-[3rem] bg-white/5 border border-white/5 flex items-center justify-center backdrop-blur-2xl shadow-2xl animate-in zoom-in duration-700">
                   <MessageCircle size={40} className="text-white/20" />
                </div>
                <div>
                   <h2 className="text-3xl font-bold mb-4">Chat with Vendors</h2>
                   <p className="text-white/40 text-sm leading-relaxed">
                     Select a dealer profile to inquire about crop availability, pricing, or shipping details. Your chats are always secure.
                   </p>
                </div>
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                    <Sprout size={14} className="text-emerald-400/60" /> Smart Marketplace Sync
                </div>
             </div>
          </div>
        )}
      </div>

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
      `}</style>
    </div>
  );
};

export default VendorChat;
