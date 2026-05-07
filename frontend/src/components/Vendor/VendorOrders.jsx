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

// Status options that a vendor is allowed to set
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
  const [updateMsg, setUpdateMsg] = useState(null); // { type: "success"|"error", text }

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

  const statusStyle = (status) => getOrderStatusClass(status);

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
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusStyle(detail.order_status)}`}>
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

              {/* Status Update Section */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Update Order Status</h3>
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

                {/* Success / Error Message */}
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
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </button>
                {selectedStatus === getDisplayOrderStatus(detail.order_status) && !updateMsg && (
                  <p className="text-xs text-gray-400 text-center">Select a different status to update</p>
                )}
              </div>

              {/* Order Date */}
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
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/vendor/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data || []);
    } catch (error) {
      console.error("Orders fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Called from modal when status is updated — update list in place
  const handleStatusUpdated = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      )
    );
  };

  const normalizedOrders = orders.map((o) => ({
    ...o,
    normalizedStatus: getDisplayOrderStatus(o.status),
  }));

  const totalOrders = normalizedOrders.length;
  const pendingOrders = normalizedOrders.filter(
    (o) => ["Payment Pending", "Order Confirmed", "Processing"].includes(o.normalizedStatus)
  ).length;
  const deliveredOrders = normalizedOrders.filter((o) => o.normalizedStatus === "Delivered").length;
  const cancelledOrders = normalizedOrders.filter((o) => o.normalizedStatus === "Cancelled").length;

  const filteredOrders = normalizedOrders.filter((order) => {
    const s = search.toLowerCase();
    return (
      String(order.id).includes(s) ||
      order.customer_name?.toLowerCase().includes(s) ||
      order.normalizedStatus?.toLowerCase().includes(s)
    );
  });

  const statusBadge = (status) =>
    getOrderStatusClass(status)
      .replace(/border-\S+/g, "")
      .trim();

  return (
    <div className="min-h-screen bg-gray-50 px-6 pb-6 space-y-6">
      {/* HEADER */}
      <div className="sticky top-0 z-30 -mx-6 px-6 py-4 bg-gray-50/80 backdrop-blur-md border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">
            View and manage orders containing your products
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: totalOrders, icon: ShoppingCart, gradient: "from-emerald-500 to-green-600" },
          { label: "Active", value: pendingOrders, icon: Clock, gradient: "from-amber-500 to-orange-500" },
          { label: "Delivered", value: deliveredOrders, icon: CheckCircle, gradient: "from-blue-500 to-cyan-500" },
          { label: "Cancelled", value: cancelledOrders, icon: XCircle, gradient: "from-red-500 to-rose-500" },
        ].map(({ label, value, icon: Icon, gradient }) => (
          <div key={label} className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}>
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
        {/* Search */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Customer Orders</h2>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, customer, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-64 transition-all"
            />
          </div>
        </div>

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
              {search ? "Try adjusting your search" : "Orders from customers will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Order ID</th>
                  <th className="text-left px-6 py-3">Customer</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
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
                      ₹{Number(order.total_amount).toLocaleString()}
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
                      <button
                        onClick={() => setSelectedOrderId(order.id)}
                        title="View & Manage Order"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-lg transition"
                      >
                        <Eye size={13} />
                        Manage
                      </button>
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
              Showing {filteredOrders.length} of {totalOrders} orders
            </p>
          </div>
        )}
      </div>

      {/* ORDER DETAIL MODAL */}
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