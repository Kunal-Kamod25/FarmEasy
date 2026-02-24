import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, MapPin, Phone, Mail, Camera } from "lucide-react";

const VendorProfile = () => {
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState({
    vendor_name: "",
    address: "",
    phone: "",
    email: "",
    profile_image: "",
  });

  const [imageFile, setImageFile] = useState(null);

  // ================= FETCH PROFILE =================
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/vendor/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(res.data);
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= HANDLE IMAGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  // ================= UPDATE PROFILE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      Object.keys(profile).forEach((key) => {
        data.append(key, profile[key]);
      });

      if (imageFile) {
        data.append("profile_image", imageFile);
      }

      await axios.put(
        "http://localhost:5000/api/vendor/profile",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  return (
    <div
      className="min-h-screen p-6 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-yellow-700/60 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">
            Vendor Profile 🌾
          </h2>
          <p className="text-green-100 text-sm">
            Manage your store information and contact details
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-green-200 p-8">

          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-10">

            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
                {profile.profile_image ? (
                  <img
                    src={profile.profile_image}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-green-600" />
                )}
              </div>

              <label className="absolute bottom-0 right-0 bg-white border border-green-200 p-1.5 rounded-full shadow hover:bg-green-50 cursor-pointer">
                <Camera size={16} className="text-green-700" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Store Info */}
            <div>
              <h3 className="text-xl font-semibold text-green-800">
                {profile.vendor_name || "Your Store Name"}
              </h3>
              <p className="text-sm text-green-600">
                Organic & Agricultural Products
              </p>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Vendor Name */}
            <InputField
              label="Vendor Name"
              icon={<User size={18} />}
              name="vendor_name"
              value={profile.vendor_name}
              onChange={handleChange}
            />

            {/* Address */}
            <InputField
              label="Address"
              icon={<MapPin size={18} />}
              name="address"
              value={profile.address}
              onChange={handleChange}
            />

            {/* Phone & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Phone Number"
                icon={<Phone size={18} />}
                name="phone"
                value={profile.phone}
                onChange={handleChange}
              />

              <InputField
                label="Email Address"
                icon={<Mail size={18} />}
                name="email"
                value={profile.email}
                onChange={handleChange}
                type="email"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-green-200">
              <button
                type="button"
                className="px-6 py-2 rounded-xl border border-green-300 text-green-700 hover:bg-green-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-2 rounded-xl bg-gradient-to-r from-green-600 to-lime-500 
                hover:from-green-700 hover:to-lime-600 text-white shadow-lg transition"
              >
                Update Profile
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

/* ===== Reusable Input Component ===== */
const InputField = ({ label, icon, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-sm font-semibold text-green-800 mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-2.5 text-green-600">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
      />
    </div>
  </div>
);

export default VendorProfile;