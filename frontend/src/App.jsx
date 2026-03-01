
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* User */
import UserLayout from "./components/Layout/UserLayout";
import Home from "./Pages/Home";
import Profile from "./Pages/Profile";

/* Auth */
import Login from "./components/Common/Login";
import Register from "./components/Common/RegisterPage";

/* Admin */
import AdminLayout from "./components/Admin/AdminLayout";
import AdminHomePage from "./Pages/AdminHomePage";

/* Vendor */
import VendorLayout from "./Pages/Vendor/VendorLayout";
import VendorDashboard from "./Pages/Vendor/VendorDashboard";
import VendorProducts from "./Pages/Vendor/VendorProducts";
import VendorAddProduct from "./Pages/Vendor/VendorAddProduct";
import VendorOrders from "./Pages/Vendor/VendorOrders";
import VendorSales from "./Pages/Vendor/VendorSales";
import VendorProfile from "./Pages/Vendor/VendorProfile";

/* Protected Routes */
import VendorRoute from "./routes/VendorRoute";

/* Wishlist */
import Wishlist from "./components/Products/wishlist";
import ProductDetails from "./Pages/ProductDetails";
import CustomerService from "./Pages/CustomerService";
import Support from "./Pages/Support";
import ContactUs from "./Pages/ContactUs";
import AboutUs from "./Pages/AboutUs";

/* Cart Context */
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

const App = () => {
  return (
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Routes>

            {/* USER ROUTES */}
            <Route element={<UserLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/customer-service" element={<CustomerService />} />
              <Route path="/support" element={<Support />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Route>

            {/* AUTH */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ADMIN */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminHomePage />} />
            </Route>

            {/* VENDOR */}
            <Route path="/vendor" element={<VendorRoute><VendorLayout /></VendorRoute>}>
              <Route index element={<VendorDashboard />} />
              <Route path="products" element={<VendorProducts />} />
              <Route path="add-product" element={<VendorAddProduct />} />
              <Route path="orders" element={<VendorOrders />} />
              <Route path="sales" element={<VendorSales />} />
              <Route path="profile" element={<VendorProfile />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  );
};

export default App;