import React from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const salesData = [
    { month: "Jan", revenue: 30000 },
    { month: "Feb", revenue: 45000 },
    { month: "Mar", revenue: 38000 },
    { month: "Apr", revenue: 52000 },
    { month: "May", revenue: 61000 },
    { month: "Jun", revenue: 70000 },
];

const VendorSales = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6 space-y-6">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800">
                    Sales Dashboard
                </h2>
                <p className="text-sm text-gray-500">
                    Overview of your revenue and transactions
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-black font-semibold">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-white">
                        ₹ 2,10,000
                    </h3>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-black font-semibold">Total Orders</p>
                    <h3 className="text-2xl font-bold text-white">
                        132
                    </h3>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-black font-semibold">Average Order Value</p>
                    <h3 className="text-2xl font-bold text-white">
                        ₹ 1,590
                    </h3>
                </div>

            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">
                    Monthly Revenue
                </h3>

                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#16a34a"
                                strokeWidth={3}
                                dot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">
                    Recent Transactions
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 uppercase text-xs tracking-wider border-b">
                                <th className="text-left py-3">Order ID</th>
                                <th className="text-left py-3">Customer</th>
                                <th className="text-left py-3">Amount</th>
                                <th className="text-left py-3">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            <tr className="hover:bg-gray-50 transition">
                                <td className="py-4 font-medium">#101</td>
                                <td className="py-4">Rahul Sharma</td>
                                <td className="py-4 text-green-600 font-semibold">
                                    ₹ 1,200
                                </td>
                                <td className="py-4">
                                    <span className="px-3 py-1 text-xs rounded-full bg-green-50 text-green-600">
                                        Completed
                                    </span>
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition">
                                <td className="py-4 font-medium">#102</td>
                                <td className="py-4">Priya Verma</td>
                                <td className="py-4 text-green-600 font-semibold">
                                    ₹ 850
                                </td>
                                <td className="py-4">
                                    <span className="px-3 py-1 text-xs rounded-full bg-yellow-50 text-yellow-600">
                                        Pending
                                    </span>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default VendorSales;
