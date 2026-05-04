"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { History, Play, Target, CheckCircle2, Loader2, Lock, Trophy, Flame } from "lucide-react";
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
    } else if (user) {
      const fetchData = async () => {
        try {
          const [statsRes, dungeonsRes] = await Promise.all([
            api.get("/mastery/?today=true"),
            api.get("/dungeons/")
          ]);
          
          const statsMap = statsRes.data.reduce((acc: any, stat: DailyStat) => {
            acc[stat.topic_id] = stat;
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
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-slate-400 font-medium">Preparando o mapa...</p>
      </div>
    );
  }

  const totalSolvedToday = Object.values(dailyStats).reduce((sum, s) => sum + s.total_solved, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white mb-2">Mundo da Matemática</h2>
            <p className="text-slate-400 text-lg">Selecione uma masmorra e supere os desafios semanais.</p>
          </div>
          
          {profile && (
            <div className="flex gap-4">
              <div className="bg-slate-900/50 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3">
                <Flame className="text-orange-500 w-6 h-6" />
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Ofensiva</div>
                  <div className="text-xl font-black text-white">{profile.streak_count} Dias</div>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3">
                <Trophy className="text-amber-500 w-6 h-6" />
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Masmorras</div>
                  <div className="text-xl font-black text-white">{profile.total_dungeons_completed} Finalizadas</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dungeon List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeklyDungeons.map((dungeon) => {
            const stat = dailyStats[dungeon.topic];
            const isElite = dungeon.type === 'elite';
            
            return (
              <div 
                key={dungeon.id}
                onClick={() => !isElite && router.push(`/dungeon/${dungeon.topic}`)}
                className={`
                  group bg-slate-900 border border-slate-800 p-6 rounded-3xl transition-all relative overflow-hidden flex flex-col justify-between min-h-[240px]
                  ${isElite ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:border-amber-500/50 cursor-pointer'}
                `}
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 group-hover:text-amber-500 transition-opacity">
                  {isElite ? <Lock className="w-12 h-12" /> : <Play className="w-12 h-12 fill-current" />}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${isElite ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'}`}>
                      {dungeon.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{dungeon.title}</h3>
                  <p className="text-slate-500 text-sm">{String(dungeon.topic).replace("_", " ")}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Target className="w-3.5 h-3.5" />
                      <span>Progresso: {stat?.total_solved || 0}/100</span>
                    </div>
                  </div>
                  
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${isElite ? 'bg-purple-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min((stat?.total_solved || 0), 100)}%` }}
                    />
                  </div>
                  
                  <button 
                    disabled={isElite}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2
                      ${isElite ? 'bg-slate-800 text-slate-500' : 'bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-white'}
                    `}
                  >
                    {isElite ? (
                      <><Lock className="w-4 h-4" /> Bloqueado</>
                    ) : (
                      'Explorar'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats & History Shortcut */}
        <div className="mt-12 p-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Seu Histórico</h3>
            <p className="text-slate-400">
              {totalSolvedToday > 0 
                ? `Você já resolveu ${totalSolvedToday} desafios hoje. Continue assim!` 
                : "Aventure-se em uma masmorra para começar sua jornada hoje."}
            </p>
          </div>
          <button 
            onClick={() => router.push("/history")}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-slate-700 shadow-xl"
          >
            <History className="w-5 h-5" />
            Ver Histórico Geral
          </button>
        </div>
      </main>
    </div>
  );
}
