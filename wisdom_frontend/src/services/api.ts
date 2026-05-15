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
    
    // If error is 403 or 401 and we haven't retried yet
    if ((error.response?.status === 403 || error.response?.status === 401) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Wait a bit for backend/firebase synchronization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force token refresh
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken(true);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
