const RAW_API_URL = import.meta.env.VITE_API_URL || "https://farmeasy-9ojh.onrender.com";

export const API_URL = RAW_API_URL.replace(/\/+$/, "");