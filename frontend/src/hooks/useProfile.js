// hooks/useProfile.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/*
    Custom Hook: Handles
    - Fetching profile
    - Updating profile
    - Uploading profile picture
    - Loading & error states
*/

const useProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Load user on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        const userData = JSON.parse(storedUser);

        const fetchProfile = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/api/profile/${userData.id}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    localStorage.setItem("user", JSON.stringify(data));
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
            }
        };

        fetchProfile();
    }, [navigate]);

    // Update Profile Info
    const updateProfile = async (formData) => {
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch(
                "http://localhost:5000/api/profile/update",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.id,
                        ...formData,
                    }),
                }
            );

            if (res.ok) {
                const updatedUser = { ...user, ...formData };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setMessage("Profile updated successfully!");
            } else {
                setMessage("Failed to update profile.");
            }
        } catch {
            setMessage("Server error.");
        }

        setLoading(false);
    };

    // Upload Profile Picture
    const uploadProfilePicture = async (file) => {
        const formData = new FormData();
        formData.append("profile_pic", file);
        formData.append("userId", user.id);

        try {
            const res = await fetch(
                "http://localhost:5000/api/profile/upload-avatar",
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (res.ok) {
                const data = await res.json();
                const updatedUser = { ...user, profile_pic: data.profile_pic };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error("Avatar upload failed:", err);
        }
    };

    return {
        user,
        loading,
        message,
        updateProfile,
        uploadProfilePicture,
    };
};

export default useProfile;