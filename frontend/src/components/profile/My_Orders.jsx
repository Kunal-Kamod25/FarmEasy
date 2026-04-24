import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL, getImageUrl } from '../../config';
import { useNavigate } from "react-router-dom";
import {
    Package, Truck, CheckCircle, Clock, ChevronRight,
    MapPin, Calendar, AlertCircle, Store, Search, X, ChevronDown
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
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const toggleDetails = (orderId) => {
        setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
    };

    const token = localStorage.getItem("token");

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const userId = user?.id;

            if (!userId) {
                setError("Please login to view orders");
                return;
            }

            const res = await axios.get(`${API_URL}/api/orders/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOrders(res.data || []);
        } catch (err) {
            console.error("Orders fetch error:", err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const stats = {
        total: orders.length,
        inProgress: orders.filter(o => ["pending", "processing", "shipped", "in transit"].includes((o.order_status || o.status || "").toLowerCase())).length,
        completed: orders.filter(o => (o.order_status || o.status || "").toLowerCase() === "delivered").length,
    };

    const filteredOrders = orders
        .filter(order => {
            const status = (order.order_status || order.status || "").toLowerCase();
            if (activeTab === "in-progress") return ["pending", "processing", "shipped", "in transit"].includes(status);
            if (activeTab === "completed") return status === "delivered";
            if (activeTab === "cancelled") return status === "cancelled";
            return true;
        })
        .filter(order => {
            const idMatch = String(order.id || order.order_id).includes(searchTerm);
            const itemMatch = (order.items || []).some(item => 
                (item.product_name || "").toLowerCase().includes(searchTerm.toLowerCase())
            );
            return idMatch || itemMatch;
        });

    const getStatusIcon = (status) => {
        const s = getDisplayOrderStatus(status).toLowerCase();
        if (s === "delivered") return <CheckCircle size={14} />;
        if (["shipped", "in transit"].includes(s)) return <Truck size={14} />;
        if (s === "processing") return <Package size={14} />;
        if (s === "cancelled") return <X size={14} />;
        return <Clock size={14} />;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10">
                <div className="relative">
                    <Package size={48} className="text-emerald-500/50 animate-bounce" />
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                </div>
                <p className="text-white/60 font-medium mt-4 animate-pulse">Fetching your orders...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white/50">Total Orders</p>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400">
                        <Truck size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white/50">In Progress</p>
                        <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
                    </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white/50">Completed</p>
                        <p className="text-2xl font-bold text-white">{stats.completed}</p>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 self-start">
                    {["all", "in-progress", "completed", "cancelled"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                                activeTab === tab
                                    ? "bg-emerald-500 text-white shadow-lg"
                                    : "text-white/40 hover:text-white/70"
                            }`}
                        >
                            {tab.replace("-", " ")}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search order ID or product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-white/20"
                    />
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
                <div className="space-y-6">
                    {filteredOrders.map((order) => (
                        <div key={order.id || order.order_id} className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-xl">
                            
                            {/* Order Header */}
                            <div className="px-6 py-5 bg-white/5 flex flex-wrap items-center justify-between gap-4 border-b border-white/5">
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">Order ID</p>
                                        <p className="text-sm font-mono font-black text-emerald-400">#ORD-{order.id || order.order_id}</p>
                                    </div>
                                    <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />
                                    <div className="hidden sm:block">
                                        <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">Placed On</p>
                                        <p className="text-sm font-semibold text-white/70">
                                            {new Date(order.order_date || order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors ${
                                        (order.order_status || order.status || "").toLowerCase() === 'delivered' 
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    }`}>
                                        {getStatusIcon(order.order_status || order.status)}
                                        {getDisplayOrderStatus(order.order_status || order.status)}
                                    </div>
                                    <button
                                        onClick={() => navigate(`/track-order/${order.id || order.order_id}`)}
                                        className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
                                        title="Track Order"
                                    >
                                        <MapPin size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Order Content */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Items Section */}
                                    <div className="lg:col-span-7 space-y-4">
                                        {(order.items || order.orderItems || []).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                                                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/10 group/img">
                                                    {item.product_image ? (
                                                        <img
                                                            src={getImageUrl(item.product_image)}
                                                            alt={item.product_name || item.name}
                                                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <Package size={24} className="text-white/20" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-white text-base leading-tight">
                                                        {item.product_name || item.name}
                                                    </h4>
                                                    <div className="flex items-center gap-4 mt-1.5 text-sm">
                                                        <span className="text-white/40">Qty: <span className="text-white/80 font-bold">{item.quantity}</span></span>
                                                        <span className="text-white/40">Price: <span className="text-emerald-400 font-bold">₹{Number(item.price || item.item_price).toLocaleString()}</span></span>
                                                    </div>
                                                    {item.seller_shop && (
                                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 bg-emerald-500/10 rounded-md border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
                                                            <Store size={10} />
                                                            {item.seller_shop}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Payment & Summary Section */}
                                    <div className="lg:col-span-5 flex flex-col justify-between">
                                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-white/30 uppercase tracking-wider">Payment Method</span>
                                                <span className="text-sm font-black text-white/70 uppercase">{order.payment?.method || "Cash On Delivery"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-white/30 uppercase tracking-wider">Payment Status</span>
                                                <span className={`text-sm font-black uppercase ${order.payment?.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                    {order.payment?.status || "Pending"}
                                                </span>
                                            </div>
                                            <div className="h-px bg-white/10 my-2" />
                                            <div className="flex items-center justify-between">
                                                <span className="text-base font-bold text-white">Total Amount</span>
                                                <span className="text-2xl font-black text-emerald-400">₹{Number(order.total_price || order.totalPrice).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={() => toggleDetails(order.id || order.order_id)}
                                                className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold text-white border border-white/10 transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>{expandedOrders[order.id || order.order_id] ? "Hide Details" : "Detailed View"}</span>
                                                <ChevronDown size={18} className={`transition-transform duration-300 ${expandedOrders[order.id || order.order_id] ? "rotate-180" : ""}`} />
                                            </button>
                                            <button className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                                                Buy Again
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedOrders[order.id || order.order_id] && (
                                    <div className="mt-8 pt-8 border-t border-white/10 space-y-8 animate-in slide-in-from-top-4 duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h5 className="text-sm font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                                    <MapPin size={16} className="text-emerald-500" /> Shipping Address
                                                </h5>
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-white/70 text-sm leading-relaxed font-medium">
                                                    {order.shipping_address || "Standard Home Delivery Address"}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h5 className="text-sm font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                                    <Package size={16} className="text-emerald-500" /> Order Timeline
                                                </h5>
                                                <div className="space-y-4 pl-2">
                                                    <div className="relative pl-6 border-l-2 border-emerald-500/30 pb-2">
                                                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
                                                        <p className="text-sm font-bold text-white">Order Placed</p>
                                                        <p className="text-xs text-white/40">{new Date(order.order_date || order.createdAt).toLocaleString()}</p>
                                                    </div>
                                                    <div className="relative pl-6 border-l-2 border-white/5">
                                                        <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white/10 border-2 border-white/20 rounded-full" />
                                                        <p className="text-sm font-bold text-white/50">Estimated Delivery</p>
                                                        <p className="text-xs text-white/20">Usually within 3-5 business days</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10 backdrop-blur-sm">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        <Package size={40} className="text-white/40" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Your field is empty!</h3>
                    <p className="text-white/50 text-base max-w-sm mx-auto mb-8 font-medium">
                        Looks like you haven't harvested any orders yet. Start shopping to fill this space!
                    </p>
                    <button 
                        onClick={() => navigate("/products")}
                        className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-sm font-black text-white shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
                    >
                        Browse Products
                    </button>
                </div>
            )}
        </div>
    );
};

export default My_Orders;
