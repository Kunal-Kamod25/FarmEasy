import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSidebar from "./ProfileSidebar";
import ProfileContent from "./ProfileContent";
import { API_URL, getImageUrl } from '../../config';

const Profile = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [metrics, setMetrics] = useState({
        total_orders: 0,
        total_spent: 0,
        verification: {
            profile_verified: false,
            email_verified: false,
            phone_verified: false
        }
    });
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
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
            navigate("/login");
        } else {
            const userData = JSON.parse(storedUser);
            setUser(userData);

            const fetchLatestData = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/profile/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.ok) {
                        const latestUser = await response.json();
                        const formattedUser = {
                            ...latestUser,
                            fullname: latestUser.full_name,
                            phone: latestUser.phone_number
                        };

                        setUser(formattedUser);
                        setMetrics({
                            total_orders: latestUser.total_orders || 0,
                            total_spent: latestUser.total_spent || 0,
                            verification: latestUser.verification || {
                                profile_verified: false,
                                email_verified: false,
                                phone_verified: false
                            }
                        });

                        if (latestUser.profile_pic) {
                            setImagePreview(getImageUrl(latestUser.profile_pic));
                        }

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });
        const token = localStorage.getItem("token");

        try {
            // Use FormData to support image upload
            const fd = new FormData();
            fd.append("fullname", formData.fullname);
            fd.append("phone", formData.phone);
            fd.append("address", formData.address);
            fd.append("city", formData.city);
            fd.append("state", formData.state);
            fd.append("pincode", formData.pincode);
            fd.append("bio", formData.bio);

            if (imageFile) {
                fd.append("profile_image", imageFile);
            }

            const response = await fetch(`${API_URL}/api/profile/update`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                    // Don't set Content-Type — browser sets it with boundary for FormData
                },
                body: fd,
            });

            if (response.ok) {
                const profileRes = await fetch(`${API_URL}/api/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (profileRes.ok) {
                    const refreshed = await profileRes.json();
                    const updatedUser = {
                        ...refreshed,
                        fullname: refreshed.full_name,
                        phone: refreshed.phone_number
                    };

                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    setUser(updatedUser);
                    setImageFile(null);

                    if (refreshed.profile_pic) {
                        setImagePreview(getImageUrl(refreshed.profile_pic));
                    }

                    setMetrics({
                        total_orders: refreshed.total_orders || 0,
                        total_spent: refreshed.total_spent || 0,
                        verification: refreshed.verification || {
                            profile_verified: false,
                            email_verified: false,
                            phone_verified: false
                        }
                    });
                }

                setIsEditing(false);
                setMessage({ type: "success", text: "Profile updated successfully!" });
            } else {
                const data = await response.json().catch(() => ({}));
                setMessage({ type: "error", text: data.message || "Failed to update profile." });
            }
        } catch {
            setMessage({ type: "error", text: "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#04110d] py-10 px-4 md:px-8 bg-[radial-gradient(circle_at_top_left,_rgba(134,239,172,0.14),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(45,212,191,0.14),_transparent_28%),linear-gradient(145deg,_#03110c_0%,_#072117_45%,_#0b2d20_100%)]">
            <div className="max-w-6xl mx-auto relative">
                <div className="absolute inset-0 opacity-20 pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:68px_68px]" />

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Profile</h1>
                        <p className="text-white/65 text-sm mt-0.5">Manage your personal details and account settings</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 relative z-10">

                    <ProfileSidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        navigate={navigate}
                    />

                    <ProfileContent
                        activeTab={activeTab}
                        user={user}
                        metrics={metrics}
                        formData={formData}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        loading={loading}
                        message={message}
                        handleInputChange={handleInputChange}
                        handleSave={handleSave}
                        imagePreview={imagePreview}
                        handleImageChange={handleImageChange}
                    />

                </div>
            </div>
        </div>
    );
};

export default Profile;