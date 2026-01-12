// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Mail, Lock, Sprout } from "lucide-react";
// import { Link } from "react-router-dom";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     // TODO: connect API
//     setTimeout(() => {
//       setIsLoading(false);
//       console.log("Login:", { email, password });
//     }, 800);
//   };

//   return (
//     <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

//       {/* LEFT – Branding */}
//       <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-green-700 to-emerald-900 text-white p-10">
//         <motion.div
//           initial={{ opacity: 0, y: 40 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="max-w-md text-center"
//         >
//           <Sprout className="w-24 h-24 mx-auto mb-6 text-white/90" />

//           <h2 className="text-4xl font-tinos font-bold mb-4">
//             Welcome Back
//           </h2>

//           <p className="text-lg text-green-100">
//             Login to manage your farm purchases and sales.
//           </p>
//         </motion.div>
//       </div>

//       {/* RIGHT – Login Form */}
//       <div className="flex items-center justify-center p-8 bg-white">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="w-full max-w-md"
//         >
//           <h1 className="text-3xl font-tinos font-bold mb-2 text-center">
//             Sign In to FarmEasy
//           </h1>
//           <p className="text-center text-gray-600 mb-8">
//             Access your account
//           </p>

//           <form onSubmit={handleSubmit} className="space-y-5">

//             {/* Email */}
//             <div>
//               <label className="block mb-1 font-medium">Email</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="farmer@email.com"
//                   className="w-full h-12 pl-10 border rounded-md focus:ring-2 focus:ring-green-500"
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block mb-1 font-medium">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter password"
//                   className="w-full h-12 pl-10 border rounded-md focus:ring-2 focus:ring-green-500"
//                 />
//               </div>
//             </div>

//             {/* Forgot Password */}
//             <div className="text-right text-sm">
//               <Link
//                 to="/forgot-password"
//                 className="text-green-600 hover:underline"
//               >
//                 Forgot password?
//               </Link>
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full h-12 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
//             >
//               {isLoading ? "Signing In..." : "Sign In"}
//             </button>
//           </form>

//           {/* Register Link */}
//           <p className="text-center text-sm text-gray-600 mt-6">
//             Don’t have an account?{" "}
//             <Link
//               to="/register"
//               className="text-green-600 font-medium hover:underline"
//             >
//               Create one
//             </Link>
//           </p>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Login;


import { useState } from "react";
import "../Css/Login.css";
import "../Css/Login3.css";

const SS0Buttons = () => (
  <div className="SSo">
    <a className="fa-brands fa-phone" />
    <a className="fa-brands fa-google" />
    <a className="fa-brands fa-instagram" />
  </div>
);

const Hero = ({ type, active, title, text, buttonText, onClick }) => (
  <div className={`hero ${type} ${active ? "active" : ""}`}>
    <h2>{title}</h2>
    <p>{text}</p>
    <button type="button" onClick={onClick}>
      {buttonText}
    </button>
  </div>
);

const AuthForm = ({ type, active, title, children }) => (
  <div className={`form ${type} ${active ? "active" : ""}`}>
    <h2>{title}</h2>
    <SS0Buttons />
    <p>Or use your email address</p>
    <form>{children}</form>
  </div>
);

export const Login = () => {
  const [view, setView] = useState("signup");
  const isSignup = view === "signup";

  const toggleView = () =>
    setView(isSignup ? "signin" : "signup");

  return (
  <div className="login-page">
    <div className="card">
      <div
        className="card-bg"
        style={{
          transform: `translateX(${isSignup ? "0%" : "100%"})`,
        }}
      />

      <Hero
        type="signup"
        active={isSignup}
        title="Welcome Back!"
        text="Sign in to track your most recent investment gains."
        buttonText="SIGN IN"
        onClick={toggleView}
      />

      <AuthForm
        type="signup"
        active={isSignup}
        title="Create Account"
      >
        <input type="text" placeholder="Username" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button>SIGN UP</button>
      </AuthForm>

      <Hero
        type="signin"
        active={!isSignup}
        title="Hey There!"
        text="Start your journey here and begin earning now."
        buttonText="SIGN UP"
        onClick={toggleView}
      />

      <AuthForm
        type="signin"
        active={!isSignup}
        title="Sign In"
      >
        <input type="text" placeholder="Email / Username" />
        <input type="password" placeholder="Password" />
        <button>SIGN IN</button>
      </AuthForm>
    </div>
  </div>
);

};
