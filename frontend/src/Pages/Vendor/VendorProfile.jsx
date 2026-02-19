import React from "react";
import { User, MapPin, Phone, Mail, Camera } from "lucide-react";

const VendorProfile = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Vendor Profile
                </h2>
                <p className="text-sm text-gray-500">
                    Manage your store information and contact details
                </p>
            </div>

            {/* Main Profile Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 max-w-4xl">

                {/* Profile Header Section */}
                <div className="flex items-center gap-6 mb-8">

                    {/* Profile Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <User size={40} />
                        </div>

                        <button className="absolute bottom-0 right-0 bg-white border border-gray-200 p-1 rounded-full shadow-sm hover:bg-gray-50 transition">
                            <Camera size={16} />
                        </button>
                    </div>

                    {/* Store Info */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                            Green Farm Store
                        </h3>
                        <p className="text-sm text-gray-500">
                            Organic & Agricultural Products
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <form className="space-y-6">

                    {/* Vendor Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vendor Name
                        </label>
                        <div className="relative">
                            <User
                                size={18}
                                className="absolute left-3 top-2.5 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Enter vendor name"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                        </label>
                        <div className="relative">
                            <MapPin
                                size={18}
                                className="absolute left-3 top-2.5 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Enter business address"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone
                                    size={18}
                                    className="absolute left-3 top-2.5 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Enter phone number"
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-3 top-2.5 text-gray-400"
                                />
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                                />
                            </div>
                        </div>

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
                            className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition shadow-md"
                        >
                            Update Profile
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default VendorProfile;
