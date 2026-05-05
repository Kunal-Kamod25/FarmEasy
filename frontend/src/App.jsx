import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { LanguageProvider } from "./context/language/LanguageContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastProvider } from "./context/ToastContext";
import { setupAxiosInterceptors } from "./utils/axiosConfig";

const App = () => {
  useEffect(() => {
    // Setup axios interceptors for auth error handling (without navigate, it will dispatch events)
    setupAxiosInterceptors(null);
  }, []);
  return (
    <LanguageProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </LanguageProvider>
  );
};

export default App;







