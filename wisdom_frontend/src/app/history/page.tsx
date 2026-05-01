"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Clock
} from "lucide-react";

interface HistoryEntry {
  topic: string;
  enunciado: string;
  is_correct: boolean;
  created_at: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      const fetchHistory = async () => {
        try {
          const response = await api.get("/history/");
          setHistory(response.data);
        } catch (err) {
          console.error("Erro ao buscar histórico:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-slate-400 font-medium">Recuperando memórias...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar para o Mapa
        </button>

        <div className="flex items-center gap-4 mb-12">
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Seu Histórico</h1>
            <p className="text-slate-400">Acompanhe sua evolução e revise seus desafios passados.</p>
          </div>
        </div>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-500 italic">Nenhum registro encontrado. Comece a explorar as dungeons!</p>
            </div>
          ) : (
            history.map((entry, index) => (
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
                  <p className="text-white font-medium line-clamp-1">{entry.enunciado}</p>
                </div>

                <div className={`flex items-center gap-2 font-bold px-4 py-2 rounded-xl border ${
                  entry.is_correct 
                    ? "bg-green-500/10 border-green-500/30 text-green-500" 
                    : "bg-red-500/10 border-red-500/30 text-red-500"
                }`}>
                  {entry.is_correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {entry.is_correct ? "Correto" : "Incorreto"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
