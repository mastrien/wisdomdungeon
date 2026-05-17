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
  Loader2,
  Flame,
  ShieldAlert,
  Target,
  Shield,
  Camera,
  Lock
} from "lucide-react";
import Header from "@/components/Header";
import NetworkModal from "@/components/NetworkModal";
import AvatarCropper from "@/components/AvatarCropper";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface ProfileData {
  user: {
    username: string;
    email: string;
  };
  xp: number;
  gold: number;
  level: number;
  bio: string;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  streak_count: number;
  total_normal_dungeons_completed: number;
  total_elite_dungeons_completed: number;
}

interface MasteryStat {
  topic: string;
  topic_id: string;
  total_solved: number;
  success_rate: number;
  mastery: number;
}

export default function ProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const { profile: loggedInProfile, loading: authLoading, refreshProfile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [masteryData, setMasteryData] = useState<MasteryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  
  // Avatar States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Network Modal States
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [networkInitialTab, setNetworkInitialTab] = useState<"followers" | "following">("followers");

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
        const [profileRes, masteryRes] = await Promise.all([
          api.get(`/profile/${username}/`),
          api.get(`/mastery/?username=${username}`)
        ]);
        
        setProfileData(profileRes.data);
        setMasteryData(masteryRes.data);
        setEditBio(profileRes.data.bio || "");
        setEditUsername(profileRes.data.user.username);
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
// ... existing handleFollow ...
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("A imagem deve ter no máximo 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!loggedInProfile) return;
    setIsUploading(true);
    setSelectedImage(null);

    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${loggedInProfile.firebase_uid}.jpg`);
      await uploadBytes(storageRef, croppedBlob);
      const downloadURL = await getDownloadURL(storageRef);

      // 2. Update Backend
      await api.patch('/profile/', { avatar_url: downloadURL });
      
      // 3. Update local state immediately to end the spinner
      setProfileData(prev => prev ? { ...prev, avatar_url: downloadURL } : null);
      setIsUploading(false); // Stop spinner early

      // 4. Background sync context
      refreshProfile().catch(err => console.error("Erro ao sincronizar contexto:", err));
      
    } catch (err) {
      console.error("Erro ao salvar avatar:", err);
      alert("Falha ao salvar o novo avatar. Tente novamente.");
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
// ...
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
          <div className="grid grid-cols-1 md:grid-cols-[128px_1fr_auto] items-center md:items-end gap-6">
            {/* Avatar Container */}
            <div className="flex justify-center relative">
              <div className="w-32 h-32 aspect-square rounded-full bg-card border-4 border-background flex items-center justify-center shadow-2xl overflow-hidden ring-1 ring-border-main shrink-0 relative group/avatar">
                {profileData.avatar_url ? (
                  <img 
                    src={profileData.avatar_url} 
                    alt={profileData.user.username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-4xl font-black text-brand-primary">
                    {profileData.user.username[0].toUpperCase()}
                  </div>
                )}

                {isOwner && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                    {profileData.level >= 5 ? (
                      <label className="cursor-pointer p-3 bg-brand-primary rounded-full text-slate-950 hover:scale-110 transition-transform shadow-lg" aria-label="Alterar foto">
                        <Camera className="w-6 h-6" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </label>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-white p-2 text-center pointer-events-none">
                        <Lock className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Nível 5</span>
                      </div>
                    )}
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center md:text-left pb-2 min-w-0">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-3 truncate max-w-full">
                  <span className="truncate">{profileData.user.username}</span>
                  <span className="text-xs uppercase tracking-[0.2em] px-2 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-md shrink-0">
                    LVL {profileData.level}
                  </span>
                </h1>
                
                {!isOwner && loggedInProfile && (
                  <button 
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-6 py-1.5 rounded-full font-bold text-sm transition-all border shrink-0 ${
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
                <button 
                  onClick={() => { setNetworkInitialTab("followers"); setIsNetworkModalOpen(true); }}
                  className="flex items-center gap-2 hover:text-brand-primary transition-colors group"
                >
                  <span className="text-foreground font-bold group-hover:text-brand-primary transition-colors">{profileData.followers_count}</span>
                  Seguidores
                </button>
                <button 
                  onClick={() => { setNetworkInitialTab("following"); setIsNetworkModalOpen(true); }}
                  className="flex items-center gap-2 hover:text-brand-primary transition-colors group"
                >
                  <span className="text-foreground font-bold group-hover:text-brand-primary transition-colors">{profileData.following_count}</span>
                  Seguindo
                </button>
              </div>

              <p className="text-muted font-medium flex items-center justify-center md:justify-start gap-2 truncate">
                <UserIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">{profileData.bio || "Este aventureiro ainda não escreveu sua lenda."}</span>
              </p>
            </div>

            {isOwner && (
              <div className="flex justify-center md:justify-end pb-2 shrink-0">
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

        {/* Engagement Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-card/50 border border-border-main p-8 rounded-3xl backdrop-blur-sm group hover:border-brand-primary/30 transition-colors">
            <Flame className="w-8 h-8 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
            <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Ofensiva Atual</div>
            <div className="text-3xl font-black text-foreground">{profileData.streak_count} Dias</div>
          </div>
          
          <div className="bg-card/50 border border-border-main p-8 rounded-3xl backdrop-blur-sm group hover:border-brand-primary/30 transition-colors">
            <Trophy className="w-8 h-8 text-brand-primary mb-4 group-hover:scale-110 transition-transform" />
            <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Masmorras Normais</div>
            <div className="text-3xl font-black text-foreground">{profileData.total_normal_dungeons_completed}</div>
          </div>

          <div className="bg-card/50 border border-border-main p-8 rounded-3xl backdrop-blur-sm group hover:border-brand-primary/30 transition-colors">
            <ShieldAlert className="w-8 h-8 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
            <div className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Masmorras de Elite</div>
            <div className="text-3xl font-black text-foreground">{profileData.total_elite_dungeons_completed}</div>
          </div>
        </div>

        {/* Top Mastery Dungeons */}
        <div className="mt-12 bg-card border border-border-main rounded-3xl p-8">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-primary" />
            Maestria em Masmorras
          </h3>
          
          <div className="space-y-4">
            {masteryData
              .sort((a, b) => b.mastery - a.mastery)
              .slice(0, 3)
              .map((stat) => (
                <div key={stat.topic_id} className="bg-background border border-border-main p-6 rounded-2xl flex items-center justify-between group hover:border-brand-primary/50 transition-all">
                  <div>
                    <h4 className="font-bold text-foreground text-lg">{stat.topic}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="text-xs font-medium text-muted uppercase tracking-tighter">
                        Resolvidos: <span className="text-foreground">{stat.total_solved}</span>
                      </div>
                      <div className="text-xs font-medium text-muted uppercase tracking-tighter">
                        Taxa: <span className="text-foreground">{stat.success_rate}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Pontos de Maestria</div>
                    <div className="text-2xl font-black text-brand-primary group-hover:scale-110 transition-transform origin-right">
                      {stat.mastery}
                    </div>
                  </div>
                </div>
              ))}
            
            {masteryData.length === 0 && (
              <p className="text-muted text-center py-8">Este aventureiro ainda não conquistou maestria em nenhuma masmorra.</p>
            )}
          </div>
        </div>

        {/* Network Modal */}
        {isNetworkModalOpen && (
          <NetworkModal 
            username={Array.isArray(username) ? username[0] : username}
            onClose={() => setIsNetworkModalOpen(false)}
            initialTab={networkInitialTab}
          />
        )}

        {/* Avatar Cropper Modal */}
        {selectedImage && (
          <AvatarCropper 
            image={selectedImage}
            onCropComplete={handleCropComplete}
            onCancel={() => setSelectedImage(null)}
          />
        )}
      </main>
    </div>
  );
}
