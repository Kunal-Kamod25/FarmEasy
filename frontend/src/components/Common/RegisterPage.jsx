import { useState } from "react";
import { motion } from "framer-motion";
import { Sprout, Mail, Lock, User, Store } from "lucide-react";
// import logo from "../../assets/Logo.png";
import { Link } from "react-router-dom";

const Register = () => {
  const [role, setRole] = useState("customer");

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      
      {/* LEFT – Branding / Info */}
      <div className="text-inter hidden lg:flex items-center justify-center bg-gradient-to-br from-green-700 to-emerald-900 text-white p-10">
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
              <span   className="text-inter">Verified seeds, tools & fertilizers</span>
            </li>
            <li className="flex items-start gap-3">
              <Store className="w-5 h-5 mt-1" />
              <span className="text-inter">Sell directly to genuine buyers</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* RIGHT – Register Form */}

      {/* Left - Logo */}
            
      <div className="flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <h1 className="text-3xl text-inter font-bold mb-2 text-center">
            Create Your Account
          </h1>
          <p className="text-center text-inter text-gray-600 mb-8">
            Start your journey with FarmEasy
          </p>

          <form className="space-y-5">
            
            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className=" text-lora block mb-1 font-medium">Full Name</label>
                <div className="relative">
                  <User className="text-sm text-lora absolute left-3 top-1/2 -translate-y-1/2 text-gray-400  " />
                  <input
                    type="text"
                    placeholder="Shravani Pilane"
                    className="w-full h-12 pl-10 border rounded-md focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="farmer@email.com"
                    className="w-full h-12 pl-10 border rounded-md focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Password */}
              <div>
                <label className="block mb-1 font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    className="w-full h-12 pl-10 border rounded-md focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block mb-1 font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className="w-full h-12 pl-10 border rounded-md focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

            </div>


            {/* Role */}
            <div>
              <label className="block mb-2 font-medium">
                Register as
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex-1 border rounded-md p-3 ${
                    role === "customer"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300"
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("vendor")}
                  className={`flex-1 border rounded-md p-3 ${
                    role === "vendor"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300"
                  }`}
                >
                  Vendor
                </button>
              </div>
            </div>

            {/* Vendor GST */}
            {role === "vendor" && (
              <div>
                <label className="block mb-1 font-medium">GST Number</label>
                <input
                  type="text"
                  placeholder="Enter GST Number"
                  className="w-full h-12 border rounded-md px-3 focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-12 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link 
              to="/Login" 
              className="text-green-600 cursor-pointer font-medium hover:text-green-700 transition"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
