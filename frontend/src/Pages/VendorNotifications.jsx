import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { 
  Bell, Check, Trash2, Loader, Package, AlertTriangle, 
  TrendingUp, ArrowLeft, MoreVertical, X, Filter, Sparkles, Sprout, Clock, ArrowRight,
  RefreshCw
} from "lucide-react";

const VendorNotifications = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { 
    notifications: ctxNotifications, 
    unreadCount: ctxUnreadCount, 
    markAsRead: ctxMarkAsRead, 
    markAllAsRead: ctxMarkAllAsRead, 
    refreshNotifications 
  } = useNotifications();

  const location = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const isVendorPath = location.pathname.includes("/vendor");
  const effectiveRole = isVendorPath ? "vendor" : "customer";

  // Auto-mark all as read when user opens the page
  useEffect(() => {
    if (token) {
       ctxMarkAllAsRead();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_order":
        return <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-300"><Package size={24} /></div>;
      case "low_stock":
        return <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300"><AlertTriangle size={24} /></div>;
      case "order_processing":
        return <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300"><TrendingUp size={24} /></div>;
      case "order_shipped":
        return <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-300"><ArrowRight size={24} /></div>;
      case "order_completed":
        return <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300"><Check size={24} /></div>;
      case "order_cancelled":
        return <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-300"><X size={24} /></div>;
      case "order_placed":
      case "order_update":
      case "order_status_change":
        return <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300"><Package size={24} /></div>;
      case "qa_answered":
        return <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300"><Bell size={24} /></div>;
      default:
        return <div className="p-2.5 rounded-2xl bg-white/10 text-white/60"><Bell size={24} /></div>;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      ctxMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  // Filter context notifications based on user selection
  const displayNotifications = useMemo(() => {
    let filtered = [...ctxNotifications];
    
    // 1. Role filter (vendor/customer)
    // The context already filters by role, so we just use what it gives us.
    
    // 2. Read/Unread filter
    if (filter === "unread") {
      filtered = filtered.filter((n) => !n.is_read);
    }
    
    return filtered;
  }, [ctxNotifications, filter]);

  if (!token) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#04110d] font-Lora text-white overflow-x-hidden relative">
      {/* DECORATIONS */}
      <div className="absolute inset-0 opacity-20 pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="absolute -left-20 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute right-0 bottom-40 h-80 w-80 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

      <main className="max-w-4xl mx-auto py-12 px-6 relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
             <button
              onClick={() => navigate(-1)}
              className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
                <Sparkles size={12} /> Live Updates
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                {effectiveRole === "vendor" ? "Vendor Alerts" : "My Notifications"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={handleManualRefresh}
               className={`p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 transition ${refreshing ? "animate-spin" : ""}`}
             >
               <RefreshCw size={16} />
             </button>
             {ctxUnreadCount > 0 && (
                <button
                  onClick={ctxMarkAllAsRead}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                >
                  Mark all as read
                </button>
             )}
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-white/5 border border-white/5 w-fit mb-8 backdrop-blur-xl">
           <button
             onClick={() => setFilter("all")}
             className={`px-6 py-1.5 rounded-[14px] text-xs font-bold transition-all ${filter === "all" ? "bg-white/10 text-white shadow-xl" : "text-white/40 hover:text-white/70"}`}
           >
             All ({ctxNotifications.length})
           </button>
           <button
             onClick={() => setFilter("unread")}
             className={`px-6 py-1.5 rounded-[14px] text-xs font-bold transition-all ${filter === "unread" ? "bg-white/10 text-white shadow-xl" : "text-white/40 hover:text-white/70"}`}
           >
             Unread ({ctxUnreadCount})
           </button>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {displayNotifications.length === 0 ? (
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-16 text-center backdrop-blur-2xl">
              <div className="mx-auto w-24 h-24 rounded-[3rem] bg-white/5 border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                 <Bell size={40} className="text-white/20" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No alerts found</h3>
              <p className="text-white/40 max-w-xs mx-auto text-sm leading-relaxed">
                We'll notify you when someone places an order or sends you a query.
              </p>
            </div>
          ) : (
            displayNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`group relative rounded-[2.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl transition-all duration-300 hover:bg-white/8 hover:-translate-y-1 cursor-pointer overflow-hidden ${!notification.is_read ? "border-l-4 border-l-emerald-400 shadow-[0_10px_30px_-10px_rgba(52,211,153,0.2)]" : ""}`}
              >
                  {/* UNREAD GLOW */}
                  {!notification.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400" />
                  )}

                <div className="flex items-start gap-6">
                  {getNotificationIcon(notification.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold truncate pr-6 ${!notification.is_read ? "text-white text-xl" : "text-white/70"}`}>
                        {notification.title}
                      </h3>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest font-sans flex items-center gap-1.5 shrink-0">
                         <Clock size={10} /> 
                         {new Date(notification.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-white/50 text-sm leading-relaxed mb-4">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                       {notification.action_url && (
                          <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                             Respond to alert <ArrowRight size={12} />
                          </span>
                       )}
                       
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          {!notification.is_read && (
                             <button
                               onClick={(e) => { e.stopPropagation(); ctxMarkAsRead(notification.id); }}
                               className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition"
                               title="Mark as read"
                             >
                               <Check size={16} />
                             </button>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SUMMARY */}
        {displayNotifications.length > 0 && (
          <div className="mt-12 text-center">
             <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/5 bg-white/2 backdrop-blur-xl text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
                Showing {displayNotifications.length} Active System Alerts
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorNotifications;
