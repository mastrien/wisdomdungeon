"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Clock,
  ChevronDown,
  Trophy,
  Target,
  Sword
} from "lucide-react";
import Header from "@/components/Header";
import MathRenderer from "@/components/MathRenderer";

interface HistoryEntry {
  topic: string;
  enunciado: string;
  is_correct: boolean;
  created_at: string;
}

interface MasteryStat {
  topic: string;
  topic_id: string;
  total_solved: number;
  success_rate: number;
  mastery: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [masteryStats, setMasteryStats] = useState<MasteryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchHistory = async (currentOffset: number, append = false) => {
    try {
      if (append) setLoadingMore(true);
      const response = await api.get(`/history/?offset=${currentOffset}`);
      if (append) {
        setHistory(prev => [...prev, ...response.data.results]);
      } else {
        setHistory(response.data.results);
      }
      setHasMore(response.data.has_more);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchMastery = async () => {
    try {
      const response = await api.get("/mastery/");
      setMasteryStats(response.data);
    } catch (err) {
      console.error("Erro ao buscar maestria:", err);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      setLoading(true);
      Promise.all([fetchHistory(0), fetchMastery()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user, authLoading, router]);

  const handleLoadMore = () => {
    const nextOffset = offset + 20;
    setOffset(nextOffset);
    fetchHistory(nextOffset, true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
        <p className="text-slate-400 font-medium">Recuperando memórias...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header />
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <Clock className="w-8 h-8 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Salas de Treinamento</h1>
            <p className="text-slate-400">Analise seu progresso e revise sua jornada nas masmorras.</p>
          </div>
        </div>

        {/* Mastery Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {masteryStats.map((stat) => (
            <div key={stat.topic_id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-brand-primary/30 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sword className="w-16 h-16 text-brand-primary rotate-12" />
              </div>
              <h3 className="text-lg font-bold text-white mb-4">{stat.topic}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Target className="w-4 h-4" />
                    <span>Resolvidos</span>
                  </div>
                  <span className="text-white font-bold">{stat.total_solved}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Taxa de Acerto</span>
                  </div>
                  <span className={`font-bold ${stat.success_rate >= 70 ? 'text-green-500' : 'text-brand-primary'}`}>
                    {stat.success_rate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Trophy className="w-4 h-4" />
                    <span>Maestria</span>
                  </div>
                  <span className="text-brand-primary font-black">{stat.mastery} XP</span>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary transition-all duration-1000" 
                    style={{ width: `${stat.success_rate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* General History Section */}
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-slate-500" />
          Histórico Geral
        </h2>
        
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-500 italic">Nenhum registro encontrado. Comece a explorar as dungeons!</p>
            </div>
          ) : (
            <>
              {history.map((entry, index) => (
                <div 
                  key={index}
                  className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-700">
                        {entry.topic.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(entry.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="text-white font-medium line-clamp-2">
                      <MathRenderer tex={entry.enunciado} displayMode={false} className="inline" />
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 font-bold px-4 py-2 rounded-xl border shrink-0 ${
                    entry.is_correct 
                      ? "bg-green-500/10 border-green-500/30 text-green-500" 
                      : "bg-red-500/10 border-red-500/30 text-red-500"
                  }`}>
                    {entry.is_correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {entry.is_correct ? "Correto" : "Incorreto"}
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="pt-8 pb-12 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-slate-700 disabled:opacity-50"
                  >
                    {loadingMore ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronDown className="w-5 h-5" />}
                    Ver Mais Desafios
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
