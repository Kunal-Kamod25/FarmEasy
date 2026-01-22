import React, { useState } from "react";
import "./Login.css";



const Login = () => {
  const [loginAs, setLoginAs] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD

  const handleRoleChange = (role) => {
    setLoginAs(role);

    // Change placeholder email based on role
    if (role === "customer") {
      setEmail("farmer@gmail.com");
    } else {
      setEmail("vendor@gmail.com");
=======
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: loginAs }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Welcome back, " + data.user.fullname);
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server connection failed");
>>>>>>> df6dfc92e997f51e6a133f79dced5c22bd06277a
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ loginAs, email, password });
  };

  return (
    <div className="login-container">
<<<<<<< HEAD
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
=======
      <div className="login-box">
        <h2>Sign In</h2>
>>>>>>> df6dfc92e997f51e6a133f79dced5c22bd06277a

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
          {/* Role Selection */}
          <label>Login as:</label>
          <div className="radio-group" style={{ display: "flex", gap: "20px", marginBottom: "15px" }}>
            <label className="radio-label">
              <input
                type="radio"
                name="loginRole"
                value="farmer"
                checked={loginAs === "farmer"}
                onChange={(e) => setLoginAs(e.target.value)}
              />
              Farmer
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="loginRole"
                value="vendor"
                checked={loginAs === "vendor"}
                onChange={(e) => setLoginAs(e.target.value)}
              />
              Vendor
            </label>
          </div>

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

<<<<<<< HEAD
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="signup-text">
          Don’t have an account? <span>Sign Up</span>
=======
          <div className="options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <span className="forgot">Forgot password?</span>
          </div>

          <button type="submit">Log In</button>
        </form>

        <p className="signup-text">
          Don’t have an account?{" "}
          <Link to="/register">
            <span>Create one</span>
          </Link>
>>>>>>> df6dfc92e997f51e6a133f79dced5c22bd06277a
        </p>
      </div>
    </div>
  );
};

export default Login;
