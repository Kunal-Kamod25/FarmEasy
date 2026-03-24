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
  AlertCircle, ArrowUpRight, Plus, Eye, Pencil,
  LayoutDashboard, ClipboardList, Store, Clock, CheckCircle, Truck
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getDisplayOrderStatus, getOrderStatusClass } from "../../utils/orderStatus";

const PIE_COLORS = ["#16a34a", "#f59e0b", "#6366f1", "#ef4444", "#06b6d4", "#8b5cf6"];

export default function VendorDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return {}; }
  })();

  // which tab is active: dashboard | my-products | my-orders
  const [activeTab, setActiveTab] = useState("dashboard");

  // dashboard stats from API
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeOffers: 0,
    categoryBreakdown: [],
    monthlyBreakdown: []
  });

  // vendor's own products
  const [recentProducts, setRecentProducts] = useState([]);

  // vendor's purchases as a buyer
  const [myOrders, setMyOrders] = useState([]);

  const [statsLoading, setStatsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  // fetch real vendor name from profile
  const [vendorName] = useState(user?.full_name || user?.fullname || "Vendor");

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/vendor/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  const fetchRecentProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/vendor/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecentProducts(res.data || []);
    } catch (err) {
      console.error("Products fetch error:", err);
    } finally {
      setProductsLoading(false);
    }
  }, [token]);

  const fetchMyOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const res = await axios.get(`${API_URL}/api/vendor/my-purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyOrders(res.data || []);
      setOrdersLoaded(true);
    } catch (err) {
      console.error("My orders error:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
    fetchRecentProducts();
  }, [fetchRecentProducts, fetchStats]);

  // lazy load orders only when tab is clicked - no need to load on mount
  useEffect(() => {
    if (activeTab === "my-orders" && !ordersLoaded) {
      fetchMyOrders();
    }
  }, [activeTab, fetchMyOrders, ordersLoaded]);

  const monthlyData = stats.monthlyBreakdown?.length
    ? stats.monthlyBreakdown
    : [];

  // build pie chart data from real category breakdown
  const pieData = stats.categoryBreakdown?.length > 0
    ? stats.categoryBreakdown
    : [{ name: "No Products", count: 1 }];

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts || 0,
      icon: <Package size={22} />,
      color: "from-emerald-400 to-green-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders || 0,
      icon: <ShoppingCart size={22} />,
      color: "from-blue-400 to-cyan-500",
    },
    {
      title: "Total Revenue",
      value: `₹${Number(stats.totalRevenue || 0).toLocaleString()}`,
      icon: <IndianRupee size={22} />,
      color: "from-violet-400 to-purple-600",
    },
    {
      title: "Avg. Order Value",
      value: stats.totalOrders
        ? `₹${Math.floor(stats.totalRevenue / stats.totalOrders).toLocaleString()}`
        : "₹0",
      icon: <TrendingUp size={22} />,
      color: "from-orange-400 to-amber-500",
    },
  ];

  // tab config for clean rendering
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: "my-products", label: "My Products", icon: <Package size={16} /> },
    { id: "my-orders", label: "My Orders", icon: <ClipboardList size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {vendorName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        {/* Add Product button right in the header - not in sidebar */}
        <Link
          to="/vendor/add-product"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-semibold"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                ? "bg-emerald-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════
           TAB: DASHBOARD (stats + charts)
      ═══════════════════════════════════════════════ */}
      {activeTab === "dashboard" && (
        <>
          {/* stat cards */}
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
                </div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{card.title}</p>
                <h3 className="text-3xl font-bold mt-1">{statsLoading ? "..." : card.value}</h3>
              </div>
            ))}
          </div>

          {/* charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* revenue area chart */}
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

            {/* real category breakdown pie chart - from DB */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-800 mb-2">Products by Category</h2>
              {statsLoading ? (
                <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
              ) : (
                <>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData.map(c => ({ name: c.name, value: c.count || c.value || 1 }))}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {pieData.slice(0, 4).map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-gray-600 truncate max-w-[120px]">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-800">{item.count || item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* quick actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Add Product", to: "/vendor/add-product", icon: <Plus size={20} />, color: "bg-emerald-500" },
              { label: "View Products", to: ".", icon: <Package size={20} />, color: "bg-blue-500", tab: "my-products" },
              { label: "My Orders", to: ".", icon: <ShoppingCart size={20} />, color: "bg-violet-500", tab: "my-orders" },
              { label: "Sales Report", to: "/vendor/sales", icon: <TrendingUp size={20} />, color: "bg-orange-500" },
            ].map((action, i) => (
              action.tab ? (
                <button
                  key={i}
                  onClick={() => setActiveTab(action.tab)}
                  className={`${action.color} hover:opacity-90 text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95`}
                >
                  <div className="bg-white/20 p-2.5 rounded-xl">{action.icon}</div>
                  <span className="text-sm font-semibold">{action.label}</span>
                </button>
              ) : (
                <Link
                  key={i}
                  to={action.to}
                  className={`${action.color} hover:opacity-90 text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95`}
                >
                  <div className="bg-white/20 p-2.5 rounded-xl">{action.icon}</div>
                  <span className="text-sm font-semibold">{action.label}</span>
                </Link>
              )
            ))}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════
           TAB: MY PRODUCTS (vendor's product cards)
      ═══════════════════════════════════════════════ */}
      {activeTab === "my-products" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">
              My Products ({recentProducts.length})
            </h2>
            <Link
              to="/vendor/add-product"
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
            >
              <Plus size={14} /> Add New
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
              <Package className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-gray-600 font-bold">No products yet</p>
              <p className="text-gray-400 text-sm mt-1">Add your first product to start selling</p>
              <Link
                to="/vendor/add-product"
                className="mt-4 bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition font-semibold"
              >
                + Add Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentProducts.map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* colored top bar for visual variety */}
                  <div className={`h-1.5 ${p.product_quantity > 10 ? "bg-emerald-500" : p.product_quantity > 0 ? "bg-amber-400" : "bg-red-400"}`} />

                  <div className="p-5">
                    {/* product icon + name */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package size={18} className="text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{p.product_name}</h3>
                        <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">
                          {p.product_description || "No description"}
                        </p>
                      </div>
                    </div>

                    {/* info grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Price</p>
                        <p className="text-gray-800 font-bold text-sm mt-0.5">₹{Number(p.price).toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Stock</p>
                        <p className={`font-bold text-sm mt-0.5 ${p.product_quantity > 10 ? "text-emerald-600" : p.product_quantity > 0 ? "text-amber-500" : "text-red-500"}`}>
                          {p.product_quantity} units
                        </p>
                      </div>
                      {p.category_name && (
                        <div className="col-span-2 bg-gray-50 rounded-xl p-2.5">
                          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Category</p>
                          <p className="text-gray-700 text-sm mt-0.5">{p.category_name}</p>
                        </div>
                      )}
                    </div>

                    {/* status + actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${p.product_quantity > 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                        }`}>
                        {p.product_quantity > 0 ? "Active" : "Out of Stock"}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => navigate(`/vendor/products/edit/${p.id}`)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => navigate(`/product/${p.id}`)}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                          title="View on site"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
           TAB: MY ORDERS (as a buyer from other vendors)
      ═══════════════════════════════════════════════ */}
      {activeTab === "my-orders" && (
        <div>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-800">My Orders</h2>
            <p className="text-gray-500 text-sm mt-0.5">Orders you placed as a buyer from other vendors</p>
          </div>

          {ordersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
            </div>
          ) : myOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
              <ClipboardList className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-gray-600 font-bold">No orders placed yet</p>
              <p className="text-gray-400 text-sm mt-1">Browse products and place your first order</p>
              <Link
                to="/"
                className="mt-4 bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition font-semibold"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map(order => (
                <div
                  key={order.order_id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* order header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-500 font-mono">Order #{order.order_id}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.order_date).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <OrderStatusBadge status={order.order_status} />
                  </div>

                  {/* order items */}
                  <div className="p-5">
                    {order.items.map(item => (
                      <div key={item.item_id} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.product_name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            Qty: {item.quantity} × ₹{Number(item.item_price).toLocaleString()}
                          </p>
                          {item.seller_shop && (
                            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-0.5">
                              <Store size={10} />
                              {item.seller_shop}
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-gray-800 text-sm flex-shrink-0">
                          ₹{Number(item.item_price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}

                    {/* order total */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-500 font-medium">Order Total</span>
                      <span className="font-black text-emerald-700 text-lg">
                        ₹{Number(order.total_price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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