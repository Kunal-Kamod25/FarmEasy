const RAW_API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== "undefined" && window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://farmeasy-9ojh.onrender.com");

export const API_URL = RAW_API_URL.replace(/\/+$/, "");

// Handles both Cloudinary full URLs and legacy /uploads/... paths
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
};