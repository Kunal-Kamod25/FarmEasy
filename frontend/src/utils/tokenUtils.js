// tokenUtils.js - Handle JWT token lifecycle

/**
 * Decode JWT without verification (for client-side expiry check only)
 * DO NOT use for security - only checks local expiration
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (err) {
    console.error("Token decode error:", err);
    return null;
  }
};

/**
 * Check if token has expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp is in seconds, multiply by 1000 for milliseconds
  const expiryTime = decoded.exp * 1000;
  const now = new Date().getTime();
  
  return now >= expiryTime;
};

/**
 * Clear token and user from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Check if user is authenticated and token is valid
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  if (isTokenExpired(token)) {
    clearAuthData();
    return false;
  }
  return true;
};

/**
 * Get time remaining until token expires (in seconds)
 */
export const getTokenTimeRemaining = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  
  const expiryTime = decoded.exp * 1000;
  const now = new Date().getTime();
  return Math.max(0, Math.floor((expiryTime - now) / 1000));
};
