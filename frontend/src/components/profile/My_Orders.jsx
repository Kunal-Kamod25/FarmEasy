import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle, Clock, ChevronRight, MapPin, Calendar, CreditCard } from "lucide-react";

const My_Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching orders
        setTimeout(() => {
            const mockOrders = [
                {
                    _id: "ORD-2024-8891",
                    createdAt: new Date(Date.now() - 86400000 * 2),
                    shippingAddress: { city: "Mumbai", state: "Maharashtra" },
                    orderItems: [
                        {
                            name: "Organic Fertilizer",
                            image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=200",
                            price: 450,
                            quantity: 2
                        },
                    ],
                    totalPrice: 900,
                    status: "Delivered",
                    isPaid: true,
                },
                {
                    _id: "ORD-2024-9210",
                    createdAt: new Date(Date.now() - 86400000),
                    shippingAddress: { city: "Pune", state: "Maharashtra" },
                    orderItems: [
                        {
                            name: "Premium Wheat Seeds",
                            image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=200",
                            price: 1200,
                            quantity: 1
                        },
                    ],
                    totalPrice: 1200,
                    status: "In Transit",
                    isPaid: true,
                },
            ];
            setOrders(mockOrders);
            setLoading(false);
        }, 800);
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case "Delivered": return "bg-green-100 text-green-700 border-green-200";
            case "In Transit": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Pending": return "bg-amber-100 text-amber-700 border-amber-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Delivered": return <CheckCircle size={14} />;
            case "In Transit": return <Truck size={14} />;
            case "Pending": return <Clock size={14} />;
            default: return <Package size={14} />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Package size={48} className="text-slate-200 mb-4" />
                <div className="h-4 w-48 bg-slate-100 rounded-full mb-2"></div>
                <div className="h-3 w-32 bg-slate-50 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Order History</h2>
                <span className="text-sm font-medium text-slate-500">{orders.length} orders found</span>
            </div>

            {orders.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {orders.map((order) => (
                        <div key={order._id} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                            {/* Order Header */}
                            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 font-mono text-xs font-bold text-emerald-700">
                                        #{order._id}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <Calendar size={14} />
                                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(order.status)} uppercase tracking-wider`}>
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </div>
                            </div>

                            {/* Order Body */}
                            <div className="p-6 flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1 flex gap-6">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                                        <img src={order.orderItems[0].image} alt={order.orderItems[0].name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-slate-800">{order.orderItems[0].name}</h4>
                                        <p className="text-sm text-slate-500">Quantity: {order.orderItems[0].quantity}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                            <MapPin size={12} />
                                            <span>{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                                    <div className="space-y-0.5 text-right">
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Total Amount</p>
                                        <p className="text-xl font-black text-emerald-700">₹{order.totalPrice}</p>
                                    </div>
                                    <button className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                        <span>View Details</span>
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Package size={24} className="text-slate-300" />
                    </div>
                    <p className="text-slate-800 font-bold text-lg">No orders yet</p>
                    <p className="text-slate-500 text-sm mt-1">When you buy items, they will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default My_Orders;
