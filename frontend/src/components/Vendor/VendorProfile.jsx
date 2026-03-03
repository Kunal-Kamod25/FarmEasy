import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  User, MapPin, Phone, Mail, Camera, Store,
  Globe, CreditCard, Shield, CheckCircle, Edit3, Save, X
} from "lucide-react";

const VendorProfile = () => {
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState({
    vendor_name: "",
    store_name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    website: "",
    gst_number: "",
    bank_account: "",
    ifsc_code: "",
    profile_image: "",
    bio: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const res = await axios.get("http://localhost:5000/api/vendor/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = new FormData();
      Object.keys(profile).forEach((key) => data.append(key, profile[key]));
      if (imageFile) data.append("profile_image", imageFile);

      await axios.put("http://localhost:5000/api/vendor/profile", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your store details and account information</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 text-sm font-semibold">
            <CheckCircle size={16} />
            Profile saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Avatar Card */}
          <div className="space-y-5">

            {/* Profile Picture */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-emerald-50 flex items-center justify-center shadow-md">
                  {imagePreview || profile.profile_image ? (
                    <img
                      src={imagePreview || profile.profile_image}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={36} className="text-emerald-400" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-emerald-600 hover:bg-emerald-700 p-2 rounded-xl shadow-md cursor-pointer transition">
                  <Camera size={14} className="text-white" />
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                </label>
              </div>

              <h3 className="font-bold text-gray-800 text-lg">
                {profile.vendor_name || "Your Name"}
              </h3>
              <p className="text-emerald-600 text-sm font-medium">
                {profile.store_name || "Store Name"}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {profile.city && profile.state ? `${profile.city}, ${profile.state}` : "Location"}
              </p>

              <div className="mt-4 w-full pt-4 border-t border-gray-100 space-y-2 text-left">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail size={13} className="text-emerald-500" />
                  <span className="truncate">{profile.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone size={13} className="text-emerald-500" />
                  <span>{profile.phone || "—"}</span>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Shield size={15} className="text-emerald-600" />
                Account Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Profile</span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Verified</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Email</span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Verified</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">GST</span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${profile.gst_number
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                    }`}>
                    {profile.gst_number ? "Submitted" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Forms */}
          <div className="lg:col-span-2 space-y-5">

            {/* Personal Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                <User size={16} className="text-emerald-600" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  label="Full Name"
                  name="vendor_name"
                  value={profile.vendor_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
                <FormField
                  label="Store / Farm Name"
                  name="store_name"
                  value={profile.store_name}
                  onChange={handleChange}
                  placeholder="e.g. Green Fields Farm"
                />
                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
                <FormField
                  label="Phone Number"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    About / Bio
                  </label>
                  <textarea
                    name="bio"
                    value={profile.bio || ""}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Tell customers about your farm and products..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" />
                Address Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <FormField
                    label="Street Address"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    placeholder="Village / Tehsil / District"
                  />
                </div>
                <FormField
                  label="City"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  placeholder="City"
                />
                <FormField
                  label="State"
                  name="state"
                  value={profile.state}
                  onChange={handleChange}
                  placeholder="State"
                />
                <FormField
                  label="Pincode"
                  name="pincode"
                  value={profile.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                />
                <FormField
                  label="Website (optional)"
                  name="website"
                  value={profile.website}
                  onChange={handleChange}
                  placeholder="https://yourfarm.com"
                />
              </div>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-600" />
                Business & Bank Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  label="GST Number"
                  name="gst_number"
                  value={profile.gst_number}
                  onChange={handleChange}
                  placeholder="22AAAAA0000A1Z5"
                />
                <FormField
                  label="Bank Account Number"
                  name="bank_account"
                  value={profile.bank_account}
                  onChange={handleChange}
                  placeholder="Account number"
                />
                <FormField
                  label="IFSC Code"
                  name="ifsc_code"
                  value={profile.ifsc_code}
                  onChange={handleChange}
                  placeholder="e.g. SBIN0001234"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={fetchProfile}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold rounded-xl transition text-sm"
              >
                <X size={15} />
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
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

          </div>
        </div>
      </form>
    </div>
  );
};

/* ── Reusable Form Field ── */
const FormField = ({ label, name, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-none transition"
    />
  </div>
);

export default VendorProfile;





// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { User, MapPin, Phone, Mail, Camera } from "lucide-react";

// const VendorProfile = () => {
//   const token = localStorage.getItem("token");

//   const [profile, setProfile] = useState({
//     vendor_name: "",
//     address: "",
//     phone: "",
//     email: "",
//     profile_image: "",
//   });

//   const [imageFile, setImageFile] = useState(null);

//   // ================= FETCH PROFILE =================
//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       const res = await axios.get(
//         "http://localhost:5000/api/vendor/profile",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setProfile(res.data);
//     } catch (error) {
//       console.error("Profile fetch error:", error);
//     }
//   };

//   // ================= HANDLE INPUT =================
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setProfile((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // ================= HANDLE IMAGE =================
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     setImageFile(file);
//   };

//   // ================= UPDATE PROFILE =================
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const data = new FormData();

//       Object.keys(profile).forEach((key) => {
//         data.append(key, profile[key]);
//       });

//       if (imageFile) {
//         data.append("profile_image", imageFile);
//       }

//       await axios.put(
//         "http://localhost:5000/api/vendor/profile",
//         data,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       alert("Profile updated successfully!");
//     } catch (error) {
//       console.error("Profile update error:", error);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen p-6 bg-cover bg-center relative"
//       style={{
//         backgroundImage:
//           "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')",
//       }}
//     >
//       {/* Overlay */}
//       <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-yellow-700/60 backdrop-blur-sm"></div>

//       {/* Content */}
//       <div className="relative z-10 max-w-4xl mx-auto">

//         {/* Header */}
//         <div className="mb-8">
//           <h2 className="text-3xl font-bold text-white">
//             Vendor Profile 🌾
//           </h2>
//           <p className="text-green-100 text-sm">
//             Manage your store information and contact details
//           </p>
//         </div>

//         {/* Profile Card */}
//         <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-green-200 p-8">

//           {/* Profile Header */}
//           <div className="flex items-center gap-6 mb-10">

//             {/* Avatar */}
//             <div className="relative">
//               <div className="w-24 h-24 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
//                 {profile.profile_image ? (
//                   <img
//                     src={profile.profile_image}
//                     alt="profile"
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <User size={40} className="text-green-600" />
//                 )}
//               </div>

//               <label className="absolute bottom-0 right-0 bg-white border border-green-200 p-1.5 rounded-full shadow hover:bg-green-50 cursor-pointer">
//                 <Camera size={16} className="text-green-700" />
//                 <input
//                   type="file"
//                   className="hidden"
//                   onChange={handleImageChange}
//                 />
//               </label>
//             </div>

//             {/* Store Info */}
//             <div>
//               <h3 className="text-xl font-semibold text-green-800">
//                 {profile.vendor_name || "Your Store Name"}
//               </h3>
//               <p className="text-sm text-green-600">
//                 Organic & Agricultural Products
//               </p>
//             </div>
//           </div>

//           {/* Form */}
//           <form className="space-y-6" onSubmit={handleSubmit}>

//             {/* Vendor Name */}
//             <InputField
//               label="Vendor Name"
//               icon={<User size={18} />}
//               name="vendor_name"
//               value={profile.vendor_name}
//               onChange={handleChange}
//             />

//             {/* Address */}
//             <InputField
//               label="Address"
//               icon={<MapPin size={18} />}
//               name="address"
//               value={profile.address}
//               onChange={handleChange}
//             />

//             {/* Phone & Email */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <InputField
//                 label="Phone Number"
//                 icon={<Phone size={18} />}
//                 name="phone"
//                 value={profile.phone}
//                 onChange={handleChange}
//               />

//               <InputField
//                 label="Email Address"
//                 icon={<Mail size={18} />}
//                 name="email"
//                 value={profile.email}
//                 onChange={handleChange}
//                 type="email"
//               />
//             </div>

//             {/* Buttons */}
//             <div className="flex justify-end gap-4 pt-6 border-t border-green-200">
//               <button
//                 type="button"
//                 className="px-6 py-2 rounded-xl border border-green-300 text-green-700 hover:bg-green-50 transition"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="submit"
//                 className="px-8 py-2 rounded-xl bg-gradient-to-r from-green-600 to-lime-500
//                 hover:from-green-700 hover:to-lime-600 text-white shadow-lg transition"
//               >
//                 Update Profile
//               </button>
//             </div>

//           </form>

//         </div>
//       </div>
//     </div>
//   );
// };

// /* ===== Reusable Input Component ===== */
// const InputField = ({ label, icon, name, value, onChange, type = "text" }) => (
//   <div>
//     <label className="block text-sm font-semibold text-green-800 mb-2">
//       {label}
//     </label>
//     <div className="relative">
//       <div className="absolute left-3 top-2.5 text-green-600">
//         {icon}
//       </div>
//       <input
//         type={type}
//         name={name}
//         value={value || ""}
//         onChange={onChange}
//         className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
//       />
//     </div>
//   </div>
// );

// export default VendorProfile;







