import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, Legend,
  AreaChart, Area,
} from "recharts";
import {
  Package, ShoppingCart, IndianRupee, TrendingUp,
  Star, AlertCircle, ArrowUpRight, ArrowDownRight,
  Plus, Eye, Pencil
} from "lucide-react";
import { Link } from "react-router-dom";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Simulated monthly revenue data (you can replace with real API later)
const generateMonthlyData = (totalRevenue) => {
  const base = totalRevenue / 12 || 5000;
  return MONTHS.slice(0, 6).map((m, i) => ({
    month: m,
    revenue: Math.floor(base * (0.6 + Math.random() * 0.8)),
    orders: Math.floor(Math.random() * 20 + 5),
  }));
};

export default function VendorDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeOffers: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return {}; } })();

  useEffect(() => {
    fetchDashboard();
    fetchRecentProducts();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/vendor/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data || {});
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/vendor/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecentProducts((res.data || []).slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const monthlyData = generateMonthlyData(stats.totalRevenue);

  const pieData = [
    { name: "Products", value: stats.totalProducts || 1 },
    { name: "Orders", value: stats.totalOrders || 1 },
    { name: "Offers", value: stats.activeOffers || 1 },
  ];
  const PIE_COLORS = ["#16a34a", "#f59e0b", "#6366f1"];

  const categoryData = [
    { name: "Seeds", count: 12 },
    { name: "Fertilizers", count: 8 },
    { name: "Equipment", count: 5 },
    { name: "Pesticides", count: 9 },
    { name: "Irrigation", count: 4 },
  ];

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts || 0,
      icon: <Package size={22} />,
      color: "from-emerald-500 to-green-600",
      change: "+3 this month",
      up: true,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders || 0,
      icon: <ShoppingCart size={22} />,
      color: "from-blue-500 to-cyan-500",
      change: "+12% vs last month",
      up: true,
    },
    {
      title: "Total Revenue",
      value: `₹${Number(stats.totalRevenue || 0).toLocaleString()}`,
      icon: <IndianRupee size={22} />,
      color: "from-violet-500 to-purple-600",
      change: "+8.2% this month",
      up: true,
    },
    {
      title: "Avg. Order Value",
      value: stats.totalOrders
        ? `₹${Math.floor(stats.totalRevenue / stats.totalOrders).toLocaleString()}`
        : "₹0",
      icon: <TrendingUp size={22} />,
      color: "from-orange-500 to-amber-500",
      change: "Per order",
      up: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.full_name || user?.fullname || "Vendor"} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Here's what's happening with your store today.
          </p>
        </div>
        <Link
          to="/vendor/add-product"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-semibold"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="bg-white/20 p-2.5 rounded-xl">
                {card.icon}
              </div>
              {card.up !== null && (
                <span className="bg-white/20 rounded-lg px-2 py-1 text-xs font-semibold flex items-center gap-1">
                  {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {card.up ? "Up" : "Down"}
                </span>
              )}
            </div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{card.title}</p>
            <h3 className="text-3xl font-bold mt-1">{card.value}</h3>
            <p className="text-white/60 text-xs mt-2">{card.change}</p>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Revenue Overview</h2>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold">
              Last 6 Months
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5}
                  fill="url(#colorRev)" dot={{ r: 4, fill: "#16a34a" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-2">Business Split</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Orders Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-4">Monthly Orders</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((_, idx) => (
                    <Cell key={idx} fill={idx % 2 === 0 ? "#16a34a" : "#4ade80"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-800 mb-4">Products by Category</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#6b7280" }} width={80} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none" }}
                />
                <Bar dataKey="count" fill="#16a34a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── RECENT PRODUCTS TABLE ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Recent Products</h2>
          <Link
            to="/vendor/products"
            className="text-emerald-600 text-sm font-semibold hover:underline flex items-center gap-1"
          >
            View All <ArrowUpRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500">No products yet. Add your first product!</p>
            <Link
              to="/vendor/add-product"
              className="mt-3 bg-emerald-600 text-white text-sm px-5 py-2 rounded-xl hover:bg-emerald-700 transition font-semibold"
            >
              + Add Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Product</th>
                  <th className="text-left px-6 py-3">Type</th>
                  <th className="text-left px-6 py-3">Stock</th>
                  <th className="text-left px-6 py-3">Price</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 leading-tight line-clamp-1 max-w-[180px]">
                            {p.product_name}
                          </p>
                          <p className="text-gray-400 text-xs line-clamp-1 max-w-[180px]">
                            {p.product_description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {p.product_type || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${p.product_quantity > 10 ? "text-emerald-600" : p.product_quantity > 0 ? "text-amber-500" : "text-red-500"}`}>
                        {p.product_quantity ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      ₹{Number(p.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${p.product_quantity > 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                        }`}>
                        {p.product_quantity > 0 ? "Active" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to="/vendor/products"
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                        >
                          <Eye size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Add Product", to: "/vendor/add-product", icon: <Plus size={20} />, color: "bg-emerald-500" },
          { label: "View Products", to: "/vendor/products", icon: <Package size={20} />, color: "bg-blue-500" },
          { label: "View Orders", to: "/vendor/orders", icon: <ShoppingCart size={20} />, color: "bg-violet-500" },
          { label: "Sales Report", to: "/vendor/sales", icon: <TrendingUp size={20} />, color: "bg-orange-500" },
        ].map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className={`${action.color} hover:opacity-90 text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95`}
          >
            <div className="bg-white/20 p-2.5 rounded-xl">
              {action.icon}
            </div>
            <span className="text-sm font-semibold">{action.label}</span>
          </Link>
        ))}
      </div>

    </div>
  );
}