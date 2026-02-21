import {
    User, Mail, Phone, MapPin, Camera,
    Save, Shield,
    Map, Home, Bookmark, CheckCircle
} from "lucide-react";
import My_Orders from "./My_Orders";

const ProfileContent = ({
    activeTab,
    user,
    formData,
    isEditing,
    setIsEditing,
    loading,
    message,
    handleInputChange,
    handleSave
}) => {

    return (
        <main className="flex-1">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">

                {/* Tab Header */}
                <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 capitalize">
                            {activeTab === "profile" ? "Profile" : activeTab.replace("-", " ")}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            {activeTab === "profile" && "Personal information and contact details"}
                            {activeTab === "orders" && "Tracking and history of your orders"}
                            {activeTab === "security" && "Manage your account security settings"}
                        </p>
                    </div>
                    {activeTab === "profile" && (
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${isEditing
                                ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                : "bg-emerald-600 text-white shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:shadow-emerald-200"
                                }`}
                        >
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </button>
                    )}
                </div>

                <div className="p-10">

                    {/* Messages */}
                    {message.text && (
                        <div className={`mb-8 p-5 rounded-2xl flex items-center gap-3 border ${message.type === "success"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                            : "bg-red-50 text-red-800 border-red-100"
                            }`}>
                            {message.type === "success"
                                ? <CheckCircle size={20} className="text-emerald-600" />
                                : <Shield size={20} className="text-red-600" />
                            }
                            <p className="text-sm font-bold">{message.text}</p>
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === "profile" && (
                        <div className="space-y-12">

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                                        Member Since
                                    </p>
                                    <p className="text-lg font-black text-slate-800">
                                        {user.created_at
                                            ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                            : "Feb 2024"}
                                    </p>
                                </div>

                                <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                                        Total Orders
                                    </p>
                                    <p className="text-lg font-black text-slate-800">
                                        12 Completed
                                    </p>
                                </div>

                                <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                                        Verified Status
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-lg font-black text-emerald-600">Verified</p>
                                        <div className="bg-emerald-100 p-1 rounded-full">
                                            <CheckCircle size={14} className="text-emerald-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSave} className="space-y-10">

                                {/* Personal Info */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <User size={16} />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                                            Personal Information
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                        <div className="space-y-2.5">
                                            <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-wider">
                                                Full Name
                                            </label>
                                            <input
                                                name="fullname"
                                                type="text"
                                                value={formData.fullname}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl disabled:opacity-60"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-wider">
                                                Email
                                            </label>
                                            <input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-wider">
                                                Phone
                                            </label>
                                            <input
                                                name="phone"
                                                type="text"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl disabled:opacity-60"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-wider">
                                                Bio
                                            </label>
                                            <input
                                                name="bio"
                                                type="text"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl disabled:opacity-60"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {isEditing && (
                                    <div className="pt-6 flex justify-end gap-5">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-8 py-3.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-100"
                                        >
                                            Discard Changes
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-10 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold"
                                        >
                                            {loading ? "Saving..." : "Save Profile"}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === "orders" && <My_Orders />}

                    {/* SECURITY TAB */}
                    {activeTab === "security" && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-slate-800">
                                Security Settings
                            </h3>
                            <p className="text-sm text-slate-500">
                                Your account security is important.
                            </p>
                            <button className="px-8 py-4 border border-red-200 text-red-600 rounded-2xl font-bold">
                                Delete Account
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ProfileContent;