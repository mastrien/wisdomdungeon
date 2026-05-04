"use client";

import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { 
  Trophy, 
  ChevronLeft, 
  Lock, 
  CheckCircle2, 
  Gift, 
  Star,
  Loader2,
  Coins,
  Palette
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Reward {
  type: "theme" | "gold" | "item";
  id?: string;
  name?: string;
  amount?: number;
  description: string;
}

interface LevelReward {
  level: number;
  rewards: Reward[];
}

export default function ProgressionPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rewards, setRewards] = useState<LevelReward[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(true);

  useEffect(() => {
    async function fetchRewards() {
      try {
        const response = await api.get("/progression/rewards/");
        setRewards(response.data);
      } catch (err) {
        console.error("Erro ao carregar trilha de recompensas:", err);
      } finally {
        setLoadingRewards(false);
      }
    }
    fetchRewards();
  }, []);

  if (authLoading || loadingRewards || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
        <p className="text-muted animate-pulse font-medium">Carregando jornada...</p>
      </div>
    );
  }

  const currentXP = profile.xp;
  const nextLevelXP = profile.next_level_xp || 100;
  const currentLevelThreshold = profile.current_level_xp_threshold || 0;
  
  const xpInCurrentLevel = currentXP - currentLevelThreshold;
  const xpNeededForNext = nextLevelXP - currentLevelThreshold;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar ao Mapa
        </button>

        <section className="bg-card border border-border-main rounded-3xl p-8 mb-12 shadow-xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-brand-primary/10 flex items-center justify-center border-2 border-brand-primary/20 shadow-inner">
              <Trophy className="w-12 h-12 text-brand-primary" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-1">Nível {profile.level}</h1>
              <p className="text-muted mb-6">Mantenha sua jornada para desbloquear novos segredos.</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-brand-primary">{profile.xp} XP Total</span>
                  <span className="text-muted">{nextLevelXP} XP para o Nível {profile.level + 1}</span>
                </div>
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
                  <div 
                    className="h-full bg-brand-primary rounded-full transition-all duration-1000 ease-out shadow-lg shadow-brand-glow"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center md:text-right text-muted italic">
                  Faltam {nextLevelXP - profile.xp} XP para subir de nível!
                </p>
              </div>
            </div>
          </div>
        </section>

        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Star className="w-6 h-6 text-brand-primary fill-brand-primary" />
          Trilha de Recompensas
        </h2>

        <div className="space-y-4">
          {rewards.map((lv) => {
            const isCompleted = profile.level > lv.level;
            const isCurrent = profile.level === lv.level;
            const isLocked = profile.level < lv.level;

            return (
              <div 
                key={lv.level}
                className={`
                  flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300
                  ${isCurrent 
                    ? "border-brand-primary bg-brand-primary/5 shadow-lg scale-[1.02]" 
                    : isCompleted 
                      ? "border-emerald-500/20 bg-emerald-500/5 opacity-80" 
                      : "border-border-main bg-card opacity-60"}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
                  ${isCurrent 
                    ? "bg-brand-primary text-slate-950" 
                    : isCompleted 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-200 dark:bg-slate-800 text-muted"}
                `}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : lv.level}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {lv.rewards.map((reward, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-lg border border-border-main text-sm font-medium"
                      >
                        {reward.type === "gold" && <Coins className="w-4 h-4 text-amber-500" />}
                        {reward.type === "theme" && <Palette className="w-4 h-4 text-brand-primary" />}
                        {reward.type === "item" && <Gift className="w-4 h-4 text-purple-500" />}
                        {reward.description}
                      </div>
                    ))}
                  </div>
                </div>

                {isLocked && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted uppercase">
                    <Lock className="w-4 h-4" />
                    Bloqueado
                  </div>
                )}
                {isCurrent && (
                  <div className="px-3 py-1 bg-brand-primary text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wider animate-pulse">
                    Nível Atual
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
