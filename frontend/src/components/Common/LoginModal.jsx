import { useNavigate } from "react-router-dom";
import { X, LogIn, UserPlus, ShieldCheck } from "lucide-react";

const LoginModal = ({ message = "Login required", onClose }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate("/login");
  };

  const handleSignup = () => {
    onClose();
    navigate("/register");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
            <ShieldCheck size={28} className="text-emerald-600" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-center text-lg font-bold text-slate-800 mb-1">
          Sign in to continue
        </h2>
        <p className="text-center text-sm text-slate-500 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogin}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
          >
            <LogIn size={16} />
            Login
          </button>
          <button
            onClick={handleSignup}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-sm transition-all"
          >
            <UserPlus size={16} />
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
