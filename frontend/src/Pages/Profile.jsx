import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSidebar from "../components/Profile/ProfileSidebar";
import ProfileContent from "../components/Profile/ProfileContent";

const Profile = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        bio: "",
        role: ""
    });

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
                            phone: latestUser.phone_number
                        };

                        setUser(formattedUser);
                        localStorage.setItem("user", JSON.stringify(formattedUser));

                        setFormData({
                            fullname: formattedUser.fullname || "",
                            email: formattedUser.email || "",
                            phone: formattedUser.phone || "",
                            address: formattedUser.address || "",
                            city: formattedUser.city || "",
                            state: formattedUser.state || "",
                            pincode: formattedUser.pincode || "",
                            bio: formattedUser.bio || "",
                            role: formattedUser.role || "customer"
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
                body: JSON.stringify({
                    userId: user.id,
                    ...formData
                }),
            });

            if (response.ok) {
                const updatedUser = { ...user, ...formData };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
                setIsEditing(false);
                setMessage({ type: "success", text: "Profile updated successfully!" });
            } else {
                setMessage({ type: "error", text: "Failed to update profile." });
            }
        } catch {
            setMessage({ type: "error", text: "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">

                <div className="mt-10 flex flex-col lg:flex-row gap-8">

                    <ProfileSidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        navigate={navigate}
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
                    />

                </div>
            </div>
        </div>
    );
};

export default Profile;