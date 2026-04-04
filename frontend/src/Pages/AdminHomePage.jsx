import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import ErrorNotification from "../components/Common/ErrorNotification";

const AdminHomePage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [summary, setSummary] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
    });

    useEffect(() => {
        const fetchSummary = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please login as admin.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/api/admin/dashboard-summary`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setSummary(res.data || {});
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load admin dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    return (
        <div className="max-w-7xl p-6 space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            {error && <ErrorNotification message={error} onClose={() => setError("")} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 shadow-md rounded-lg bg-white">
                    <h2 className="text-sm font-semibold text-slate-500">Total Revenue</h2>
                    <p className="text-2xl font-bold">₹{Number(summary.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 shadow-md rounded-lg bg-white">
                    <h2 className="text-sm font-semibold text-slate-500">Total Orders</h2>
                    <p className="text-2xl font-bold">{Number(summary.totalOrders || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 shadow-md rounded-lg bg-white">
                    <h2 className="text-sm font-semibold text-slate-500">Total Users</h2>
                    <p className="text-2xl font-bold">{Number(summary.totalUsers || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 shadow-md rounded-lg bg-white">
                    <h2 className="text-sm font-semibold text-slate-500">Total Products</h2>
                    <p className="text-2xl font-bold">{Number(summary.totalProducts || 0).toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                    <h2 className="text-lg font-semibold">Recent Orders</h2>
                </div>

                {loading ? (
                    <p className="p-4 text-slate-500">Loading...</p>
                ) : summary.recentOrders?.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="text-left px-4 py-3">Order</th>
                                    <th className="text-left px-4 py-3">Customer</th>
                                    <th className="text-left px-4 py-3">Amount</th>
                                    <th className="text-left px-4 py-3">Status</th>
                                    <th className="text-left px-4 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.recentOrders.map((order) => (
                                    <tr key={order.id} className="border-t border-slate-100">
                                        <td className="px-4 py-3 font-semibold">#{order.id}</td>
                                        <td className="px-4 py-3">{order.customer_name}</td>
                                        <td className="px-4 py-3">₹{Number(order.total_price || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3">{order.order_status}</td>
                                        <td className="px-4 py-3">{new Date(order.order_date).toLocaleString("en-IN")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="p-4 text-slate-500">No recent orders.</p>
                )}
            </div>
        </div>
    );
};

export default AdminHomePage;