"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { 
  Sword, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Trophy,
  Coins,
  Timer,
  Flame,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import Header from "@/components/Header";
import MathRenderer from "@/components/MathRenderer";

interface Question {
  enunciado: string;
  opcoes: string[];
  hash: string;
  resposta_correta?: string;
}

interface DungeonState {
  current_dungeon: { id: number; title: string; topic: string } | null;
  room: { order: number };
  question_index: number;
  question: Question;
  completed?: boolean;
}

export default function DungeonPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const dungeonType = searchParams.get("type") || "normal";
  const router = useRouter();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  
  const [state, setState] = useState<DungeonState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<{ 
    is_correct: boolean; 
    xp: number; 
    gold: number;
    room_completed: boolean;
    dungeon_completed: boolean;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // HUD States
  const [seconds, setSeconds] = useState(0);
  const [combo, setCombo] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDungeonState = async () => {
    setLoading(true);
    setSelectedOption(null);
    setResult(null);
    setSeconds(0);
    try {
      const response = await api.get(`/dungeon/current/?topic=${id}&type=${dungeonType}`);
      setState(response.data);
    } catch (err) {
      console.error("Erro ao buscar estado da masmorra:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchDungeonState();
    }
  }, [user, authLoading, id, dungeonType]);

  // Timer Logic
  useEffect(() => {
    if (state && !result && !loading) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, result, loading]);

  const handleSubmit = async () => {
    if (!selectedOption || !state) return;

    setSubmitting(true);
    try {
      const response = await api.post("/answer/", {
        topic: id,
        type: dungeonType,
        hash: state.question.hash,
        selected_answer: selectedOption,
        correct_answer: state.question.resposta_correta,
        time_spent_ms: seconds * 1000
      });
      
      const isCorrect = response.data.is_correct;
      setResult({
        is_correct: isCorrect,
        xp: response.data.xp_gained,
        gold: response.data.gold_gained,
        room_completed: response.data.room_completed,
        dungeon_completed: response.data.dungeon_completed
      });

      if (isCorrect) {
        setCombo(prev => prev + 1);
        refreshProfile();
      } else {
        setCombo(0);
      }
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (combo > 0) {
      if (confirm("Sua sequência de acertos (Combo) será perdida se você sair agora! Deseja continuar?")) {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
        <p className="text-slate-400 font-medium">Preparando desafio...</p>
      </div>
    );
  }

  if (state?.completed) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <Header />
        <div className="max-w-3xl mx-auto p-8 text-center mt-20">
          <Trophy className="w-20 h-20 text-brand-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Masmorra Concluída!</h1>
          <p className="text-slate-400 mb-8">Você superou todos os desafios desta semana. Retorne em breve para novas aventuras!</p>
          <button onClick={() => router.push("/")} className="bg-brand-primary text-slate-950 px-8 py-3 rounded-xl font-bold">Voltar ao Mapa</button>
        </div>
      </div>
    );
  }

  const roomProgress = ((state?.question_index || 0) / 10) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header />
      <div className="p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
        
        {/* Top HUD */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Mapa
          </button>

          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full shadow-lg">
              <Flame className={`w-5 h-5 ${combo > 0 ? "text-orange-500 animate-pulse" : "text-slate-600"}`} />
              <span className="font-bold text-sm">Combo: {combo}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full shadow-lg">
              <Timer className="w-5 h-5 text-brand-primary" />
              <span className="font-mono font-bold text-sm">Tempo: {seconds}s</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Progress Bar */}
          <div className="h-2 bg-slate-800 w-full" role="progressbar" aria-valuenow={roomProgress} aria-valuemin={0} aria-valuemax={100}>
            <div 
              className="h-full bg-brand-primary shadow-brand transition-all duration-500"
              style={{ width: `${roomProgress}%` }}
            ></div>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-8">
              <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest rounded-full">
                {state?.current_dungeon?.title}
              </span>
              <span className="text-slate-400 font-bold text-sm">
                Sala {state?.room.order}/10
              </span>
            </div>

            <div className="mb-10 flex justify-center">
              <MathRenderer tex={state?.question.enunciado || ""} className="text-xl md:text-3xl font-bold text-white leading-relaxed text-center" />
            </div>

            <div className="grid grid-cols-1 gap-4 mb-10">
              {state?.question.opcoes.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !result && setSelectedOption(option)}
                  disabled={!!result}
                  className={`
                    w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between group
                    ${selectedOption === option 
                      ? "border-brand-primary bg-brand-primary/5 text-white" 
                      : "border-slate-800 bg-slate-950 hover:border-slate-600 text-slate-400"}
                  `}
                >
                  <MathRenderer tex={option} displayMode={false} className="font-medium text-lg" />
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                    ${selectedOption === option ? "border-brand-primary bg-brand-primary" : "border-slate-700"}
                  `}>
                    {selectedOption === option && <div className="w-2 h-2 bg-slate-950 rounded-full" />}
                  </div>
                </button>
              ))}
            </div>

            {!result ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedOption || submitting}
                className="w-full bg-brand-primary hover:bg-brand-hover disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Enviar Resposta
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className={`p-6 rounded-2xl border flex items-center gap-4 ${
                  result.is_correct ? "bg-green-500/10 border-green-500/50 text-green-500" : "bg-red-500/10 border-red-500/50 text-red-500"
                }`}>
                  {result.is_correct ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                  <div>
                    <h3 className="font-bold text-xl">{result.is_correct ? "Excelente!" : "Quase lá!"}</h3>
                    <p className="text-sm opacity-80">
                      {result.is_correct 
                        ? "Precisão cirúrgica no pensamento!" 
                        : "Um erro é apenas um passo para o aprendizado. Tente novamente!"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
                    <Trophy className="text-brand-primary" />
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase">XP</div>
                      <div className="text-xl font-bold text-white">+{result.xp}</div>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
                    <Coins className="text-yellow-500" />
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase">Ouro</div>
                      <div className="text-xl font-bold text-white">+{result.gold}</div>
                    </div>
                  </div>
                </div>

                {result.room_completed && (
                  <div className="p-4 bg-brand-primary/10 border border-brand-primary/30 rounded-xl text-brand-primary flex items-center gap-3 justify-center animate-bounce">
                    <Flame className="w-6 h-6" />
                    <span className="font-bold">Sala Concluída! Ofensiva Mantida!</span>
                  </div>
                )}

                <button
                  onClick={fetchDungeonState}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                >
                  Continuar Jornada
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Active Attributes (Phase 3 visual) */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-60 hover:opacity-100 transition-opacity">
           <div className="text-xs font-bold text-slate-500 uppercase border-l-2 border-brand-primary pl-3">
             XP por questão: <span className="text-white">10</span>
           </div>
           <div className="text-xs font-bold text-slate-500 uppercase border-l-2 border-brand-primary pl-3">
             XP por sala: <span className="text-white">100</span>
           </div>
           <div className="text-xs font-bold text-slate-500 uppercase border-l-2 border-yellow-500 pl-3">
             Ouro por questão: <span className="text-white">5</span>
           </div>
           <div className="text-xs font-bold text-slate-500 uppercase border-l-2 border-blue-500 pl-3">
             Mult. XP: <span className="text-white">1.0x</span>
           </div>
        </div>

        </div>
      </div>
    </div>
  );
}
