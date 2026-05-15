"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { History, Play, Target, CheckCircle2, Loader2, Lock, Trophy, Flame, ShieldAlert, Coins, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import api from "@/services/api";

interface DailyStat {
  topic: string;
  topic_id: string;
  total_solved: number;
  success_rate: number;
}

interface Dungeon {
  id: number;
  title: string;
  type: 'normal' | 'elite';
  topic: string;
  progress: number;
  is_locked: boolean;
  unlock_reason?: string;
  level_required: number;
}

export default function HomePage() {
  const { user, loading: authLoading, profile } = useAuth();
  const router = useRouter();
  const [dailyStats, setDailyStats] = useState<Record<string, DailyStat>>({});
  const [weeklyDungeons, setWeeklyDungeons] = useState<Dungeon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user && profile) { // Wait for BOTH user and profile
      const fetchData = async () => {
        try {
          const [statsRes, dungeonsRes] = await Promise.all([
            api.get("/mastery/?today=true"),
            api.get("/dungeons/")
          ]);
          
          const statsMap = statsRes.data.reduce((acc: Record<string, any>, stat: any) => {
            const key = `${stat.topic_id}_${stat.dungeon_type}`;
            acc[key] = stat;
            return acc;
          }, {});
          
          setDailyStats(statsMap);
          setWeeklyDungeons(dungeonsRes.data);
        } catch (err) {
          console.error("Erro ao buscar dados:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user, profile, authLoading, router]);

  if (authLoading || (user && !profile) || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
        <p className="text-muted font-medium">Preparando o mapa...</p>
      </div>
    );
  }

  const totalSolvedToday = Object.values(dailyStats).reduce((sum, s) => sum + s.total_solved, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-foreground mb-2">Mundo da Matemática</h2>
            <p className="text-muted text-lg">Selecione uma masmorra e supere os desafios semanais.</p>
          </div>
          
          {profile && (
            <div className="flex gap-4">
              <div className="bg-card border border-border-main px-6 py-3 rounded-2xl flex items-center gap-3">
                <Flame className="text-orange-500 w-6 h-6" />
                <div>
                  <div className="text-[10px] text-muted font-bold uppercase">Ofensiva</div>
                  <div className="text-xl font-black text-foreground">{profile.streak_count} Dias</div>
                </div>
              </div>
              <div className="bg-card border border-border-main px-6 py-3 rounded-2xl flex items-center gap-3">
                <Trophy className="text-brand-primary w-6 h-6" />
                <div>
                  <div className="text-[10px] text-muted font-bold uppercase">Normais</div>
                  <div className="text-xl font-black text-foreground">{profile.total_normal_dungeons_completed}</div>
                </div>
              </div>
              <div className="bg-card border border-border-main px-6 py-3 rounded-2xl flex items-center gap-3">
                <ShieldAlert className="text-purple-500 w-6 h-6" />
                <div>
                  <div className="text-[10px] text-muted font-bold uppercase">Elite</div>
                  <div className="text-xl font-black text-foreground">{profile.total_elite_dungeons_completed}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dungeon List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeklyDungeons.map((dungeon) => {
            const isElite = dungeon.type === 'elite';
            const isLocked = dungeon.is_locked;
            const progress = dungeon.progress || 0;
            
            return (
              <div 
                key={dungeon.id}
                onClick={() => !isLocked && router.push(`/dungeon/${dungeon.topic}?type=${dungeon.type}`)}
                className={`
                  group bg-card border border-border-main p-6 rounded-3xl transition-all relative overflow-hidden flex flex-col justify-between min-h-[240px]
                  ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:border-brand-primary/50 cursor-pointer'}
                `}
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 group-hover:text-brand-primary transition-opacity">
                  {isLocked ? <Lock className="w-12 h-12" /> : <Play className="w-12 h-12 fill-current" />}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${isElite ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'}`}>
                      {dungeon.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-1">{dungeon.title}</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 text-muted">
                      <Target className="w-3 h-3" />
                      <span>Progresso: {progress}/100</span>
                    </div>
                    {dailyStats[`${dungeon.topic}_${dungeon.type}`] && dailyStats[`${dungeon.topic}_${dungeon.type}`].total_solved > 0 && (
                      <div className="flex items-center gap-1.5 text-brand-primary">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Hoje: {dailyStats[`${dungeon.topic}_${dungeon.type}`].total_solved} ({dailyStats[`${dungeon.topic}_${dungeon.type}`].success_rate}%)</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${isElite ? 'bg-purple-500' : 'bg-brand-primary'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  
                  <button 
                    disabled={isLocked}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex flex-col items-center justify-center gap-0.5
                      ${isLocked ? 'bg-slate-100 dark:bg-slate-800/50 text-dim cursor-not-allowed border border-border-main' : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-brand-primary group-hover:text-slate-950 text-foreground dark:text-white cursor-pointer'}
                    `}
                  >
                    {isLocked ? (
                      <>
                        <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest">
                          <Lock className="w-3 h-3" /> Bloqueado
                        </div>
                        <div className="text-[9px] opacity-70 normal-case font-medium">{dungeon.unlock_reason}</div>
                      </>
                    ) : (
                      'Explorar'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Store Section */}
        <div 
          onClick={() => router.push("/shop")}
          className="mt-12 p-12 bg-card border-2 border-border-main rounded-3xl text-center group hover:border-brand-primary/50 transition-all cursor-pointer shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:text-brand-primary transition-opacity">
            <ShoppingBag className="w-24 h-24" />
          </div>
          
          <div className="bg-card w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border-main group-hover:scale-110 transition-transform relative z-10">
            <Coins className="text-yellow-500 w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2 relative z-10">Loja de Itens</h3>
          <p className="text-muted max-w-md mx-auto relative z-10">
            Troque seu ouro acumulado por consumíveis e itens poderosos para facilitar suas jornadas nas masmorras.
          </p>
          <div className="mt-8 flex justify-center relative z-10">
            <span className="bg-brand-primary text-slate-950 px-8 py-3 rounded-xl font-bold flex items-center gap-2 group-hover:bg-brand-hover transition-colors">
              Explorar Mercado <ShoppingBag className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* Stats & History Shortcut */}
        <div className="mt-12 p-8 bg-card border border-border-main rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Seu Histórico</h3>
            <p className="text-dim">
              {totalSolvedToday > 0 
                ? `Você já resolveu ${totalSolvedToday} desafios hoje. Continue assim!` 
                : "Aventure-se em uma masmorra para começar sua jornada hoje."}
            </p>
          </div>
          <button 
            onClick={() => router.push("/history")}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground dark:text-white px-8 py-3 rounded-xl font-bold transition-all border border-border-main shadow-xl"
          >
            <History className="w-5 h-5" />
            Ver Histórico Geral
          </button>

        </div>
      </main>
    </div>
  );
}
