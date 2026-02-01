import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [loginAs, setLoginAs] = useState("farmer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setLoginAs(role);
    setEmail("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/authentication/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: loginAs,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert(`Welcome ${data.user.fullname}`);

        // Redirect based on role
        if (data.user.role === "vendor") {
          navigate("/vendor");
        } else if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      alert("Server not responding");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-2 font-Lora">
      {/* LEFT SECTION */}
      <div className="bg-gradient-to-br from-green-700 to-green-900 text-white flex items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="text-6xl mb-5">🌱</div>
          <h2 className="text-4xl font-bold mb-4">Join FarmEasy</h2>
          <p className="text-green-100 text-base">
            India’s trusted agricultural marketplace for farmers and vendors.
          </p>
        </div>
      </div>

      {/* RIGHT LOGIN */}
      <div className="flex items-center justify-center">
        <div className="w-[360px] p-10 rounded-xl shadow-xl">
          <h2 className="text-center text-2xl font-bold mb-1">Welcome</h2>
          <p className="text-center text-gray-500 mb-5">
            Log in to your account
          </p>

          <p className="font-semibold mb-2">Login as</p>
          <div className="flex gap-4 mb-5">
            <label
              className={`border px-4 py-3 rounded-md cursor-pointer flex items-center gap-2
              transition-all duration-50 ease-in-out
              ${loginAs === "farmer"
                  ? "border-green-700 bg-green-50 text-green-700"
                  : "text-gray-300 hover:bg-green-700 hover:text-white"
                }`}
            >
              <input
                type="radio"
                checked={loginAs === "farmer"}
                onChange={() => handleRoleChange("farmer")}
              />
              Farmer
            </label>


            <label
              className={`border px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 
                transition-all duration-50 ease-in-out 
                ${loginAs === "vendor"
                  ? "border-green-700 bg-green-50 text-green-700"
                  : "text-gray-300 hover:bg-green-700 hover:text-white"
                }`}
            >
              <input
                type="radio"
                checked={loginAs === "vendor"}
                onChange={() => handleRoleChange("vendor")}
              />
              Vendor
            </label>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block mt-4 mb-1">Email</label>
            <input
              type="email"
              placeholder={
                loginAs === "farmer"
                  ? "farmer@gmail.com"
                  : "vendor@gmail.com"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:border-green-700"
            />

            <label className="block mt-4 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:border-green-700"
            />

            <div className="flex justify-between items-center my-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="relative text-green-600 font-medium after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all hover:after:w-full"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-green-700 text-white py-3 rounded-md hover:bg-green-800 transition"
            >
              Log In
            </button>
          </form>

          <p className="text-center mt-5">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="relative text-green-600 font-semibold after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all hover:after:w-full"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
