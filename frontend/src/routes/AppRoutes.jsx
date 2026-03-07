import { BrowserRouter, Routes, Route } from "react-router-dom";

/* User Layout + Pages */
import UserLayout from "../components/Layout/UserLayout";
import Home from "../components/HomeSections/Home";
import Profile from "../components/profile/Profile";

/* Auth */
import Login from "../components/Auth/Login";
import Register from "../components/Auth/RegisterPage";

/* Admin */
import AdminLayout from "../components/Admin/AdminLayout";
import AdminHomePage from "../Pages/AdminHomePage";

/* Vendor */
import VendorLayout from "../components/Vendor/VendorLayout";
import VendorDashboard from "../components/Vendor/VendorDashboard";
import VendorProducts from "../components/Vendor/VendorProducts";
import VendorAddProduct from "../components/Vendor/VendorAddProduct";
import VendorOrders from "../components/Vendor/VendorOrders";
import VendorSales from "../components/Vendor/VendorSales";
import VendorProfile from "../components/Vendor/VendorProfile";
import VendorEditProduct from "../components/Vendor/vendorEditProduct";

/* Protected Routes */
import VendorRoute from "./VendorRoute";

/* Products */
import Wishlist from "../components/Products/wishlist";
import AllProductsPage from "../components/Products/AllProductsPage";

/* Pages */
import ProductDetailPage from "../Pages/ProductDetails";
import CustomerService from "../Pages/CustomerService";
import Support from "../Pages/Support";
import ContactUs from "../Pages/ContactUs";
import AboutUs from "../Pages/AboutUs";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── USER / MAIN ROUTES ── */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />

          {/* All products page with filters - this is the "View All" page */}
          <Route path="/products" element={<AllProductsPage />} />

          {/* Single product detail */}
          <Route path="/product/:id" element={<ProductDetailPage />} />

          <Route path="/customer-service" element={<CustomerService />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>

        {/* ── AUTH ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── ADMIN ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
        </Route>

        {/* ── VENDOR (protected - only logged in vendors can access) ── */}
        <Route
          path="/vendor"
          element={
            <VendorRoute>
              <VendorLayout />
            </VendorRoute>
          }
        >
          {/* dashboard with tabs for My Products and My Orders */}
          <Route index element={<VendorDashboard />} />

          {/* products management */}
          <Route path="products" element={<VendorProducts />} />
          <Route path="add-product" element={<VendorAddProduct />} />
          <Route path="products/edit/:id" element={<VendorEditProduct />} />

          {/* orders, sales, profile */}
          <Route path="orders" element={<VendorOrders />} />
          <Route path="sales" element={<VendorSales />} />
          <Route path="profile" element={<VendorProfile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;