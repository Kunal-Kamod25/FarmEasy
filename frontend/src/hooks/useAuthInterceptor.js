// useAuthInterceptor.js - Hook to setup auth interceptor with navigate
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clearAuthData } from '../utils/tokenUtils';

/**
 * Hook to setup axios response interceptor with navigate
 * Use this in the root layout or main app component that has access to Router
 */
export const useAuthInterceptor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || "An error occurred";

        if (status === 401 || status === 403) {
          console.error("❌ Auth error (403):", message);
          
          // Clear token
          clearAuthData();
          
          // Dispatch custom event to show auth modal
          window.dispatchEvent(new CustomEvent("farmeasy:auth-required", {
            detail: { message: message || "Please login again" }
          }));
          
          // Redirect to login after a short delay
          setTimeout(() => navigate("/login"), 500);
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);
};
