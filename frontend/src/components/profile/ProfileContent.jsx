import {
    User, Mail, Phone, MapPin, Camera,
    Save, Shield, CheckCircle, Store, X
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
    handleSave,
    imagePreview,
    handleImageChange
}) => {

    return (
        <main className="flex-1">
            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── LEFT COLUMN: Avatar + Status ── */}
                    <div className="space-y-5">

                        {/* Profile Picture Card */}
                        <div className="bg-white/5 rounded-2xl shadow-xl shadow-emerald-950/15 border border-white/10 p-6 flex flex-col items-center text-center backdrop-blur-xl">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-emerald-300/10 flex items-center justify-center shadow-md border border-white/10">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={36} className="text-emerald-200" />
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute -bottom-2 -right-2 bg-emerald-500 hover:bg-emerald-400 p-2 rounded-xl shadow-md cursor-pointer transition">
                                        <Camera size={14} className="text-white" />
                                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                )}
                            </div>

                            <h3 className="font-bold text-white text-lg">
                                {user.fullname || user.full_name || "Your Name"}
                            </h3>
                            <p className="text-emerald-100 text-sm font-medium capitalize">
                                {user.role || "Customer"}
                            </p>
                            {(user.city || user.state) && (
                                <p className="text-white/50 text-xs mt-1">
                                    {[user.city, user.state].filter(Boolean).join(", ")}
                                </p>
                            )}
                            {user.created_at && (
                                <p className="text-white/45 text-[11px] mt-1">
                                    Joined {new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                                </p>
                            )}

                            <div className="mt-4 w-full pt-4 border-t border-white/10 space-y-2 text-left">
                                <div className="flex items-center gap-2 text-xs text-white/65">
                                    <Mail size={13} className="text-emerald-100" />
                                    <span className="truncate">{user.email || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/65">
                                    <Phone size={13} className="text-emerald-100" />
                                    <span>{user.phone || user.phone_number || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/65">
                                    <Store size={13} className="text-emerald-100" />
                                    <span>{Number(metrics?.total_orders || 0)} orders placed</span>
                                </div>
                            </div>
                        </div>

                        {/* Account Status Card */}
                        <div className="bg-white/5 rounded-2xl shadow-xl shadow-emerald-950/15 border border-white/10 p-5 backdrop-blur-xl">
                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <Shield size={15} className="text-emerald-100" />
                                Account Status
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-white/60">Profile</span>
                                    <span className={`px-2 py-0.5 rounded-full font-semibold ${metrics?.verification?.profile_verified
                                        ? "bg-emerald-300/20 text-emerald-100"
                                        : "bg-amber-300/20 text-amber-100"
                                        }`}>
                                        {metrics?.verification?.profile_verified ? "Verified" : "Incomplete"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-white/60">Email</span>
                                    <span className={`px-2 py-0.5 rounded-full font-semibold ${metrics?.verification?.email_verified
                                        ? "bg-emerald-300/20 text-emerald-100"
                                        : "bg-amber-300/20 text-amber-100"
                                        }`}>
                                        {metrics?.verification?.email_verified ? "Verified" : "Pending"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-white/60">Phone</span>
                                    <span className={`px-2 py-0.5 rounded-full font-semibold ${metrics?.verification?.phone_verified
                                        ? "bg-emerald-300/20 text-emerald-100"
                                        : "bg-amber-300/20 text-amber-100"
                                        }`}>
                                        {metrics?.verification?.phone_verified ? "Verified" : "Pending"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN: Forms ── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Messages */}
                        {message.text && (
                            <div className={`p-5 rounded-2xl flex items-center gap-3 border ${message.type === "success"
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

                        {activeTab === "profile" && (
                            <>
                                {/* Personal Information */}
                                <div className="bg-white/5 rounded-2xl shadow-xl shadow-emerald-950/15 border border-white/10 p-6 backdrop-blur-xl">
                                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                                            <User size={16} className="text-emerald-100" />
                                            Personal Information
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(!isEditing)}
                                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${isEditing
                                                ? "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                                                : "bg-emerald-500 text-white shadow-xl shadow-emerald-950/30 hover:bg-emerald-400"
                                                }`}
                                        >
                                            {isEditing ? "Cancel" : "Edit Profile"}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormField
                                            label="Full Name"
                                            name="fullname"
                                            value={formData.fullname}
                                            onChange={handleInputChange}
                                            placeholder="Your full name"
                                            disabled={!isEditing}
                                        />
                                        <FormField
                                            label="Email Address"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="your@email.com"
                                            disabled={true}
                                        />
                                        <FormField
                                            label="Phone Number"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+91 XXXXX XXXXX"
                                            disabled={!isEditing}
                                        />
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-white/80 mb-1.5">
                                                About / Bio
                                            </label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio || ""}
                                                onChange={handleInputChange}
                                                rows="3"
                                                disabled={!isEditing}
                                                placeholder="Tell us something about yourself..."
                                                className="w-full border border-white/15 bg-white/5 text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-300/35 focus:border-transparent focus:outline-none transition resize-none disabled:opacity-60"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Details */}
                                <div className="bg-white/5 rounded-2xl shadow-xl shadow-emerald-950/15 border border-white/10 p-6 backdrop-blur-xl">
                                    <h2 className="text-base font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-2">
                                        <MapPin size={16} className="text-emerald-100" />
                                        Address Details
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2">
                                            <FormField
                                                label="Street Address"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="Enter your street address"
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <FormField
                                            label="City"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="City"
                                            disabled={!isEditing}
                                        />
                                        <FormField
                                            label="State"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="State"
                                            disabled={!isEditing}
                                        />
                                        <FormField
                                            label="Pincode"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            placeholder="6-digit pincode"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                {/* Save Button */}
                                {isEditing && (
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white/80 hover:bg-white/10 font-semibold rounded-xl transition text-sm"
                                        >
                                            <X size={15} />
                                            Discard
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={15} />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === "security" && (
                            <div className="bg-white/5 rounded-2xl shadow-xl shadow-emerald-950/15 border border-white/10 p-6 backdrop-blur-xl space-y-6">
                                <h3 className="text-xl font-black text-white">
                                    Security Settings
                                </h3>
                                <p className="text-sm text-white/65">
                                    Your account security is important. Manage your password and account settings here.
                                </p>
                                <div className="space-y-3">
                                    <button type="button" className="w-full sm:w-auto px-8 py-4 border border-amber-300/30 text-amber-200 rounded-2xl font-bold bg-amber-500/10 hover:bg-amber-500/20 transition text-sm">
                                        Change Password
                                    </button>
                                    <br />
                                    <button type="button" className="w-full sm:w-auto px-8 py-4 border border-rose-300/30 text-rose-200 rounded-2xl font-bold bg-rose-500/10 hover:bg-rose-500/20 transition text-sm">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </main>
    );
};

/* ── Reusable Form Field ── */
const FormField = ({ label, name, value, onChange, placeholder, type = "text", disabled = false }) => (
    <div>
        <label className="block text-sm font-semibold text-white/80 mb-1.5">{label}</label>
        <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full border border-white/15 bg-white/5 text-white rounded-xl px-4 py-2.5 text-sm placeholder:text-white/35 focus:ring-2 focus:ring-emerald-300/35 focus:border-transparent focus:outline-none transition disabled:opacity-60"
        />
    </div>
);

export default ProfileContent;