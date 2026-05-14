"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/services/api";
import Toast, { ToastType } from "@/components/Toast";

interface Profile {
  user: {
    username: string;
    email: string;
  };
  xp: number;
  gold: number;
  level: number;
  streak_count: number;
  total_normal_dungeons_completed: number;
  total_elite_dungeons_completed: number;
  hp: number;
  max_hp: number;
  theme_color: string;
  font_size: string;
  metadata?: {
    xp_multiplier?: number;
    equipped_item?: {
      id: number;
      name: string;
      is_broken: boolean;
      current_charges: number;
      max_charges: number;
      activatable: boolean;
      effect_type: string;
      xp_bonus: number;
    };
    [key: string]: any;
  };
}

const colorMap = {
  amber: { primary: "#f59e0b", hover: "#d97706", glow: "rgba(245, 158, 11, 0.5)" },
  emerald: { primary: "#10b981", hover: "#059669", glow: "rgba(16, 185, 129, 0.5)" },
  rose: { primary: "#f43f5e", hover: "#e11d48", glow: "rgba(244, 63, 94, 0.5)" },
  blue: { primary: "#3b82f6", hover: "#2563eb", glow: "rgba(59, 130, 246, 0.5)" },
  purple: { primary: "#a855f7", hover: "#9333ea", glow: "rgba(168, 85, 247, 0.5)" },
};

const fontSizeMap = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showToast: (message: string, type?: ToastType) => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  refreshProfile: async () => {},
  isDarkMode: true,
  toggleDarkMode: () => {},
  showToast: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile/");
      setProfile(response.data);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile();
    }
  };

  const toggleDarkMode = () => {
    // Disabled for now, forcing dark mode
  };

  useEffect(() => {
    // Force dark mode only
    document.documentElement.classList.add("dark");

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (profile) {
      const colors = colorMap[profile.theme_color as keyof typeof colorMap] || colorMap.amber;
      const fontSize = fontSizeMap[profile.font_size as keyof typeof fontSizeMap] || fontSizeMap.medium;

      document.documentElement.style.setProperty("--brand-primary", colors.primary);
      document.documentElement.style.setProperty("--brand-primary-hover", colors.hover);
      document.documentElement.style.setProperty("--brand-primary-glow", colors.glow);
      document.documentElement.style.setProperty("--font-size-base", fontSize);
    }
  }, [profile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, isDarkMode, toggleDarkMode, showToast }}>
      {children}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
