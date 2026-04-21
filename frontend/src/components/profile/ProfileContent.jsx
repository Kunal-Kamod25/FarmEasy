import {
    User, Mail, Phone, MapPin, Camera,
    Save, Shield,
    Map, Home, Bookmark, CheckCircle
} from "lucide-react";

const ProfileContent = ({
    activeTab,
    user,
    metrics,
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
            <div className="bg-white/5 rounded-[2rem] shadow-2xl shadow-emerald-950/20 border border-white/10 backdrop-blur-2xl overflow-hidden min-h-[600px]">

                {/* Tab Header */}
                <div className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-2xl font-black text-white capitalize">
                            {activeTab === "profile" ? "Profile" : activeTab.replace("-", " ")}
                        </h2>
                        <p className="text-white/55 text-sm mt-1 font-medium">
                            {activeTab === "profile" && "Personal information and contact details"}
                            {activeTab === "security" && "Manage your account security settings"}
                        </p>
                    </div>
                    {activeTab === "profile" && (
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${isEditing
                                ? "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                                : "bg-emerald-500 text-white shadow-xl shadow-emerald-950/30 hover:bg-emerald-400"
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
                            ? "bg-emerald-400/15 text-emerald-100 border-emerald-300/25"
                            : "bg-rose-400/15 text-rose-100 border-rose-300/25"
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
                                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-sm backdrop-blur-xl">
                                    <p className="text-[10px] font-black text-white/45 uppercase tracking-[0.2em] mb-2">
                                        Member Since
                                    </p>
                                    <p className="text-lg font-black text-white">
                                        {user.created_at
                                            ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                            : "-"}
                                    </p>
                                </div>

                                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-sm backdrop-blur-xl">
                                    <p className="text-[10px] font-black text-white/45 uppercase tracking-[0.2em] mb-2">
                                        Total Orders
                                    </p>
                                    <p className="text-lg font-black text-white">
                                        {Number(metrics?.total_orders || 0)} Total
                                    </p>
                                </div>

                                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-sm backdrop-blur-xl">
                                    <p className="text-[10px] font-black text-white/45 uppercase tracking-[0.2em] mb-2">
                                        Verified Status
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-lg font-black ${metrics?.verification?.profile_verified
                                            ? "text-emerald-200"
                                            : "text-amber-200"
                                            }`}>
                                            {metrics?.verification?.profile_verified ? "Verified" : "Incomplete"}
                                        </p>
                                        <div className={`p-1 rounded-full ${metrics?.verification?.profile_verified
                                            ? "bg-emerald-300/20"
                                            : "bg-amber-300/20"
                                            }`}>
                                            <CheckCircle size={14} className={metrics?.verification?.profile_verified
                                                ? "text-emerald-200"
                                                : "text-amber-200"
                                            } />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSave} className="space-y-10">

                                {/* Personal Info */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-300/20 flex items-center justify-center text-emerald-100">
                                            <User size={16} />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white/45">
                                            Personal Information
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                        <div className="space-y-2.5">
                                            <label className="text-xs font-black text-white/50 ml-1 uppercase tracking-wider">
                                                Full Name
                                            </label>
                                            <input
                                                name="fullname"
                                                type="text"
                                                value={formData.fullname}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full px-5 py-3.5 bg-white/5 text-white border border-white/15 rounded-2xl disabled:opacity-60"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-xs font-black text-white/50 ml-1 uppercase tracking-wider">
                                                Email
                                            </label>
                                            <input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                className="w-full px-5 py-3.5 bg-white/5 border border-white/15 rounded-2xl text-white/55"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-xs font-black text-white/50 ml-1 uppercase tracking-wider">
                                                Phone
                                            </label>
                                            <input
                                                name="phone"
                                                type="text"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full px-5 py-3.5 bg-white/5 text-white border border-white/15 rounded-2xl disabled:opacity-60"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-xs font-black text-white/50 ml-1 uppercase tracking-wider">
                                                Bio
                                            </label>
                                            <input
                                                name="bio"
                                                type="text"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full px-5 py-3.5 bg-white/5 text-white border border-white/15 rounded-2xl disabled:opacity-60"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {isEditing && (
                                    <div className="pt-6 flex justify-end gap-5">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-8 py-3.5 rounded-2xl text-white/70 font-bold hover:bg-white/10"
                                        >
                                            Discard Changes
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-10 py-3.5 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-400"
                                        >
                                            {loading ? "Saving..." : "Save Profile"}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === "security" && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-white">
                                Security Settings
                            </h3>
                            <p className="text-sm text-white/65">
                                Your account security is important.
                            </p>
                            <button className="px-8 py-4 border border-rose-300/30 text-rose-200 rounded-2xl font-bold bg-rose-500/10 hover:bg-rose-500/20">
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