import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { LanguageProvider } from "./context/language/LanguageContext";

const App = () => {
  return (
    <LanguageProvider>
      <CartProvider>
        <WishlistProvider>
          <AppRoutes />
        </WishlistProvider>
      </CartProvider>
    </LanguageProvider>
  );
};

export default App;







