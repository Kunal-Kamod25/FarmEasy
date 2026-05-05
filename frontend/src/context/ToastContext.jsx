import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, X, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <ToastItem 
                {...toast} 
                onClose={() => removeToast(toast.id)} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ message, type, onClose }) => {
  const styles = {
    success: "bg-[#0a2a1d]/90 border-emerald-500/50 text-emerald-100",
    error: "bg-rose-950/90 border-rose-500/50 text-rose-100",
    info: "bg-blue-950/90 border-blue-500/50 text-blue-100",
  };

  const icons = {
    success: <CheckCircle className="text-emerald-400" size={20} />,
    error: <AlertCircle className="text-rose-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
  };

  return (
    <div className={`flex items-center gap-4 px-6 py-4 rounded-[1.25rem] border backdrop-blur-xl shadow-2xl min-w-[320px] max-w-[420px] ${styles[type]}`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-semibold leading-relaxed">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition"
      >
        <X size={16} className="opacity-50" />
      </button>
    </div>
  );
};
