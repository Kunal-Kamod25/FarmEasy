import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { LanguageProvider } from "./context/language/LanguageContext";
import { SocketProvider } from "./context/SocketContext";
import { setupAxiosInterceptors } from "./utils/axiosConfig";

const App = () => {
  useEffect(() => {
    // Setup axios interceptors for auth error handling (without navigate, it will dispatch events)
    setupAxiosInterceptors(null);
  }, []);
  return (
    <LanguageProvider>
      <CartProvider>
        <WishlistProvider>
          <SocketProvider>
            <AppRoutes />
          </SocketProvider>
        </WishlistProvider>
      </CartProvider>
    </LanguageProvider>
  );
};

export default App;







