import React from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";

const VendorProducts = () => {
    return (
        <div className="p-6 bg-gray-50 min-h-screen">

            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        My Products
                    </h2>
                    <p className="text-sm text-gray-500">
                        Manage and update your product listings
                    </p>
                </div>

                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition">
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            {/* Main Card */}
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
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                        />
                    </div>

                    <span className="text-sm text-gray-500">
                        1 Product
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 uppercase text-xs tracking-wider border-b">
                                <th className="text-left py-3">Product</th>
                                <th className="text-left py-3">Price</th>
                                <th className="text-left py-3">Stock</th>
                                <th className="text-left py-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            <tr className="hover:bg-gray-200 transition">
                                <td className="py-4 font-medium text-gray-800">
                                    Urea Fertilizer
                                </td>

                                <td className="py-4 text-gray-600">
                                    ₹ 500
                                </td>

                                <td className="py-4">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-600">
                                        In Stock
                                    </span>
                                </td>

                                <td className="py-4">
                                    <div className="flex items-center gap-3">

                                        <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                                            <Edit size={18} />
                                        </button>

                                        <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                                            <Trash2 size={18} />
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default VendorProducts;
