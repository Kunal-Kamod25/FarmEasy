// import {
//     User, Mail, Phone, MapPin, Camera,
//     Save, Shield,
//     Map, Home, Bookmark, CheckCircle
// } from "lucide-react";
// import My_Orders from "./My_Orders";

// const ProfileContent = ({
//     activeTab,
//     user,
//     formData,
//     isEditing,
//     setIsEditing,
//     loading,
//     message,
//     handleInputChange,
//     handleSave
// }) => {

//     return (
//         <main className="flex-1">
//             <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">

//                 {/* Tab Header */}
//                 <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
//                     <div>
//                         <h2 className="text-2xl font-black text-slate-800 capitalize">
//                             {activeTab === "profile" ? "Profile" : activeTab.replace("-", " ")}
//                         </h2>
//                         <p className="text-slate-500 text-sm mt-1 font-medium">
//                             {activeTab === "profile" && "Personal information and contact details"}
//                             {activeTab === "orders" && "Tracking and history of your orders"}
//                             {activeTab === "security" && "Manage your account security settings"}
//                         </p>
//                     </div>
//                     {activeTab === "profile" && (
//                         <button
//                             onClick={() => setIsEditing(!isEditing)}
//                             className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${isEditing
//                                 ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
//                                 : "bg-emerald-600 text-white shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:shadow-emerald-200"
//                                 }`}
//                         >
//                             {isEditing ? "Cancel" : "Edit Profile"}
//                         </button>
//                     )}
//                 </div>

//                 <div className="p-10">

//                     {/* Messages */}
//                     {message.text && (
//                         <div className={`mb-8 p-5 rounded-2xl flex items-center gap-3 border ${message.type === "success"
//                             ? "bg-emerald-50 text-emerald-800 border-emerald-100"
//                             : "bg-red-50 text-red-800 border-red-100"
//                             }`}>
//                             {message.type === "success"
//                                 ? <CheckCircle size={20} className="text-emerald-600" />
//                                 : <Shield size={20} className="text-red-600" />
//                             }
//                             <p className="text-sm font-bold">{message.text}</p>
//                         </div>
//                     )}

//                     {/* PROFILE TAB */}
//                     {activeTab === "profile" && (
//                         <div className="space-y-12">

//                             {/* Stats */}
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                 <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
//                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
//                                         Member Since
//                                     </p>
//                                     <p className="text-lg font-black text-slate-800">
//                                         {user.created_at
//                                             ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
//                                             : "Feb 2024"}
//                                     </p>
//                                 </div>

//                                 <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
//                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
//                                         Total Orders
//                                     </p>
//                                     <p className="text-lg font-black text-slate-800">
//                                         12 Completed
//                                     </p>
//                                 </div>

//                                 <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
//                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
//                                         Verified Status
//                                     </p>
//                                     <div className="flex items-center gap-2">
//                                         <p className="text-lg font-black text-emerald-600">Verified</p>
//                                         <div className="bg-emerald-100 p-1 rounded-full">
//                                             <CheckCircle size={14} className="text-emerald-600" />
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Form */}
//                             <form onSubmit={handleSave} className="space-y-10">

//                                 {/* Personal Info */}
//                                 <section>
//                                     <div className="flex items-center gap-3 mb-6">
//                                         <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
//                                             <User size={16} />
//                                         </div>
//                                         <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
//                                             Personal Information
//                                         </h3>
//                                     </div>

//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

//                                         <div className="space-y-2.5">
//                                             <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-wider">
//                                                 Full Name
//                                             </label>
//                                             <input
//                                                 name="fullname"
//                                                 type="text"
//                                                 value={formData.fullname}
//                                                 onChange={handleInputChange}
//                                                 disabled={!isEditing}
//                                                 className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl disabled:opacity-60"
//                                             />
//                                         </div>

//                                         <div className="space-y-2.5">
//                                             <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-wider">
//                                                 Email
//                                             </label>
//                                             <input
//                                                 name="email"
//                                                 type="email"
//                                                 value={formData.email}
//                                                 disabled
//                                                 className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400"
//                                             />
//                                         </div>

//                                         <div className="space-y-2.5">
//                                             <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-wider">
//                                                 Phone
//                                             </label>
//                                             <input
//                                                 name="phone"
//                                                 type="text"
//                                                 value={formData.phone}
//                                                 onChange={handleInputChange}
//                                                 disabled={!isEditing}
//                                                 className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl disabled:opacity-60"
//                                             />
//                                         </div>

//                                         <div className="space-y-2.5">
//                                             <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-wider">
//                                                 Bio
//                                             </label>
//                                             <input
//                                                 name="bio"
//                                                 type="text"
//                                                 value={formData.bio}
//                                                 onChange={handleInputChange}
//                                                 disabled={!isEditing}
//                                                 className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl disabled:opacity-60"
//                                             />
//                                         </div>
//                                     </div>
//                                 </section>

//                                 {isEditing && (
//                                     <div className="pt-6 flex justify-end gap-5">
//                                         <button
//                                             type="button"
//                                             onClick={() => setIsEditing(false)}
//                                             className="px-8 py-3.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-100"
//                                         >
//                                             Discard Changes
//                                         </button>
//                                         <button
//                                             type="submit"
//                                             disabled={loading}
//                                             className="px-10 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold"
//                                         >
//                                             {loading ? "Saving..." : "Save Profile"}
//                                         </button>
//                                     </div>
//                                 )}
//                             </form>
//                         </div>
//                     )}

//                     {/* ORDERS TAB */}
//                     {activeTab === "orders" && <My_Orders />}

//                     {/* SECURITY TAB */}
//                     {activeTab === "security" && (
//                         <div className="space-y-6">
//                             <h3 className="text-xl font-black text-slate-800">
//                                 Security Settings
//                             </h3>
//                             <p className="text-sm text-slate-500">
//                                 Your account security is important.
//                             </p>
//                             <button className="px-8 py-4 border border-red-200 text-red-600 rounded-2xl font-bold">
//                                 Delete Account
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </main>
//     );
// };

// export default ProfileContent;


// ─────────────────────────────────────────────
//  ProfileContent.jsx  —  Enhanced + Fixed
//  📁 src/components/profile/ProfileContent.jsx
// ─────────────────────────────────────────────
import {
  User, Mail, Phone, FileText, MapPin,
  Home, Map, Hash, CheckCircle, Shield,
  Save, X, Package, Lock, Trash2,
  AlertTriangle, Calendar, Users, Bell,
} from "lucide-react";

const font = { fontFamily: "'Lora', Georgia, serif" };

// ── Reusable Field ──
const Field = ({ label, name, type = "text", value, onChange, disabled, icon: Icon, locked }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] flex items-center gap-1.5" style={font}>
      {Icon && <Icon size={10} className="text-emerald-500" />}
      {label}
      {locked && <span className="text-slate-300 normal-case tracking-normal font-medium">(read-only)</span>}
    </label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-2xl text-sm border transition-all outline-none ${
        disabled
          ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
          : "bg-white border-emerald-200 text-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 shadow-sm"
      }`}
      style={font}
    />
  </div>
);

// ── Select Field ──
const SelectField = ({ label, name, value, onChange, disabled, icon: Icon, options }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] flex items-center gap-1.5" style={font}>
      {Icon && <Icon size={10} className="text-emerald-500" />}
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-2xl text-sm border transition-all outline-none ${
        disabled
          ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
          : "bg-white border-emerald-200 text-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 shadow-sm"
      }`}
      style={font}
    >
      <option value="">Select {label}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// ── Section Header ──
const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
      <Icon size={16} className="text-emerald-600" />
    </div>
    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400" style={font}>
      {title}
    </h3>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

// ── Toggle Switch ──
const Toggle = ({ on, onClick }) => (
  <div
    onClick={onClick}
    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0 ${
      on ? "bg-emerald-500" : "bg-slate-200"
    }`}
  >
    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
      on ? "left-7" : "left-1"
    }`} />
  </div>
);

const ProfileContent = ({
  activeTab, user, formData, isEditing, setIsEditing,
  loading, message, handleInputChange, handleSave,
  notifPrefs, toggleNotif,
}) => {
  return (
    <main className="flex-1 min-w-0">
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden min-h-[600px]">

        {/* ── Tab Header ── */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center"
          style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-xl font-black text-slate-800 capitalize" style={font}>
                {activeTab === "profile"       ? "Profile"
                 : activeTab === "orders"      ? "My Orders"
                 : activeTab === "notifications"? "Notifications"
                 : "Security"}
              </h2>
            </div>
            <p className="text-slate-400 text-xs font-medium ml-3.5" style={font}>
              {activeTab === "profile"        && "Personal information and contact details"}
              {activeTab === "orders"         && "Track and manage your order history"}
              {activeTab === "notifications"  && "Control what alerts you receive"}
              {activeTab === "security"       && "Keep your account safe and secure"}
            </p>
          </div>

          {activeTab === "profile" && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                isEditing
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100"
              }`}
              style={font}
            >
              {isEditing ? <><X size={14} /> Cancel</> : <><User size={14} /> Edit Profile</>}
            </button>
          )}
        </div>

        <div className="p-8">

          {/* ── Message ── */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border text-sm font-bold ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                : "bg-red-50 text-red-800 border-red-100"
            }`} style={font}>
              {message.type === "success"
                ? <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                : <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
              }
              {message.text}
            </div>
          )}

          {/* ══════════ PROFILE TAB ══════════ */}
          {activeTab === "profile" && (
            <div className="space-y-10">

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label:"Member Since",   value: user.created_at ? new Date(user.created_at).toLocaleDateString("en-US",{month:"long",year:"numeric"}) : "March 2026", icon:"🗓️", from:"from-emerald-50", to:"to-green-50",   border:"border-emerald-100" },
                  { label:"Total Orders",   value:"12 Completed",  icon:"📦", from:"from-blue-50",    to:"to-sky-50",     border:"border-blue-100"    },
                  { label:"Verified Status",value:"Verified ✓",    icon:"🛡️", from:"from-violet-50",  to:"to-purple-50",  border:"border-violet-100", green:true },
                ].map(stat => (
                  <div key={stat.label}
                    className={`bg-gradient-to-br ${stat.from} ${stat.to} border ${stat.border} rounded-2xl p-5`}>
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]" style={font}>
                        {stat.label}
                      </p>
                      <span className="text-lg">{stat.icon}</span>
                    </div>
                    <p className={`text-base font-black mt-2 ${stat.green ? "text-emerald-600" : "text-slate-800"}`} style={font}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-10">

                {/* Personal Info */}
                <div>
                  <SectionHeader icon={User} title="Personal Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Full Name"    name="fullname" value={formData.fullname} onChange={handleInputChange} disabled={!isEditing} icon={User} />
                    <Field label="Email"        name="email"    value={formData.email}    onChange={handleInputChange} disabled={true}       icon={Mail}  locked />
                    <Field label="Phone"        name="phone"    value={formData.phone}    onChange={handleInputChange} disabled={!isEditing} icon={Phone} />
                    <Field label="Bio"          name="bio"      value={formData.bio}      onChange={handleInputChange} disabled={!isEditing} icon={FileText} />
                    <Field label="Date of Birth" name="dob"     value={formData.dob}      onChange={handleInputChange} disabled={!isEditing} icon={Calendar} type="date" />
                    <SelectField
                      label="Gender" name="gender" value={formData.gender}
                      onChange={handleInputChange} disabled={!isEditing} icon={Users}
                      options={["Male", "Female", "Non-binary", "Prefer not to say"]}
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <SectionHeader icon={MapPin} title="Address Details" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <Field label="Street Address" name="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing} icon={Home} />
                    </div>
                    <Field label="City"    name="city"    value={formData.city}    onChange={handleInputChange} disabled={!isEditing} icon={Map} />
                    <Field label="State"   name="state"   value={formData.state}   onChange={handleInputChange} disabled={!isEditing} icon={MapPin} />
                    <Field label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} disabled={!isEditing} icon={Hash} />
                  </div>
                </div>

                {/* Save Buttons */}
                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setIsEditing(false)}
                      className="px-6 py-3 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-all text-sm flex items-center gap-2"
                      style={font}>
                      <X size={14} /> Discard
                    </button>
                    <button type="submit" disabled={loading}
                      className="px-8 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all text-sm flex items-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-60"
                      style={font}>
                      <Save size={14} />
                      {loading ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ══════════ ORDERS TAB ══════════ */}
          {activeTab === "orders" && (
            <div>
              <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <Package size={18} className="text-emerald-600 flex-shrink-0" />
                <p className="text-sm font-bold text-emerald-700" style={font}>
                  All your orders are shown below
                </p>
              </div>
              <My_Orders />
            </div>
          )}

          {/* ══════════ NOTIFICATIONS TAB ══════════ */}
          {activeTab === "notifications" && (
            <div className="space-y-3">
              <SectionHeader icon={Bell} title="Alert Preferences" />

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6">
                <p className="text-xs text-emerald-700 font-bold" style={font}>
                  💡 Toggle on/off to control what notifications you receive from FarmEasy
                </p>
              </div>

              {notifPrefs.map((n, i) => (
                <div key={n.key}
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                    n.on
                      ? "bg-emerald-50/50 border-emerald-100"
                      : "bg-white border-slate-100"
                  }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      n.on ? "bg-emerald-100" : "bg-slate-100"
                    }`}>
                      <Bell size={16} className={n.on ? "text-emerald-600" : "text-slate-400"} />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${n.on ? "text-slate-800" : "text-slate-400"}`} style={font}>
                        {n.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5" style={font}>{n.sub}</p>
                    </div>
                  </div>
                  <Toggle on={n.on} onClick={() => toggleNotif(n.key)} />
                </div>
              ))}

              <p className="text-xs text-slate-400 text-center mt-4 pt-4 border-t border-slate-100" style={font}>
                Notification settings are saved locally on your device
              </p>
            </div>
          )}

          {/* ══════════ SECURITY TAB ══════════ */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <SectionHeader icon={Shield} title="Security Settings" />

              {[
                { icon: Lock,   title: "Change Password",           desc: "Update your password regularly",         action: "Update", color: "emerald" },
                { icon: Shield, title: "Two-Factor Authentication", desc: "Add an extra layer of account security", action: "Enable", color: "blue"    },
              ].map(item => (
                <div key={item.title}
                  className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-${item.color}-100 flex items-center justify-center flex-shrink-0`}>
                      <item.icon size={18} className={`text-${item.color}-600`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm" style={font}>{item.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5" style={font}>{item.desc}</p>
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-xl text-xs font-bold bg-${item.color}-600 text-white hover:bg-${item.color}-700 transition-all`}
                    style={font}>
                    {item.action}
                  </button>
                </div>
              ))}

              {/* Danger Zone */}
              <div className="mt-6 p-5 rounded-2xl border border-red-100 bg-red-50/50">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest" style={font}>
                    Danger Zone
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-800 text-sm" style={font}>Delete Account</p>
                    <p className="text-xs text-slate-400 mt-0.5" style={font}>
                      Permanently remove your account and all data
                    </p>
                  </div>
                  <button className="px-4 py-2 rounded-xl text-xs font-bold border border-red-200 text-red-600 hover:bg-red-100 transition-all flex items-center gap-2 flex-shrink-0"
                    style={font}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default ProfileContent;