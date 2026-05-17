"use client";

import { useEffect, useState } from "react";
import { Loader2, X, Users, UserPlus } from "lucide-react";
import api from "@/services/api";
import Link from "next/navigation"; // Wait, next/link is better for navigation
import { useRouter } from "next/navigation";

interface NetworkUser {
  username: string;
  level: number;
}

interface NetworkModalProps {
  username: string;
  onClose: () => void;
  initialTab?: "followers" | "following";
}

export default function NetworkModal({ username, onClose, initialTab = "followers" }: NetworkModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ followers: NetworkUser[]; following: NetworkUser[] } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNetwork = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/profile/${username}/network/`);
        setData(response.data);
      } catch (err) {
        console.error("Erro ao carregar rede:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNetwork();
  }, [username]);

  const list = activeTab === "followers" ? data?.followers : data?.following;

  const navigateToProfile = (targetUsername: string) => {
    onClose();
    router.push(`/profile/${targetUsername}`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border border-border-main rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border-main flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            {activeTab === "followers" ? <UserPlus className="w-6 h-6 text-brand-primary" /> : <Users className="w-6 h-6 text-brand-primary" />}
            Rede de Aventureiros
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-muted" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-main">
          <button 
            onClick={() => setActiveTab("followers")}
            className={`flex-1 py-4 font-bold text-sm transition-all relative ${
              activeTab === "followers" ? "text-brand-primary" : "text-muted hover:text-foreground"
            }`}
          >
            Seguidores ({data?.followers.length ?? 0})
            {activeTab === "followers" && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-primary rounded-t-full" />}
          </button>
          <button 
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-4 font-bold text-sm transition-all relative ${
              activeTab === "following" ? "text-brand-primary" : "text-muted hover:text-foreground"
            }`}
          >
            Seguindo ({data?.following.length ?? 0})
            {activeTab === "following" && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-primary rounded-t-full" />}
          </button>
        </div>

        {/* Content */}
        <div className="h-[400px] overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-muted">
              <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
              <p className="font-medium">Consultando registros...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {list && list.length > 0 ? (
                list.map((user) => (
                  <button
                    key={user.username}
                    onClick={() => navigateToProfile(user.username)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-background border border-border-main hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-brand-primary border border-border-main">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-foreground group-hover:text-brand-primary transition-colors">
                          {user.username}
                        </div>
                        <div className="text-[10px] text-muted font-bold uppercase tracking-widest">
                          Nível {user.level}
                        </div>
                      </div>
                    </div>
                    <div className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs uppercase tracking-tighter">
                      Ver Perfil →
                    </div>
                  </button>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Nenhum rastro encontrado</h3>
                  <p className="text-sm text-muted">Este aventureiro ainda não possui conexões nesta aba.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
