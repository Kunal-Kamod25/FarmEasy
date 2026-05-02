import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from '../../config';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import {
  Package, ShoppingCart, IndianRupee, TrendingUp,
  Plus, LayoutDashboard, ClipboardList, Store, Clock, CheckCircle, Truck, AlertCircle,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { getDisplayOrderStatus, getOrderStatusClass } from "../../utils/orderStatus";
import { AutoCloseTooltipContent } from "../../hooks/useAutoCloseTooltip";

const PIE_COLORS = ["#16a34a", "#f59e0b", "#6366f1", "#ef4444", "#06b6d4", "#8b5cf6"];

export default function VendorDashboard() {
  const token = localStorage.getItem("token");
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return {}; }
  })();

  const getThirtyDaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  };

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getThirtyDaysAgo());
  const [endDate, setEndDate] = useState(getToday());

  // dashboard stats from API
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeOffers: 0,
    categoryBreakdown: [],
    monthlyBreakdown: [],
    feedbackStats: []
  });
  const [recentReviews, setRecentReviews] = useState([]);

  const [statsLoading, setStatsLoading] = useState(true);

  // fetch real vendor name from profile
  const [vendorName] = useState(user?.full_name || user?.fullname || "Vendor");

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await axios.get(`${API_URL}/api/vendor/dashboard?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [token, startDate, endDate]);

  const fetchRecentReviews = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`${API_URL}/api/reviews/vendor/${user.id}/product-reviews?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecentReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Recent reviews fetch error:", err);
    }
  }, [token, user?.id]);

  useEffect(() => {
    fetchStats();
    fetchRecentReviews();
  }, [fetchStats, fetchRecentReviews]);

  const monthlyData = stats.monthlyBreakdown || [];
  const feedbackData = stats.feedbackStats || [];

  // build pie chart data from real category breakdown
  const pieData = stats.categoryBreakdown?.length > 0
    ? stats.categoryBreakdown
    : [{ name: "No Products", count: 1 }];

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts || 0,
      icon: <Package size={22} />,
      color: "from-emerald-400 via-green-500 to-teal-600",
      bgGradient: "bg-gradient-to-br",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders || 0,
      icon: <ShoppingCart size={22} />,
      color: "from-blue-400 via-cyan-500 to-sky-600",
      bgGradient: "bg-gradient-to-br",
    },
    {
      title: "Total Revenue",
      value: `₹${Number(stats.totalRevenue || 0).toLocaleString()}`,
      icon: <IndianRupee size={22} />,
      color: "from-violet-400 via-purple-500 to-indigo-600",
      bgGradient: "bg-gradient-to-br",
    },
    {
      title: "Avg. Order Value",
      value: stats.totalOrders
        ? `₹${Math.floor(stats.totalRevenue / stats.totalOrders).toLocaleString()}`
        : "₹0",
      icon: <TrendingUp size={22} />,
      color: "from-orange-400 via-amber-500 to-red-600",
      bgGradient: "bg-gradient-to-br",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent px-6 pb-6 space-y-8">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-30 -mx-6 px-6 py-4 bg-gray-50/80 backdrop-blur-md border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">
            Welcome back, <span className="text-emerald-600 font-bold">{vendorName}</span>! Here's what's happening today.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-100 text-sm font-medium text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-gray-50 cursor-pointer"
            max={endDate}
          />
          <span className="text-gray-400 font-medium">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-100 text-sm font-medium text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-gray-50 cursor-pointer"
            min={startDate}
            max={getToday()}
          />
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`${card.bgGradient} ${card.color} rounded-[2.5rem] p-6 text-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group border border-white/10`}
          >
            {/* Background Blur Effects */}
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/15 rounded-full blur-3xl group-hover:bg-white/25 transition-all duration-300"></div>
            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/15 transition-all duration-300"></div>
            
            {/* Content */}
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="bg-white/20 backdrop-blur-md p-3.5 rounded-2xl shadow-lg group-hover:bg-white/30 transition-all duration-300 border border-white/20">
                {card.icon}
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <TrendingUp size={18} className="text-white" />
              </div>
            </div>
            
            <p className="text-white/75 text-xs font-bold uppercase tracking-[0.15em] relative z-10 letter-spacing">{card.title}</p>
            <h3 className="text-4xl font-black mt-2 relative z-10 drop-shadow-lg">{statsLoading ? "..." : card.value}</h3>
            
            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 group-hover:h-1.5 transition-all duration-300"></div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Revenue Overview</h2>
              <p className="text-gray-400 text-xs font-medium mt-1">Total earnings in the selected period</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider">
              <TrendingUp size={14} />
              Growth
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} />
                <Tooltip
                  content={<AutoCloseTooltipContent 
                    contentStyle={{ borderRadius: 20, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", padding: '12px 16px' }}
                    itemStyle={{ fontWeight: 700, fontSize: 13 }}
                    labelStyle={{ fontWeight: 800, marginBottom: 4, color: '#1e293b' }}
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, "Revenue"]}
                    duration={3000}
                  />}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4}
                  fill="url(#colorRev)" dot={{ r: 6, fill: "#10b981", strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Products by Category Pie */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 flex flex-col hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Stock Portfolio</h2>
          <p className="text-gray-400 text-xs font-medium mb-6">Distribution by category</p>
          {statsLoading ? (
            <div className="flex-1 bg-gray-50/50 rounded-2xl animate-pulse" />
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData.map(c => ({ name: c.name, value: c.count || c.value || 0 }))}
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={<AutoCloseTooltipContent 
                        contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                        duration={3000}
                      />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {pieData.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider truncate">{item.name}</span>
                    </div>
                    <span className="text-gray-900 font-extrabold text-sm ml-4">{item.count || item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── CHARTS ROW 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Order History Bar Chart */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Order History</h2>
              <p className="text-gray-400 text-xs font-medium mt-1">Number of orders processed</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} />
                <Tooltip
                  content={<AutoCloseTooltipContent 
                    contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
                    formatter={(val) => [val, "Orders"]}
                    duration={3000}
                  />}
                  cursor={{ fill: '#f8fafc', radius: 10 }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Feedback Graph */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Customer Feedback</h2>
              <p className="text-gray-400 text-xs font-medium mt-1">Average rating trend over time</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feedbackData}>
                <defs>
                  <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 5]} tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} />
                <Tooltip
                  content={<AutoCloseTooltipContent 
                    contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
                    formatter={(val) => [`${val} ⭐`, "Rating"]}
                    duration={3000}
                  />}
                />
                <Area type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={4} fill="url(#colorRating)"
                  dot={{ r: 6, fill: "#f59e0b", strokeWidth: 3, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── RECENT REVIEWS SECTION ── */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Recent Customer Reviews</h2>
            <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">Feedback on your products</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider">
            {recentReviews.length} New
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentReviews.length > 0 ? (
            recentReviews.map((review) => (
              <Link 
                to={`/vendor/products/${review.product_id}`}
                key={review.id} 
                className="group p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100 hover:border-emerald-500/30 hover:bg-white hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 relative overflow-hidden block"
              >
                {/* Product Badge */}
                <div className="mb-4">
                  <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-tighter shadow-sm">
                    {review.product_name}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} 
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-600 text-sm font-medium leading-relaxed mb-4 line-clamp-3 italic">
                  "{review.comment || review.review_text || "No comment provided."}"
                </p>

                {/* Reviewer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-[10px] uppercase">
                      {review.reviewer_name?.charAt(0) || "A"}
                    </div>
                    <span className="text-xs font-bold text-gray-900">{review.reviewer_name || "Anonymous"}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Decorative Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-gray-50/30 rounded-[2.5rem] border-2 border-dashed border-gray-100">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <Star className="text-gray-200" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-400">No reviews yet</h3>
              <p className="text-gray-400 text-xs font-medium">As customers buy your products, their reviews will appear here.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// tiny helper component for order status badge
const OrderStatusBadge = ({ status }) => {
  const normalizedStatus = getDisplayOrderStatus(status);
  const cls = getOrderStatusClass(normalizedStatus);

  const icons = {
    Pending: <Clock size={12} />,
    Processing: <Package size={12} />,
    Shipped: <Truck size={12} />,
    Delivered: <CheckCircle size={12} />,
    Cancelled: <AlertCircle size={12} />,
  };

  const icon = icons[normalizedStatus] || icons.Pending;

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cls}`}>
      {icon}
      {normalizedStatus}
    </span>
  );
};