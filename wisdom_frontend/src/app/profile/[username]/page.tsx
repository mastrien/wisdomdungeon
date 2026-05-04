"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { 
  Trophy, 
  Coins, 
  User as UserIcon, 
  Settings, 
  Shield, 
  Loader2,
  Calendar,
  ChevronLeft
} from "lucide-react";
import Header from "@/components/Header";

interface ProfileData {
  user: {
    username: string;
    email: string;
  };
  xp: number;
  gold: number;
  level: number;
  bio: string;
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

export default function ProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const { profile: loggedInProfile, loading: authLoading, refreshProfile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  
  // Edit Profile States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const isOwner = loggedInProfile?.user.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/profile/${username}/`);
        setProfileData(response.data);
        setEditBio(response.data.bio || "");
        setEditUsername(response.data.user.username);
      } catch (err: any) {
        console.error("Erro ao buscar perfil:", err);
        setError(err.response?.status === 404 ? "Aventureiro não encontrado" : "Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const handleFollow = async () => {
    if (!loggedInProfile) return;
    setFollowLoading(true);
    try {
      const response = await api.post(`/profile/${username}/follow/`);
      setProfileData(prev => {
        if (!prev) return null;
        const isFollowingNow = response.data.status === 'following';
        return {
          ...prev,
          is_following: isFollowingNow,
          followers_count: isFollowingNow ? prev.followers_count + 1 : prev.followers_count - 1
        };
      });
    } catch (err) {
      console.error("Erro ao seguir usuário:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await api.patch('/profile/', {
        bio: editBio,
        user: { username: editUsername }
      });
      setProfileData(prev => prev ? { ...prev, ...response.data } : null);
      if (isOwner) {
        // Update auth context if the logged in user changed their own profile
        await refreshProfile();
        if (editUsername !== (Array.isArray(username) ? username[0] : username)) {
          window.location.href = `/profile/${editUsername}`;
        }
      }
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err);
      const serverError = err.response?.data?.user?.username?.[0];
      if (serverError) {
        alert(serverError);
      } else {
        alert("Ocorreu um erro ao atualizar o perfil. Verifique os dados e tente novamente.");
      }
    } finally {
      setEditLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
        <p className="text-muted font-medium">Consultando oráculos...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <Shield className="w-16 h-16 text-slate-300 dark:text-slate-800 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">{error || "Perfil não encontrado"}</h2>
          <p className="text-muted mb-8 text-lg">Parece que este aventureiro ainda não cruzou os portões desta dungeon.</p>
          <button 
            onClick={() => window.location.href = "/"}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground dark:text-white px-8 py-3 rounded-xl font-bold transition-all border border-border-main"
          >
            Voltar para o Mapa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Cover / Backdrop (Placeholder) */}
        <div className="h-48 bg-gradient-to-r from-brand-primary/20 to-slate-100 dark:to-slate-900 rounded-3xl border border-border-main mb-[-4rem] relative z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>

        <div className="relative z-10 px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar Placeholder */}
              <div className="w-32 h-32 rounded-3xl bg-card border-4 border-background flex items-center justify-center shadow-2xl overflow-hidden ring-1 ring-border-main">
                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-4xl font-black text-brand-primary">
                  {profileData.user.username[0].toUpperCase()}
                </div>
              </div>
              
              <div className="text-center md:text-left pb-2">
                <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                  <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3">
                    {profileData.user.username}
                    <span className="text-xs uppercase tracking-[0.2em] px-2 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-md">
                      LVL {profileData.level}
                    </span>
                  </h1>
                  
                  {!isOwner && loggedInProfile && (
                    <button 
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`px-6 py-1.5 rounded-full font-bold text-sm transition-all border ${
                        profileData.is_following 
                        ? "bg-slate-100 dark:bg-slate-800 text-muted dark:text-slate-300 border-border-main hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50" 
                        : "bg-brand-primary text-slate-950 border-brand-primary/30 hover:bg-brand-hover"
                      } disabled:opacity-50`}
                    >
                      {followLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        profileData.is_following ? "Seguindo" : "Seguir"
                      )}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center md:justify-start gap-6 text-sm font-medium text-muted mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-bold">{profileData.followers_count}</span>
                    Seguidores
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-bold">{profileData.following_count}</span>
                    Seguindo
                  </div>
                </div>

                <p className="text-muted font-medium flex items-center justify-center md:justify-start gap-2">
                  <UserIcon className="w-4 h-4" />
                  {profileData.bio || "Este aventureiro ainda não escreveu sua lenda."}
                </p>
              </div>
            </div>

            {isOwner && (
              <div className="flex justify-center md:justify-end pb-2">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground dark:text-white px-6 py-2.5 rounded-xl font-bold transition-all border border-border-main shadow-lg"
                >
                  <Settings className="w-4 h-4" />
                  Editar Perfil
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border-main rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <h2 className="text-2xl font-bold text-foreground mb-6">Forjar Perfil</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-muted uppercase tracking-wider mb-2">Username</label>
                  <input 
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-background border border-border-main rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted uppercase tracking-wider mb-2">Bio</label>
                  <textarea 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={4}
                    className="w-full bg-background border border-border-main rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-brand-primary transition-colors resize-none"
                    placeholder="Conte sua história..."
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground dark:text-white font-bold py-3 rounded-xl transition-all border border-border-main"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 bg-brand-primary hover:bg-brand-hover text-slate-950 font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {editLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Salvar Mudanças
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {isOwner ? (
            <button 
              onClick={() => router.push("/progression")}
              className="bg-card/50 border border-border-main p-8 rounded-3xl backdrop-blur-sm group hover:border-brand-primary/30 transition-all text-left"
            >
              <Trophy className="w-8 h-8 text-brand-primary mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Experiência Total</div>
              <div className="text-3xl font-black text-foreground">{profileData.xp} XP</div>
              <div className="mt-4 text-xs font-bold text-brand-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Ver Trilha de Recompensas
                <ChevronLeft className="w-3 h-3 rotate-180" />
              </div>
            </button>
          ) : (
            <div className="bg-card/50 border border-border-main p-8 rounded-3xl backdrop-blur-sm group hover:border-brand-primary/30 transition-colors">
              <Trophy className="w-8 h-8 text-brand-primary mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Experiência Total</div>
              <div className="text-3xl font-black text-foreground">{profileData.xp} XP</div>
            </div>
          )}
          
          <div className="bg-card/50 border border-border-main p-8 rounded-3xl backdrop-blur-sm group hover:border-brand-primary/30 transition-colors">
            <Coins className="w-8 h-8 text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
            <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Ouro Acumulado</div>
            <div className="text-3xl font-black text-foreground">{profileData.gold}</div>
          </div>

          <div className="bg-card/50 border border-border-main p-8 rounded-3xl backdrop-blur-sm group hover:border-brand-primary/30 transition-colors">
            <Calendar className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
            <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Membro Desde</div>
            <div className="text-3xl font-black text-foreground">MAI 2026</div>
          </div>
        </div>

        {/* Placeholder for achievements or recent activity */}
        <div className="mt-12 bg-card border border-border-main rounded-3xl p-8">
          <h3 className="text-xl font-bold text-foreground mb-6">Conquistas Recentes</h3>
          <div className="flex flex-wrap gap-4">
            {[
              "Iniciante em Álgebra",
              "Matador de Derivadas",
              "Mestre das Matrizes"
            ].map((achievement) => (
              <div key={achievement} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-muted dark:text-dim font-medium border border-border-main">
                {achievement}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
