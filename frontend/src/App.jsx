import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "./components/Layout/UserLayout";
import Register from "./components/Common/RegisterPage.jsx";
import Login from "./components/Common/LoginPage.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserLayout />} />
        {/* User Register */}
        <Route path="/Register" element={<Register />} />
        {/* User Login */}
        <Route path="/Login" element={<Login />} />
        <Route>{/* Admin Layout */}</Route>
      </Routes> 
    </BrowserRouter>
  );
};

export default App;
