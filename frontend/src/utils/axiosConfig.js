// axiosConfig.js - Configure axios interceptors for auth & error handling
import axios from "axios";
import { isTokenExpired, clearAuthData } from './tokenUtils';

/**
 * Setup axios interceptors
 * - Add Authorization header if token exists
 * - Handle 401/403 errors by refreshing token or redirecting to login
 */
export const setupAxiosInterceptors = (navigate) => {
  // Track if we're already refreshing to avoid multiple refresh calls
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    isRefreshing = false;
    failedQueue = [];
  };

  // Request interceptor: add token to all requests
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      
      // Check if token has expired
      if (token && isTokenExpired(token)) {
        console.warn("⚠️ Token expired, clearing auth");
        clearAuthData();
        // Don't add expired token
      } else if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: handle auth errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      const config = error.config;

      if (status === 401 || status === 403) {
        console.error("❌ Auth error:", message);
        
        // If token refresh already in progress, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
              return axios(config);
            }
            return Promise.reject(error);
          }).catch(err => Promise.reject(err));
        }

        // Check if this is a token expiration error
        if (message.includes("expired") || message.includes("Invalid token")) {
          isRefreshing = true;
          
          const token = localStorage.getItem("token");
          if (token) {
            // Try to refresh the token
            return axios.post(
              `${process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || 'https://farmeasy-9ojh.onrender.com'}/api/auth/refresh`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ).then((res) => {
              const newToken = res.data.token;
              localStorage.setItem("token", newToken);
              
              // Retry original request with new token
              config.headers.Authorization = `Bearer ${newToken}`;
              processQueue(null, newToken);
              return axios(config);
            }).catch((err) => {
              // Refresh failed, clear and redirect
              clearAuthData();
              processQueue(err, null);
              
              if (navigate) {
                window.dispatchEvent(new CustomEvent("farmeasy:auth-required", {
                  detail: { message: "Session expired. Please login again." }
                }));
                setTimeout(() => navigate("/login"), 500);
              }
              return Promise.reject(err);
            });
          }
        }

        // Clear token and redirect to login
        clearAuthData();
        
        if (navigate) {
          // Dispatch custom event to show auth modal
          window.dispatchEvent(new CustomEvent("farmeasy:auth-required", {
            detail: { message: message || "Please login again" }
          }));
          
          // Redirect to login after a short delay
          setTimeout(() => navigate("/login"), 500);
        }
      }

      return Promise.reject(error);
    }
  );
};
