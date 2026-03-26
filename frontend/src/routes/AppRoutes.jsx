import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLanguage } from "../context/language/LanguageContext";

/* User Layout + Pages */
const UserLayout = lazy(() => import("../components/Layout/UserLayout"));
const Home = lazy(() => import("../components/HomeSections/Home"));
const Profile = lazy(() => import("../components/profile/Profile"));

/* Auth */
const Login = lazy(() => import("../components/Auth/Login"));
const Register = lazy(() => import("../components/Auth/RegisterPage"));
const ForgotPassword = lazy(() => import("../components/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../components/Auth/ResetPassword"));

/* Admin */
const AdminLayout = lazy(() => import("../components/Admin/AdminLayout"));
const AdminHomePage = lazy(() => import("../Pages/AdminHomePage"));

/* Vendor */
const VendorLayout = lazy(() => import("../components/Vendor/VendorLayout"));
const VendorDashboard = lazy(() => import("../components/Vendor/VendorDashboard"));
const VendorProducts = lazy(() => import("../components/Vendor/VendorProducts"));
const VendorAddProduct = lazy(() => import("../components/Vendor/VendorAddProduct"));
const VendorOrders = lazy(() => import("../components/Vendor/VendorOrders"));
const VendorSales = lazy(() => import("../components/Vendor/VendorSales"));
const VendorProfile = lazy(() => import("../components/Vendor/VendorProfile"));
const VendorEditProduct = lazy(() => import("../components/Vendor/vendorEditProduct"));

/* Protected Routes */
const VendorRoute = lazy(() => import("./VendorRoute"));
const AdminRoute = lazy(() => import("./AdminRoute"));

/* Products */
const Wishlist = lazy(() => import("../components/Products/wishlist"));
const AllProductsPage = lazy(() => import("../components/Products/AllProductsPage"));

/* Pages */
const ProductDetailPage = lazy(() => import("../Pages/ProductDetails"));
const CheckoutPage = lazy(() => import("../Pages/Checkout"));
const OrderSuccessPage = lazy(() => import("../Pages/OrderSuccess"));
const MyOrdersPage = lazy(() => import("../Pages/MyOrdersPage"));
const CustomerService = lazy(() => import("../Pages/CustomerService"));
const Support = lazy(() => import("../Pages/Support"));
const ContactUs = lazy(() => import("../Pages/ContactUs"));
const AboutUs = lazy(() => import("../Pages/AboutUs"));

const AppRoutes = () => {
  const { t } = useLanguage();

  const RouteFallback = (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-sm font-semibold">
      {t("common.loading")}
    </div>
  );

  return (
    <BrowserRouter>
      <Suspense fallback={RouteFallback}>
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
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Checkout & Success */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
        </Route>


        {/* ── AUTH ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ── ADMIN ── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
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
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;