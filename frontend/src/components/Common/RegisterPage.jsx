import { useState } from "react";
import { motion } from "framer-motion";
import { Sprout, Mail, Lock, User, Store } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

const Register = () => {
  const [role, setRole] = useState("customer");
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    gst_number: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // check if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // check phone number length and digits
    if (!/^[0-9]{10}$/.test(formData.phone_number)) {
      alert("Phone number must be 10 digits");
      return;
    }

    // make sure full name has only letters and spaces
    if (!/^[A-Za-z\s]+$/.test(formData.fullname)) {
      alert("Full name should contain only letters and spaces");
      return;
    }

    // all validations passed, now call API
    try {
      const response = await fetch(`${API_URL}/api/authentication/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password,
          role: role,
          gst_number: role === "vendor" ? formData.gst_number : null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful!");
        navigate("/Login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server not reachable");
    }
  };


  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* LEFT – Branding / Info (VISIBLE ON MOBILE) */}
      <div className="text-inter flex items-center justify-center bg-gradient-to-br from-green-700 to-emerald-900 text-white p-10 min-h-[40vh] lg:min-h-screen order-1">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <Sprout className="w-24 h-24 mx-auto mb-6 text-white/90" />

          <h2 className="font-inter text-4xl font-bold mb-4">
            Join FarmEasy
          </h2>

          <p className="text-inter text-lg text-green-100 mb-8">
            India’s trusted agricultural marketplace for farmers and vendors.
          </p>

          <ul className="space-y-4 text-left">
            <li className="flex items-start gap-3">
              <Sprout className="w-5 h-5 mt-1" />
              <span>Verified seeds, tools & fertilizers</span>
            </li>
            <li className="flex items-start gap-3">
              <Store cladssName="w-5 h-5 mt-1" />
              <span>Sell directly to genuine buyers</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* RIGHT – Register Form */}
      <div className="flex items-center justify-center p-8 bg-white order-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <h1 className="text-3xl font-bold mb-2 text-center">
            Create Your Account
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Start your journey with FarmEasy
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full h-12 pl-10 border rounded-md focus:ring-2 focus:ring-green-500"
                    required
                    pattern="^[A-Za-z\s]+$"
                    title="Full name must contain only letters and spaces"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="farmer@email.com"
                    className="w-full h-12 pl-10 border rounded-md focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label className="block mb-1 font-medium">Mobile Number</label>
              <input
                type="tel"
                name="phone_number"
                placeholder="Enter your phone number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                title="Enter a 10-digit phone number"
                className="w-full h-12 border rounded-md px-3 focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Passwordd */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full h-12 pl-10 border rounded-md focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="w-full h-12 pl-10 border rounded-md focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block mb-2 font-medium">Register as</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex-1 border rounded-md p-3 ${role === "customer"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-300"
                    }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("vendor")}
                  className={`flex-1 border rounded-md p-3 ${role === "vendor"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-300"
                    }`}
                >
                  Vendor
                </button>
              </div>
            </div>

            {/* GST */}
            {role === "vendor" && (
              <input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
                placeholder="Enter GST Number"
                className="w-full h-12 border rounded-md px-3 focus:ring-2 focus:ring-green-500"
              />
            )}

            <button
              type="submit"
              className="w-full h-12 bg-[#2e7d32] text-white font-semibold rounded-md hover:bg-green-700"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/Login" className="text-green-600 font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
