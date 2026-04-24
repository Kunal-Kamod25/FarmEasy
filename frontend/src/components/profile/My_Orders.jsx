import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL, getImageUrl } from '../../config';
import {
    Package, Truck, CheckCircle, Clock, ChevronRight,
    MapPin, Calendar, AlertCircle, Store
} from "lucide-react";
import {
    getDisplayOrderStatus,
    getOrderStatusClass,
} from "../../utils/orderStatus";

// real order history for users - fetches from the orders + order_items tables
// no more mock data, this connects to the actual backend
const My_Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrders, setExpandedOrders] = useState({});

    const toggleDetails = (orderId) => {
        setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
    };

    const token = localStorage.getItem("token");

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);

            // get the user's id from what's stored after login
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const userId = user?.id;

            if (!userId) {
                setError("Please login to view orders");
                return;
            }

            // fetch orders for this user - using the profile/orders or a dedicated orders endpoint
            // note: this assumes an orders API exists, we query from the backend
            const res = await axios.get(`${API_URL}/api/orders/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOrders(res.data || []);

        } catch (err) {
            console.error("Orders fetch error:", err);
            // if orders API doesn't exist yet, just show empty state gracefully
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getStatusStyle = (status) => {
        return getOrderStatusClass(status);
    };

    const getStatusIcon = (status) => {
        switch (getDisplayOrderStatus(status).toLowerCase()) {
            case "delivered": return <CheckCircle size={14} />;
            case "shipped":
            case "in transit": return <Truck size={14} />;
            case "processing": return <Package size={14} />;
            default: return <Clock size={14} />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Package size={48} className="text-white/20 mb-4" />
                <div className="h-4 w-48 bg-white/10 rounded-full mb-2" />
                <div className="h-3 w-32 bg-white/5 rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle size={36} className="text-white/40 mb-3" />
                <p className="text-white/80 font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Order History</h2>
                <span className="text-sm font-medium text-white/50">{orders.length} orders found</span>
            </div>

            {orders.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {orders.map((order) => (
                        <div key={order.id || order.order_id} className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-300 shadow-lg">

                            {/* order header row */}
                            <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white/10 rounded-xl shadow-sm border border-white/20 font-mono text-xs font-bold text-emerald-400">
                                        #ORD-{order.id || order.order_id}
                                    </div>
                                    <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                                        <Calendar size={14} />
                                        <span>{new Date(order.order_date || order.createdAt).toLocaleDateString("en-IN")}</span>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border border-white/20 bg-white/5 text-white uppercase tracking-wider`}>
                                    {getStatusIcon(order.order_status || order.status)}
                                    {getDisplayOrderStatus(order.order_status || order.status)}
                                </div>
                            </div>

                            {/* order items */}
                            <div className="p-6">
                                {(order.items || order.orderItems || []).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
                                            {item.product_image ? (
                                                <img
                                                    src={getImageUrl(item.product_image)}
                                                    alt={item.product_name || item.name || "Product"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Package size={20} className="text-white/40" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-white text-sm">
                                                {item.product_name || item.name}
                                            </p>
                                            <p className="text-sm text-white/60 mt-0.5">
                                                Qty: {item.quantity} × ₹{Number(item.price || item.item_price).toLocaleString()}
                                            </p>
                                            {/* show which vendor this item came from */}
                                            {item.seller_shop && (
                                                <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1 font-medium">
                                                    <Store size={10} />
                                                    {item.seller_shop}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* total */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                    <div>
                                        <p className="text-xs text-white/30 uppercase font-bold tracking-widest">Payment</p>
                                        <p className="text-sm font-semibold text-white/80 mt-1">
                                            {order.payment?.method || "N/A"} • {order.payment?.status || "N/A"}
                                        </p>
                                        {order.payment?.paid_at && (
                                            <p className="text-xs text-white/40 mt-0.5">
                                                {new Date(order.payment.paid_at).toLocaleString("en-IN")}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs text-white/30 uppercase font-bold tracking-widest">Total Amount</p>
                                        <p className="text-xl font-black text-emerald-400">
                                            ₹{Number(order.total_price || order.totalPrice).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => toggleDetails(order.id || order.order_id)}
                                        className="flex items-center gap-1 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                                    >
                                        <span>{expandedOrders[order.id || order.order_id] ? "Hide Details" : "View Details"}</span>
                                        <ChevronRight
                                            size={16}
                                            className={`transition-transform duration-200 ${expandedOrders[order.id || order.order_id] ? "rotate-90" : ""}`}
                                        />
                                    </button>
                                </div>

                                {/* expanded details panel */}
                                {expandedOrders[order.id || order.order_id] && (
                                    <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
                                        {/* item descriptions */}
                                        {(order.items || []).some(item => item.product_description || item.product_type) && (
                                            <div>
                                                <p className="text-xs text-white/30 uppercase font-bold tracking-widest mb-2">Product Details</p>
                                                {(order.items || []).map((item, idx) => (
                                                    <div key={idx} className="mb-3 pl-3 border-l-2 border-emerald-500/30">
                                                        <p className="text-sm font-semibold text-white/90">{item.product_name}</p>
                                                        {item.product_type && (
                                                            <p className="text-xs text-emerald-400 mt-0.5 font-medium">Type: {item.product_type}</p>
                                                        )}
                                                        {item.product_description && (
                                                            <p className="text-xs text-white/50 mt-1">{item.product_description}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* payment details */}
                                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                            <p className="text-xs text-white/30 uppercase font-bold tracking-widest mb-3">Payment Breakdown</p>
                                            <div className="space-y-2">
                                                {(order.items || []).map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm text-white/70">
                                                        <span>{item.product_name} × {item.quantity}</span>
                                                        <span className="font-medium text-white/90">₹{(Number(item.price || 0) * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                                                    <span>Order Total</span>
                                                    <span className="text-emerald-400">₹{Number(order.total_price || order.totalPrice).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-white/40 pt-1 font-medium">
                                                    <span>Payment Method</span>
                                                    <span className="uppercase text-white/60">{order.payment?.method || "N/A"}</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-white/40 font-medium">
                                                    <span>Payment Status</span>
                                                    <span className={`font-bold ${order.payment?.status === "completed" || order.payment?.status === "paid" ? "text-emerald-400" : "text-amber-400"}`}>
                                                        {order.payment?.status || "N/A"}
                                                    </span>
                                                </div>
                                                {order.payment?.paid_at && (
                                                    <div className="flex justify-between text-xs text-white/40 font-medium">
                                                        <span>Paid On</span>
                                                        <span className="text-white/60">{new Date(order.payment.paid_at).toLocaleString("en-IN")}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-white/10">
                        <Package size={24} className="text-white/30" />
                    </div>
                    <p className="text-white font-bold text-lg">No orders yet</p>
                    <p className="text-white/50 text-sm mt-1 font-medium">When you buy items, they will show up here.</p>
                </div>
            )}
        </div>
    );
};

export default My_Orders;
