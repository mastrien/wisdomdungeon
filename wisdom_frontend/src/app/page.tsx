"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { History, Play, Target, CheckCircle2, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import api from "@/services/api";

interface DailyStat {
  topic: string;
  topic_id: string;
  total_solved: number;
  success_rate: number;
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dailyStats, setDailyStats] = useState<Record<string, DailyStat>>({});
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      const fetchDailyStats = async () => {
        try {
          const response = await api.get("/mastery/?today=true");
          const statsMap = response.data.reduce((acc: any, stat: DailyStat) => {
            acc[stat.topic_id] = stat;
            return acc;
          }, {});
          setDailyStats(statsMap);
        } catch (err) {
          console.error("Erro ao buscar estatísticas diárias:", err);
        } finally {
          setLoadingStats(false);
        }
      };
      fetchDailyStats();
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-slate-400 font-medium">Preparando o mapa...</p>
      </div>
    );
  }

  const dungeons = [
    { id: "algebra_basica", name: "Torre de Álgebra", desc: "Equações de 1º grau" },
    { id: "calculo_basico", name: "Cripta das Derivadas", desc: "Cálculo diferencial básico" },
    { id: "geometria", name: "Labirinto de Formas", desc: "Áreas e volumes" },
    { id: "algebra_linear", name: "Fortaleza das Matrizes", desc: "Determinantes e sistemas" },
    { id: "probabilidade", name: "Templo do Acaso", desc: "Probabilidade simples" }
  ];

  const totalSolvedToday = Object.values(dailyStats).reduce((sum, s) => sum + s.total_solved, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-white mb-2">Mundo da Matemática</h2>
          <p className="text-slate-400 text-lg">Selecione uma masmorra e comece seu desafio procedural.</p>
        </div>

        {/* Dungeon List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dungeons.map((dungeon) => {
            const stat = dailyStats[dungeon.id];
            return (
              <div 
                key={dungeon.id}
                onClick={() => router.push(`/dungeon/${dungeon.id}`)}
                className="group bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-amber-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[220px]"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 group-hover:text-amber-500 transition-opacity">
                  <Play className="w-12 h-12 fill-current" />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{dungeon.name}</h3>
                  <p className="text-slate-500 text-sm mb-6">{dungeon.desc}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Target className="w-3.5 h-3.5" />
                      <span>Hoje: {stat?.total_solved || 0}</span>
                    </div>
                    {stat && stat.total_solved > 0 && (
                      <div className={`flex items-center gap-1.5 ${stat.success_rate >= 70 ? 'text-green-500' : 'text-amber-500'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{stat.success_rate}%</span>
                      </div>
                    )}
                  </div>
                  
                  <button className="w-full bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg">
                    Entrar na Masmorra
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats & History Shortcut */}
        <div className="mt-12 p-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Seu Progresso</h3>
            <p className="text-slate-400">
              {totalSolvedToday > 0 
                ? `Você já resolveu ${totalSolvedToday} desafios hoje. Continue assim!` 
                : "Você ainda não completou nenhuma dungeon hoje."}
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
