import React from "react";
import { Search, Eye } from "lucide-react";

const VendorOrders = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Orders
                </h2>
                <p className="text-sm text-gray-500">
                    Manage and track customer orders
                </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

                <div
                    className="bg-gradient-to-r hover:shadow-lg transition from-blue-500 to-cyan-500 p-6 rounded-xl shadow-md text-white">
                    <p className="text-sm text-white font-bold">Total Orders</p>
                    <h3 className="text-xl font-bold text-white">24</h3>
                </div>

                <div className="bg-gradient-to-r hover:shadow-lg transition from-orange-500 to-red-500 p-6 rounded-xl shadow-sm border hover:shadow-lg transition border-gray-100">
                    <p className="text-sm text-white font-bold">Pending</p>
                    <h3 className="text-xl font-bold text-white">5</h3>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-red-500 p-4 rounded-xl shadow-sm border hover:shadow-lg transition border-gray-100">
                    <p className="text-sm text-white font-bold">Delivered</p>
                    <h3 className="text-xl font-bold text-white">19</h3>
                </div>

            </div>

            {/* Orders Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">

                {/* Search Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative w-72">
                        <Search
                            size={18}
                            className="absolute left-3 top-2.5 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search by Order ID..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                        />
                    </div>

                    <span className="text-sm text-gray-500">
                        Showing 3 of 24 orders
                    </span>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 uppercase text-xs tracking-wider border-b">
                                <th className="text-left py-3">Order ID</th>
                                <th className="text-left py-3">Customer</th>
                                <th className="text-left py-3">Amount</th>
                                <th className="text-left py-3">Status</th>
                                <th className="text-left py-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            <tr className="hover:bg-gray-200 transition">
                                <td className="py-4 font-medium text-gray-800">
                                    #101
                                </td>
                                <td className="py-4 text-gray-600">
                                    Rahul Sharma
                                </td>
                                <td className="py-4 text-gray-600">
                                    ₹ 1,200
                                </td>
                                <td className="py-4">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-600">
                                        Delivered
                                    </span>
                                </td>
                                <td className="py-4">
                                    <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-200 transition">
                                <td className="py-4 font-medium text-gray-800">
                                    #102
                                </td>
                                <td className="py-4 text-gray-600">
                                    Priya Verma
                                </td>
                                <td className="py-4 text-gray-600">
                                    ₹ 850
                                </td>
                                <td className="py-4">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-50 text-yellow-600">
                                        Pending
                                    </span>
                                </td>
                                <td className="py-4">
                                    <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-200 transition">
                                <td className="py-4 font-medium text-gray-800">
                                    #103
                                </td>
                                <td className="py-4 text-gray-600">
                                    Amit Kumar
                                </td>
                                <td className="py-4 text-gray-600">
                                    ₹ 2,400
                                </td>
                                <td className="py-4">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-600">
                                        Cancelled
                                    </span>
                                </td>
                                <td className="py-4">
                                    <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default VendorOrders;
