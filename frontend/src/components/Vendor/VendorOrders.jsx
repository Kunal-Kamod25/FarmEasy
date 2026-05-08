import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Search, Eye, ShoppingCart, Clock, CheckCircle, XCircle,
  X, Package, User, Phone, Mail, CreditCard, ChevronDown, Loader2
} from "lucide-react";
import { API_URL } from "../../config";
import {
  ORDER_STATUS_PRIORITY,
  getDisplayOrderStatus,
  getOrderStatusClass,
} from "../../utils/orderStatus";

// Statuses a vendor is allowed to set
const VENDOR_ALLOWED_STATUSES = [
  "Order Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

// ─── ORDER DETAIL MODAL ───────────────────────────────────────────────────────
const OrderDetailModal = ({ orderId, token, onClose, onStatusUpdated }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/vendor/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDetail(res.data);
        setSelectedStatus(getDisplayOrderStatus(res.data.order_status));
      } catch (err) {
        console.error("Order detail fetch error:", err);
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchDetail();
  }, [orderId, token]);

  const handleUpdateStatus = async () => {
    if (!selectedStatus || !detail) return;
    try {
      setUpdating(true);
      setUpdateMsg(null);
      await axios.put(
        `${API_URL}/api/orders/${orderId}/status`,
        { status: selectedStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetail((prev) => ({ ...prev, order_status: selectedStatus }));
      setUpdateMsg({ type: "success", text: `Status updated to "${selectedStatus}" successfully!` });
      onStatusUpdated(orderId, selectedStatus);
    } catch (err) {
      console.error("Status update error:", err);
      setUpdateMsg({
        type: "error",
        text: err?.response?.data?.message || "Failed to update status. Please try again.",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">

        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order #{orderId}</h2>
            <p className="text-sm text-gray-500 mt-0.5">View details & update order status</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-emerald-500" size={36} />
              <p className="text-gray-500 text-sm">Loading order details...</p>
            </div>
          ) : !detail ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <XCircle className="text-red-400" size={36} />
              <p className="text-gray-600 font-semibold">Order details not found</p>
              <p className="text-gray-400 text-sm">This order may not contain your products</p>
            </div>
          ) : (
            <>
              {/* Current Status Badge */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 font-medium">Current Status:</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getOrderStatusClass(detail.order_status)}`}>
                  {getDisplayOrderStatus(detail.order_status)}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User size={15} className="text-emerald-500 flex-shrink-0" />
                    <span className="font-medium">{detail.customer_name || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail size={15} className="text-blue-500 flex-shrink-0" />
                    <span>{detail.customer_email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone size={15} className="text-purple-500 flex-shrink-0" />
                    <span>{detail.customer_phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CreditCard size={15} className="text-amber-500 flex-shrink-0" />
                    <span>{detail.payment_method || "—"}</span>
                    {detail.payment_status && (
                      <span className={`ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        detail.payment_status === "Paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {detail.payment_status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Your Products in this Order
                </h3>
                <div className="space-y-3">
                  {detail.items.map((item) => (
                    <div key={item.item_id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-emerald-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{item.product_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-800 text-sm">
                          ₹{(item.item_price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">₹{item.item_price} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-3 flex items-center justify-between px-3 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-sm font-semibold text-emerald-800">Order Total</span>
                  <span className="text-lg font-bold text-emerald-700">
                    ₹{Number(detail.total_price).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* ── STATUS UPDATE SECTION ── */}
              <div className="border-2 border-emerald-100 rounded-xl p-4 space-y-3 bg-emerald-50/30">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  🔄 Update Order Status
                </h3>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => { setSelectedStatus(e.target.value); setUpdateMsg(null); }}
                    className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  >
                    {VENDOR_ALLOWED_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>

                {updateMsg && (
                  <div className={`text-sm px-4 py-2.5 rounded-xl font-medium ${
                    updateMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {updateMsg.text}
                  </div>
                )}

                <button
                  onClick={handleUpdateStatus}
                  disabled={updating || selectedStatus === getDisplayOrderStatus(detail.order_status)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <><Loader2 size={15} className="animate-spin" /> Updating...</>
                  ) : (
                    "Update Status"
                  )}
                </button>
                {selectedStatus === getDisplayOrderStatus(detail.order_status) && !updateMsg && (
                  <p className="text-xs text-gray-400 text-center">Select a different status to update</p>
                )}
              </div>

              <p className="text-xs text-gray-400 text-right">
                Ordered on:{" "}
                {detail.order_date
                  ? new Date(detail.order_date).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })
                  : "—"}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const VendorOrders = () => {
  const [orders, setOrders] = useState([]);       // customer orders for vendor's products
  const [myOrders, setMyOrders] = useState([]);   // orders placed BY this vendor as buyer
  const [search, setSearch] = useState("");
  const [orderTab, setOrderTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.id;

      const [ordersRes] = await Promise.all([
        axios.get(`${API_URL}/api/vendor/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let myOrdersRes = { data: [] };
      if (userId) {
        myOrdersRes = await axios
          .get(`${API_URL}/api/orders/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: [] }));
      }

      setOrders(ordersRes.data || []);
      setMyOrders(myOrdersRes.data || []);
    } catch (error) {
      console.error("Orders fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update status in the orders list after modal update
  const handleStatusUpdated = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // ── Normalize vendor (customer) orders ──
  const normalizedVendorOrders = orders.map((o) => ({
    ...o,
    orderSource: "Orders",
    normalizedStatus: getDisplayOrderStatus(o.status),
  }));

  // ── Normalize "my purchases" (vendor as buyer) ──
  const normalizedMyOrders = myOrders.map((o) => {
    const items = o.items || o.orderItems || [];
    const sellerNames = [
      ...new Set(items.map((item) => item?.seller_shop).filter(Boolean)),
    ];
    return {
      ...o,
      id: o.id || o.order_id,
      customer_name: sellerNames.length ? sellerNames.join(", ") : "Various Sellers",
      total_amount: o.total_amount || o.total_price || o.totalPrice || 0,
      created_at: o.created_at || o.order_date || o.createdAt,
      orderSource: "My Orders",
      normalizedStatus: getDisplayOrderStatus(o.order_status || o.status),
    };
  });

  // ── Merge based on active tab ──
  const allCombined =
    orderTab === "Orders"
      ? normalizedVendorOrders
      : orderTab === "My Orders"
      ? normalizedMyOrders
      : [...normalizedVendorOrders, ...normalizedMyOrders].sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );

  // ── Stats (always from combined "All") ──
  const allForStats = [...normalizedVendorOrders, ...normalizedMyOrders];
  const totalOrders = allForStats.length;
  const pendingOrders = allForStats.filter((o) =>
    ["Payment Pending", "Order Confirmed", "Processing", "Payment Confirmed"].includes(o.normalizedStatus)
  ).length;
  const deliveredOrders = allForStats.filter((o) => o.normalizedStatus === "Delivered").length;
  const cancelledOrders = allForStats.filter((o) => o.normalizedStatus === "Cancelled").length;

  // ── Search filter ──
  const filteredOrders = allCombined.filter((order) => {
    const s = search.toLowerCase();
    return (
      String(order.id || "").includes(s) ||
      order.customer_name?.toLowerCase().includes(s) ||
      order.normalizedStatus?.toLowerCase().includes(s) ||
      order.orderSource?.toLowerCase().includes(s)
    );
  });

  const getPartyLabel = () => {
    if (orderTab === "Orders") return "Customer";
    if (orderTab === "My Orders") return "Seller";
    return "Customer / Seller";
  };

  const statusBadge = (status) =>
    getOrderStatusClass(status).replace(/border-\S+/g, "").trim();

  return (
    <div className="min-h-screen bg-gray-50 px-6 pb-6 space-y-6">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-30 -mx-6 px-6 py-4 bg-gray-50/80 backdrop-blur-md border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">
            Manage vendor orders and orders you placed
          </p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: totalOrders, icon: ShoppingCart, gradient: "from-emerald-500 to-green-600" },
          { label: "Active", value: pendingOrders, icon: Clock, gradient: "from-amber-500 to-orange-500" },
          { label: "Delivered", value: deliveredOrders, icon: CheckCircle, gradient: "from-blue-500 to-cyan-500" },
          { label: "Cancelled", value: cancelledOrders, icon: XCircle, gradient: "from-red-500 to-rose-500" },
        // eslint-disable-next-line no-unused-vars
        ].map(({ label, value, icon: Icon, gradient }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
          >
            <div className="bg-white/20 p-2 rounded-xl w-fit mb-3">
              <Icon size={18} />
            </div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{label}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
          </div>
        ))}
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Controls: Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 px-6 pt-4 pb-0">
          {/* ── Tabs ── */}
          <div className="relative -mb-px flex items-end gap-1 rounded-t-[1.25rem] border border-slate-200 bg-slate-100 px-2 pt-2">
            {["All", "Orders", "My Orders"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setOrderTab(tab); setSearch(""); }}
                className={`relative -mb-px px-4 py-2 text-xs font-semibold rounded-t-[1rem] border border-b-0 transition ${
                  orderTab === tab
                    ? "z-10 bg-white text-emerald-700 border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.08)]"
                    : "bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200 hover:text-slate-700"
                }`}
              >
                {tab}
                {/* Badge count */}
                <span className={`ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                  orderTab === tab ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                }`}>
                  {tab === "All"
                    ? allForStats.length
                    : tab === "Orders"
                    ? normalizedVendorOrders.length
                    : normalizedMyOrders.length}
                </span>
              </button>
            ))}
          </div>

          {/* ── Search ── */}
          <div className="relative w-full sm:w-72 mb-1">
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, customer, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full transition-all"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-100 rounded-2xl p-5 mb-4">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search ? "Try adjusting your search" : "Orders will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Order ID</th>
                  <th className="text-left px-6 py-3">{getPartyLabel()}</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Type</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={`${order.orderSource}-${order.id}`} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-800">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-700 text-xs font-bold">
                            {order.customer_name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <span className="text-gray-700 font-medium">{order.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      ₹{Number(order.total_amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                        order.orderSource === "My Orders"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {order.orderSource}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge(order.normalizedStatus)}`}>
                        {order.normalizedStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {/* Manage button only for vendor's customer orders */}
                      {order.orderSource === "Orders" ? (
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          title="View & Manage Order"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-lg transition"
                        >
                          <Eye size={13} />
                          Manage
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 px-2">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {filteredOrders.length} of {allCombined.length} orders
            </p>
          </div>
        )}
      </div>

      {/* ORDER DETAIL MODAL — only for vendor's customer orders */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          token={token}
          onClose={() => setSelectedOrderId(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
};

export default VendorOrders;