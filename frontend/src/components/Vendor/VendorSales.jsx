import React from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell,
} from "recharts";
import { IndianRupee, TrendingUp, ShoppingBag, ArrowUpRight } from "lucide-react";

const salesData = [
    { month: "Jan", revenue: 30000, orders: 18 },
    { month: "Feb", revenue: 45000, orders: 27 },
    { month: "Mar", revenue: 38000, orders: 22 },
    { month: "Apr", revenue: 52000, orders: 31 },
    { month: "May", revenue: 61000, orders: 38 },
    { month: "Jun", revenue: 70000, orders: 45 },
];

const transactions = [
    { id: "#101", customer: "Rahul Sharma", amount: 1200, status: "Completed", date: "23 Jan 2025" },
    { id: "#102", customer: "Priya Verma", amount: 850, status: "Pending", date: "22 Jan 2025" },
    { id: "#103", customer: "Amit Patel", amount: 2400, status: "Completed", date: "21 Jan 2025" },
    { id: "#104", customer: "Sunita Devi", amount: 550, status: "Cancelled", date: "20 Jan 2025" },
];

const VendorSales = () => {
    const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);
    const avgOrderValue = Math.floor(totalRevenue / totalOrders);

    const statusBadge = (status) => {
        const map = {
            Completed: "bg-emerald-50 text-emerald-700",
            Pending: "bg-amber-50 text-amber-700",
            Cancelled: "bg-red-50 text-red-600",
        };
        return map[status] || "bg-gray-100 text-gray-600";
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Sales Overview</h1>
                <p className="text-gray-500 text-sm mt-0.5">Track your revenue and transaction history</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                        <div className="bg-white/20 p-2.5 rounded-xl">
                            <IndianRupee size={20} />
                        </div>
                        <span className="bg-white/20 rounded-lg px-2 py-1 text-xs font-semibold flex items-center gap-1">
                            <ArrowUpRight size={12} /> +8.2%
                        </span>
                    </div>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Total Revenue</p>
                    <h3 className="text-3xl font-bold mt-1">₹{totalRevenue.toLocaleString()}</h3>
                    <p className="text-white/60 text-xs mt-2">Last 6 months</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                        <div className="bg-white/20 p-2.5 rounded-xl">
                            <ShoppingBag size={20} />
                        </div>
                        <span className="bg-white/20 rounded-lg px-2 py-1 text-xs font-semibold flex items-center gap-1">
                            <ArrowUpRight size={12} /> +12%
                        </span>
                    </div>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Total Orders</p>
                    <h3 className="text-3xl font-bold mt-1">{totalOrders}</h3>
                    <p className="text-white/60 text-xs mt-2">Last 6 months</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                        <div className="bg-white/20 p-2.5 rounded-xl">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Avg. Order Value</p>
                    <h3 className="text-3xl font-bold mt-1">₹{avgOrderValue.toLocaleString()}</h3>
                    <p className="text-white/60 text-xs mt-2">Per order</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Revenue Area Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-gray-800">Monthly Revenue</h2>
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold">
                            Last 6 Months
                        </span>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
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
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#16a34a"
                                    strokeWidth={3}
                                    fill="url(#colorRev)"
                                    dot={{ r: 4, fill: "#16a34a" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Orders Bar Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-base font-bold text-gray-800 mb-4">Monthly Orders</h2>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData} barSize={20}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                                />
                                <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                                    {salesData.map((_, idx) => (
                                        <Cell key={idx} fill={idx % 2 === 0 ? "#16a34a" : "#4ade80"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-800">Recent Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="text-left px-6 py-3">Order ID</th>
                                <th className="text-left px-6 py-3">Customer</th>
                                <th className="text-left px-6 py-3">Amount</th>
                                <th className="text-left px-6 py-3">Date</th>
                                <th className="text-left px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-semibold text-gray-800">{t.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-emerald-700 text-xs font-bold">
                                                    {t.customer.charAt(0)}
                                                </span>
                                            </div>
                                            <span className="text-gray-700 font-medium">{t.customer}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">
                                        ₹{t.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{t.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge(t.status)}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default VendorSales;