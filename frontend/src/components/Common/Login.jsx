// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import "./Login.css";

// const Login = () => {
//   const [loginAs, setLoginAs] = useState("farmer");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [remember, setRemember] = useState(false);

//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch("http://localhost:5000/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email,
//           password,
//           role: loginAs,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         localStorage.setItem("user", JSON.stringify(data.user));
//         alert("Welcome back, " + data.user.fullname);
//         navigate("/");
//       } else {
//         alert(data.message || "Login failed");
//       }
//     } catch (err) {
//       alert("Server connection failed");
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         <h2>Sign In</h2>

//         <form onSubmit={handleSubmit}>
//           {/* Role Selection */}
//           <label>Login as:</label>
//             <div className="role-container">
//               <label>
//                 <input
//                   type="radio"
//                   name="role"
//                   value="farmer"
//                   checked={loginAs === "farmer"}
//                   onChange={(e) => setLoginAs(e.target.value)}
//                 />
//                 Farmer
//               </label>

//               <label>
//                 <input
//                   type="radio"
//                   name="role"
//                   value="vendor"
//                   checked={loginAs === "vendor"}
//                   onChange={(e) => setLoginAs(e.target.value)}
//                 />
//                 Vendor
//               </label>
//             </div>


//           <label>Email</label>
//           <input
//             type="email"
//             placeholder={
//               loginAs === "farmer"
//                 ? "farmer@gmail.com"
//                 : "vendor@gmail.com"
//             }
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />

//           <label>Password</label>
//           <input
//             type="password"
//             placeholder="Enter your password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           <div className="remember-row">
//             <label className="remember-me">
//               <input
//                 type="checkbox"
//                 checked={remember}
//                 onChange={(e) => setRemember(e.target.checked)}
//               />
//               Remember me
//             </label>

//             <span className="forgot">Forgot password?</span>
//           </div>

//           <button type="submit" className="login-btn">
//             Login
//           </button>
//         </form>

//         <p className="signup-text">
//           Don’t have an account?{" "}
//           <Link to="/register">
//             <span>Create one</span>
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import "./Login.css";
import { Link } from "react-router-dom";


const Login = () => {
  const [loginAs, setLoginAs] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleRoleChange = (role) => {
    setLoginAs(role);
    setEmail("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ loginAs, email, password, remember });
    alert(`Logged in as ${loginAs}`);
  };

  return (
    <div className="login-page">
      
      {/* LEFT GREEN SECTION */}
      <div className="login-left">
        <div className="left-content">
          <div className="logo">🌱</div>
          <h2>Join FarmEasy</h2>
          <p>
            India’s trusted agricultural marketplace for farmers and vendors.
          </p>

          <ul>
            <li>✔ Verified seeds, tools & fertilizers</li>
            <li>✔ Sell directly to genuine buyers</li>
          </ul>
        </div>
      </div>

      {/* RIGHT LOGIN SECTION (YOUR OLD UI) */}
      <div className="login-right">
        <div className="login-card">
          <h2>Welcome</h2>
          <p className="login-subtitle">Log in to your account</p>

          <p className="register-title">Register as</p>
          <div className="register-boxes">
            <label
              className={`register-card ${
                loginAs === "customer" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="role"
                checked={loginAs === "customer"}
                onChange={() => handleRoleChange("customer")}
              />
              Customer
            </label>

            <label
              className={`register-card ${
                loginAs === "vendor" ? "active" : ""
              }`}
            >
              <input
                type="radio"
                name="role"
                checked={loginAs === "vendor"}
                onChange={() => handleRoleChange("vendor")}
              />
              Vendor
            </label>
          </div>

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

            <div className="options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>

               <Link to="/forgot-password" className="forgot">
                Forgot password?
               </Link>
            </div>

            <button type="submit" className="login-btn">
              Log In
            </button>
          </form>

            <p className="signup-text">
             Don’t have an account?{" "}
            <Link to="/register">Sign Up</Link>
            </p>

        </div>
      </div>
    </div>
  );
};

export default Login;





