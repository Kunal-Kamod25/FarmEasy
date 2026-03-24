// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import ProfileSidebar from "./ProfileSidebar";
// import ProfileContent from "./ProfileContent";

// const Profile = () => {
//     const [activeTab, setActiveTab] = useState("profile");
//     const [user, setUser] = useState(null);
//     const [isEditing, setIsEditing] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState({ type: "", text: "" });
//     const navigate = useNavigate();

//     const [formData, setFormData] = useState({
//         fullname: "",
//         email: "",
//         phone: "",
//         address: "",
//         city: "",
//         state: "",
//         pincode: "",
//         bio: "",
//         role: ""
//     });

//     useEffect(() => {
//         const storedUser = localStorage.getItem("user");

//         if (!storedUser) {
//             navigate("/login");
//         } else {
//             const userData = JSON.parse(storedUser);
//             setUser(userData);

//             const fetchLatestData = async () => {
//                 try {
//                     const response = await fetch(`http://localhost:5000/api/profile/${userData.id || userData.user_id}`);
//                     if (response.ok) {
//                         const latestUser = await response.json();
//                         const formattedUser = {
//                             ...latestUser,
//                             fullname: latestUser.full_name,
//                             phone: latestUser.phone_number
//                         };

//                         setUser(formattedUser);
//                         localStorage.setItem("user", JSON.stringify(formattedUser));

//                         setFormData({
//                             fullname: formattedUser.fullname || "",
//                             email: formattedUser.email || "",
//                             phone: formattedUser.phone || "",
//                             address: formattedUser.address || "",
//                             city: formattedUser.city || "",
//                             state: formattedUser.state || "",
//                             pincode: formattedUser.pincode || "",
//                             bio: formattedUser.bio || "",
//                             role: formattedUser.role || "customer"
//                         });
//                     }
//                 } catch (error) {
//                     console.error("Failed to fetch user data:", error);
//                 }
//             };

//             fetchLatestData();
//         }
//     }, [navigate]);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleSave = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage({ type: "", text: "" });

//         try {
//             const response = await fetch("http://localhost:5000/api/profile/update", {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     userId: user.id,
//                     ...formData
//                 }),
//             });

//             if (response.ok) {
//                 const updatedUser = { ...user, ...formData };
//                 localStorage.setItem("user", JSON.stringify(updatedUser));
//                 setUser(updatedUser);
//                 setIsEditing(false);
//                 setMessage({ type: "success", text: "Profile updated successfully!" });
//             } else {
//                 setMessage({ type: "error", text: "Failed to update profile." });
//             }
//         } catch {
//             setMessage({ type: "error", text: "Something went wrong. Please try again." });
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!user) return null;

//     return (
//         <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
//             <div className="max-w-6xl mx-auto">

//                 <div className="mt-10 flex flex-col lg:flex-row gap-8">

//                     <ProfileSidebar
//                         activeTab={activeTab}
//                         setActiveTab={setActiveTab}
//                         navigate={navigate}
//                     />

//                     <ProfileContent
//                         activeTab={activeTab}
//                         user={user}
//                         formData={formData}
//                         isEditing={isEditing}
//                         setIsEditing={setIsEditing}
//                         loading={loading}
//                         message={message}
//                         handleInputChange={handleInputChange}
//                         handleSave={handleSave}
//                     />

//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Profile;

// ─────────────────────────────────────────────
//  Profile.jsx  —  Enhanced
//  📁 src/components/profile/Profile.jsx
// ─────────────────────────────────────────────
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import ProfileSidebar from "./ProfileSidebar";
// import ProfileContent from "./ProfileContent";

// const Profile = () => {
//   const [activeTab, setActiveTab] = useState("profile");
//   const [user, setUser]           = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading]     = useState(false);
//   const [message, setMessage]     = useState({ type: "", text: "" });
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     fullname: "", email: "", phone: "",
//     address: "", city: "", state: "",
//     pincode: "", bio: "", role: ""
//   });

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (!storedUser) {
//       navigate("/login");
//     } else {
//       const userData = JSON.parse(storedUser);
//       setUser(userData);

//       const fetchLatestData = async () => {
//         try {
//           const response = await fetch(`http://localhost:5000/api/profile/${userData.id || userData.user_id}`);
//           if (response.ok) {
//             const latestUser = await response.json();
//             const formattedUser = {
//               ...latestUser,
//               fullname: latestUser.full_name,
//               phone: latestUser.phone_number
//             };
//             setUser(formattedUser);
//             localStorage.setItem("user", JSON.stringify(formattedUser));
//             setFormData({
//               fullname: formattedUser.fullname || "",
//               email:    formattedUser.email    || "",
//               phone:    formattedUser.phone    || "",
//               address:  formattedUser.address  || "",
//               city:     formattedUser.city     || "",
//               state:    formattedUser.state    || "",
//               pincode:  formattedUser.pincode  || "",
//               bio:      formattedUser.bio      || "",
//               role:     formattedUser.role     || "customer",
//             });
//           }
//         } catch (error) {
//           console.error("Failed to fetch user data:", error);
//         }
//       };

//       fetchLatestData();
//     }
//   }, [navigate]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ type: "", text: "" });

//     try {
//       const response = await fetch("http://localhost:5000/api/profile/update", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: user.id, ...formData }),
//       });

//       if (response.ok) {
//         const updatedUser = { ...user, ...formData };
//         localStorage.setItem("user", JSON.stringify(updatedUser));
//         setUser(updatedUser);
//         setIsEditing(false);
//         setMessage({ type: "success", text: "Profile updated successfully! 🌿" });
//         setTimeout(() => setMessage({ type: "", text: "" }), 4000);
//       } else {
//         setMessage({ type: "error", text: "Failed to update profile. Please try again." });
//       }
//     } catch {
//       setMessage({ type: "error", text: "Something went wrong. Please try again." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!user) return null;

//   return (
//     <div className="min-h-screen py-10 px-4 md:px-8"
//       style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #f0fdf4 100%)" }}>

//       {/* Decorative background blobs */}
//       <div className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-30 pointer-events-none"
//         style={{ background: "radial-gradient(circle, #bbf7d0 0%, transparent 70%)", zIndex: 0 }} />
//       <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
//         style={{ background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)", zIndex: 0 }} />

//       <div className="max-w-6xl mx-auto relative z-10">

//         {/* Page Title */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-black text-slate-800"
//             style={{ fontFamily: "'Lora', Georgia, serif" }}>
//             My Account
//           </h1>
//           <p className="text-slate-400 text-sm mt-1"
//             style={{ fontFamily: "'Lora', Georgia, serif" }}>
//             Manage your profile, orders and security settings
//           </p>
//         </div>

//         <div className="flex flex-col lg:flex-row gap-6">
//           <ProfileSidebar
//             activeTab={activeTab}
//             setActiveTab={setActiveTab}
//             navigate={navigate}
//             user={user}
//           />
//           <ProfileContent
//             activeTab={activeTab}
//             user={user}
//             formData={formData}
//             isEditing={isEditing}
//             setIsEditing={setIsEditing}
//             loading={loading}
//             message={message}
//             handleInputChange={handleInputChange}
//             handleSave={handleSave}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

// ─────────────────────────────────────────────
//  Profile.jsx  —  Enhanced + Fixed
//  📁 src/components/profile/Profile.jsx
// ─────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSidebar from "./ProfileSidebar";
import ProfileContent from "./ProfileContent";
import { API_URL } from '../../config';

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser]           = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "", email: "",   phone: "",
    address:  "", city:  "",   state: "",
    pincode:  "", bio:   "",   role:  "",
    dob:      "", gender: "",
  });

  const [notifPrefs, setNotifPrefs] = useState([
    { key: "orders",   label: "Order Updates",        sub: "Shipping, delivery & cancellation alerts", on: true  },
    { key: "offers",   label: "Offers & Deals",        sub: "Flash sales, coupons & discounts",         on: true  },
    { key: "arrivals", label: "New Arrivals",          sub: "New seeds, fertilizers & tools added",     on: true  },
    { key: "restock",  label: "Back in Stock",         sub: "When your wishlist items are available",   on: false },
    { key: "email",    label: "Email Notifications",   sub: "Receive all updates via email",            on: true  },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      const fetchLatestData = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/profile/${userData.id || userData.user_id}`);
          if (response.ok) {
            const latestUser = await response.json();
            const formattedUser = {
              ...latestUser,
              fullname: latestUser.full_name,
              phone:    latestUser.phone_number,
            };
            setUser(formattedUser);
            localStorage.setItem("user", JSON.stringify(formattedUser));
            setFormData({
              fullname: formattedUser.fullname || "",
              email:    formattedUser.email    || "",
              phone:    formattedUser.phone    || "",
              address:  formattedUser.address  || "",
              city:     formattedUser.city     || "",
              state:    formattedUser.state    || "",
              pincode:  formattedUser.pincode  || "",
              bio:      formattedUser.bio      || "",
              role:     formattedUser.role     || "customer",
              dob:      formattedUser.dob      || "",
              gender:   formattedUser.gender   || "",
            });
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      };
      fetchLatestData();
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await fetch("http://localhost:5000/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...formData }),
      });
      if (response.ok) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        setMessage({ type: "success", text: "Profile updated successfully! 🌿" });
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      } else {
        setMessage({ type: "error", text: "Failed to update profile. Please try again." });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const toggleNotif = (key) =>
    setNotifPrefs(prev => prev.map(n => n.key === key ? { ...n, on: !n.on } : n));

  if (!user) return null;

  return (
    <div className="min-h-screen py-10 px-4 md:px-8"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #f0fdf4 100%)" }}>
      <div className="max-w-6xl mx-auto">

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800"
            style={{ fontFamily: "'Lora', Georgia, serif" }}>
            My Account
          </h1>
          <p className="text-slate-400 text-sm mt-1"
            style={{ fontFamily: "'Lora', Georgia, serif" }}>
            Manage your profile, orders and security settings
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <ProfileSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            navigate={navigate}
            user={user}
          />
          <ProfileContent
            activeTab={activeTab}
            user={user}
            formData={formData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            loading={loading}
            message={message}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
            notifPrefs={notifPrefs}
            toggleNotif={toggleNotif}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;