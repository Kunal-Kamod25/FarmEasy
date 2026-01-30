// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import UserLayout from "./components/Layout/UserLayout";
// import Home from "./Pages/Home";
// import Profile from "./Pages/Profile";
// import Login from "./components/Common/Login";
// import Register from "./components/Common/RegisterPage";
// import AdminLayout from "./components/Admin/AdminLayout";
// import AdminHomePage from "./Pages/AdminHomePage";

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route element={<UserLayout />}>
//           <Route path="/" element={<Home />} />
//           <Route path="/profile" element={<Profile />} />
//         </Route>

//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/admin" element={<AdminLayout />} >
//           <Route index element={<AdminHomePage />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;






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
import VendorLayout from "./components/Vendor/VendorLayout";
import VendorDashboard from "./Pages/Vendor/VendorDashboard";
import VendorProducts from "./Pages/Vendor/VendorProducts";
import VendorAddProduct from "./Pages/Vendor/VendorAddProduct";
import VendorOrders from "./Pages/Vendor/VendorOrders";
import VendorSales from "./Pages/Vendor/VendorSales";
import VendorProfile from "./Pages/Vendor/VendorProfile";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* USER ROUTES */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
        </Route>

        {/* VENDOR */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route index element={<VendorDashboard />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="add-product" element={<VendorAddProduct />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="sales" element={<VendorSales />} />
          <Route path="profile" element={<VendorProfile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;

