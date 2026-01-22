import React, { useState } from "react";
import "./Login.css";



const Login = () => {
  const [loginAs, setLoginAs] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRoleChange = (role) => {
    setLoginAs(role);

    // Change placeholder email based on role
    if (role === "customer") {
      setEmail("farmer@gmail.com");
    } else {
      setEmail("vendor@gmail.com");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ loginAs, email, password });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome</h2>
        <p className="login-subtitle">Log in to your account</p>

        {/* Register As Section */}
        <p className="register-title">Register as</p>
        <div className="register-boxes">
          <div
            className={`register-card ${
              loginAs === "customer" ? "active" : ""
            }`}
            onClick={() => handleRoleChange("customer")}
          >
            Customer
          </div>

          <div
            className={`register-card ${
              loginAs === "vendor" ? "active" : ""
            }`}
            onClick={() => handleRoleChange("vendor")}
          >
            Vendor
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            placeholder={
              loginAs === "customer"
                ? "farmer@gmail.com"
                : "vendor@gmail.com"
            }
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="signup-text">
          Don’t have an account? <span>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
