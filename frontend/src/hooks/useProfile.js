// hooks/useProfile.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';

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
        const token = localStorage.getItem("token");

        if (!storedUser || !token) {
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch(
                    `${API_URL}/api/profile/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
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
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(
                `${API_URL}/api/profile/update`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
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
                `${API_URL}/api/profile/upload-avatar`,
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