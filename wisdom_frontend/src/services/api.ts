import axios from "axios";
import { auth } from "@/lib/firebase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for automatic retry on transient auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 403 or 401 and we haven't retried enough yet
    // We allow up to 2 retries at this level
    if ((error.response?.status === 403 || error.response?.status === 401) && (!originalRequest._retryCount || originalRequest._retryCount < 2)) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      // Exponential backoff for retries: 1s, 2s
      const delay = originalRequest._retryCount * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Force token refresh
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (tokenError) {
          console.error("Failed to refresh token during retry:", tokenError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
