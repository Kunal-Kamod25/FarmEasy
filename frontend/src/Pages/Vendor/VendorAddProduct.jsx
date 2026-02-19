import React from "react";
import { Upload } from "lucide-react";

const VendorAddProduct = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">

            {/* Page Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Add New Product
                </h2>
                <p className="text-sm text-gray-500">
                    Fill in the details below to list your product
                </p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 max-w-4xl">

                <form className="space-y-6">

                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter product name"
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                    </div>

                    {/* Price + Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price (₹)
                            </label>
                            <input
                                type="number"
                                placeholder="Enter price"
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none">
                                <option>Select category</option>
                                <option>Fertilizers</option>
                                <option>Seeds</option>
                                <option>Pesticides</option>
                                <option>Tools</option>
                            </select>
                        </div>

                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            rows="4"
                            placeholder="Write product description..."
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Image
                        </label>

                        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition cursor-pointer">
                            <div className="text-center">
                                <Upload className="mx-auto text-gray-400 mb-2" size={28} />
                                <p className="text-sm text-gray-500">
                                    Click to upload product image
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stock Toggle */}
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                Available in Stock
                            </p>
                            <p className="text-xs text-gray-500">
                                Enable if product is ready for sale
                            </p>
                        </div>

                        <input type="checkbox" className="w-5 h-5 accent-green-600" />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4 pt-4">

                        <button
                            type="button"
                            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition shadow"
                        >
                            Add Product
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
};

export default VendorAddProduct;
