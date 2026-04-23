import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import { 
  Sprout, Sparkles, User, Clock, Check, ShieldCheck, Paperclip, FileText, Download, Trash2
} from "lucide-react";
import { useSocket } from "../context/SocketContext";

const VendorChat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const messagesEndRef = useRef(null);
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
  const { socket } = useSocket();

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
           if (conv) {
             setCurrentConversation(conv);
           } else {
             // Direct navigation: Try to fetch the other user info
             const ids = conversationId.split("_");
             const otherId = ids.find((id) => id !== user.id.toString());
             if (otherId) {
               try {
                 const userRes = await axios.get(`${API_URL}/api/vendor/profile`, {
                   params: { vendor_id: otherId },
                   headers: { Authorization: `Bearer ${token}` }
                 });
                 if (userRes.data) {
                   setCurrentConversation({
                     conversation_id: conversationId,
                     other_user_id: otherId,
                     other_user_name: userRes.data.store_name || userRes.data.vendor_name,
                     other_user_pic: userRes.data.profile_image
                   });
                 }
               } catch (err) {
                 console.error("Could not fetch other user info:", err);
               }
             }
           }
         }
       } catch (_err) {
         console.error("Error fetching conversations:", _err);
         setError("Failed to load conversations");
       } finally {
         setLoading(false);
       }
    };

    const fetchAllVendors = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/vendor/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllVendors(res.data.data || []);
      } catch (err) {
        console.error("Error fetching vendor list:", err);
      }
    };

    fetchConversations();
    fetchAllVendors();
  }, [token, conversationId, navigate]);

  // Socket logic for real-time messages
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join the conversation room
    socket.emit("join chat", conversationId);

    socket.on("message received", (newMessage) => {
      if (newMessage.conversation_id === conversationId) {
        setMessages((prev) => {
          if (prev.find(m => m?.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    });

    return () => {
      socket.off("message received");
    };
  }, [socket, conversationId]);

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
    // Socket handles real-time updates now!
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
    if (!messageText.trim() && !selectedFile) return;

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
          receiver_id: currentConversation.other_user_id,
          message_text: messageText,
          attachment_url
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages([...messages, res.data.data]);
      setMessageText("");
      setSelectedFile(null);
      setFilePreview(null);
      
      // Refresh conversations to update sidebar
      const convRes = await axios.get(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(convRes.data.data.conversations || []);
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
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] bg-[#04110d] font-Lora text-white overflow-hidden flex relative">
      {/* DECORATIONS */}
      <div className="absolute inset-0 opacity-20 pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* LEFT SIDEBAR: CONVERSATIONS */}
      <div className={`z-10 flex flex-col h-full border-r border-white/10 bg-white/5 backdrop-blur-2xl transition-all duration-300 shadow-2xl ${conversationId ? "hidden md:flex w-full md:w-96" : "w-full"}`}>
        <div className="p-6 border-b border-white/5">
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300">
                <MessageCircle size={24} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
           </div>
           
            <div className="relative group mb-4">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-emerald-300 transition" />
               <input
                 type="text"
                 placeholder={activeTab === 'chats' ? "Search chats..." : "Search vendors..."}
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
                <User size={14} />
                All Vendors
              </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
           {activeTab === "chats" ? (
             filteredConversations.length > 0 ? (
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
             )
           ) : (
             /* ALL VENDORS TAB */
             <div className="space-y-1">
               {allVendors
                 .filter(v => v.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) || (v.store_name || "").toLowerCase().includes(searchTerm.toLowerCase()))
                 .map((v) => (
                   <button
                     key={v.id}
                     onClick={async () => {
                       if (v.id === user.id) return;
                       try {
                         setLoading(true);
                         const res = await axios.post(
                           `${API_URL}/api/messages/conversation/start`,
                           { vendor_id: v.id },
                           { headers: { Authorization: `Bearer ${token}` } }
                         );
                         if (res.data.success) {
                           const convId = res.data.data.conversationId;
                           
                           // Create a skeleton conversation object so the UI opens immediately
                           const newConv = {
                             conversation_id: convId,
                             other_user_id: v.id,
                             other_user_name: v.store_name || v.vendor_name,
                             other_user_pic: v.profile_image,
                             last_message: "Chat started",
                             last_message_time: new Date().toISOString()
                           };

                           setActiveTab("chats");
                           setCurrentConversation(newConv);
                           
                           // Re-fetch conversations to refresh the sidebar
                           const convRes = await axios.get(`${API_URL}/api/messages/conversations`, {
                             headers: { Authorization: `Bearer ${token}` },
                           });
                           setConversations(convRes.data.data.conversations || []);
                           
                           navigate(`/chat/${convId}`);
                         }
                       } catch (err) {
                         console.error("Error starting conversation:", err);
                         setError("Could not start conversation");
                       } finally {
                         setLoading(false);
                       }
                     }}
                     className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent hover:bg-white/5"
                   >
                     <div className="h-12 w-12 shrink-0 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold overflow-hidden">
                       {v.profile_image ? (
                         <img src={v.profile_image} className="h-full w-full object-cover" alt="" />
                       ) : (
                          v.vendor_name?.charAt(0).toUpperCase()
                       )}
                     </div>
                     <div className="flex-1 text-left min-w-0">
                       <h3 className="font-bold text-white/90 truncate">{v.store_name || v.vendor_name}</h3>
                       <p className="text-xs text-white/40 truncate">{v.vendor_name}</p>
                     </div>
                   </button>
                 ))}
             </div>
           )}
        </div>
      </div>

      {/* RIGHT PANEL: CHAT */}
      <div className={`z-10 flex-1 flex flex-col h-full bg-white/2 backdrop-blur-md transition-all ${!conversationId ? "hidden md:flex" : "flex"}`}>
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
                  if (!msg) return null;
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
                                     className="absolute top-4 right-4 p-2.5 rounded-full bg-emerald-500 text-white shadow-2xl opacity-0 group-hover/img:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
                                     title="Download Image"
                                   >
                                     <Download size={18} />
                                   </a>
                                 </div>
                               )}
                             </div>
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
            <div className="p-4 md:p-6 bg-black/20 border-t border-white/5 backdrop-blur-3xl">
              {/* Attachment Preview */}
              {filePreview && (
                <div className="max-w-5xl mx-auto mb-4 animate-in slide-in-from-bottom duration-300">
                  <div className="relative inline-block group">
                    {selectedFile?.type === "application/pdf" ? (
                      <div className="w-32 h-32 rounded-2xl bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-2">
                        <FileText size={32} className="text-rose-400" />
                        <span className="text-[9px] px-2 truncate w-full text-center">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <img src={filePreview} className="w-32 h-32 rounded-2xl object-cover border border-emerald-500/50 shadow-2xl" alt="Preview" />
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

              <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex gap-3 items-center">
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
                   className="h-12 w-12 shrink-0 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-emerald-400 hover:bg-white/10 transition flex items-center justify-center flex-col"
                 >
                   <Paperclip size={20} />
                 </button>
                 <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={filePreview ? "Add a caption..." : "Type your message here..."}
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
