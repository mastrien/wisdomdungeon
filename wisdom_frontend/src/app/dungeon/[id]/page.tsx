"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import MathRenderer from "@/components/MathRenderer";
import InventoryOverlay from "@/components/InventoryOverlay";
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
  ArrowRight,
  Heart,
  Package
} from "lucide-react";

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
  revealed_wrong?: string;
}

export default function DungeonPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const dungeonType = searchParams.get("type") || "normal";
  const router = useRouter();
  const { user, loading: authLoading, refreshProfile, profile, showToast } = useAuth();
  
  const [state, setState] = useState<DungeonState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<{ 
    is_correct: boolean; 
    xp: number; 
    gold: number;
    room_completed: boolean;
    dungeon_completed: boolean;
    correct_answer?: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [inventoryMessage, setInventoryMessage] = useState<string | null>(null);

  // Track previous level for level up toast
  const prevLevelRef = useRef<number | null>(null);
  useEffect(() => {
    if (profile && prevLevelRef.current !== null && profile.level > prevLevelRef.current) {
      showToast(`PARABÉNS! Você subiu para o nível ${profile.level}!`, "success");
    }
    if (profile) prevLevelRef.current = profile.level;
  }, [profile?.level, showToast]);

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
        dungeon_completed: response.data.dungeon_completed,
        correct_answer: response.data.correct_answer
      });

      await refreshProfile();
      if (isCorrect) {
        setCombo(prev => prev + 1);
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
        <p className="text-muted font-medium">Preparando desafio...</p>
      </div>
    );
  }

  if (state?.completed) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="max-w-3xl mx-auto p-8 text-center mt-20">
          <Trophy className="w-20 h-20 text-brand-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Masmorra Concluída!</h1>
          <p className="text-muted mb-8">Você superou todos os desafios desta semana. Retorne em breve para novas aventuras!</p>
          <button onClick={() => router.push("/")} className="bg-brand-primary text-slate-950 px-8 py-3 rounded-xl font-bold">Voltar ao Mapa</button>
        </div>
      </div>
    );
  }

  const roomProgress = ((state?.question_index || 0) / 10) * 100;

  const onUseItem = async (message: string) => {
    setInventoryMessage(message);
    await refreshProfile();
    setTimeout(() => setInventoryMessage(null), 3000);
  };

  const handleUseActiveItem = async () => {
    if (!profile?.metadata?.equipped_item) return;
    const item = profile.metadata.equipped_item;
    
    // Only allow manual activation if activatable
    if (!item.activatable) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/inventory/${item.id}/use/`);
      showToast(response.data.message, "success");
      
      // Re-fetch dungeon state to see revealed_wrong
      const topic = searchParams.get("topic") || state?.current_dungeon?.topic;
      const res = await api.get(`/dungeon/current/?topic=${topic}&type=${dungeonType}`);
      setState(res.data);
      
      await refreshProfile();    // Refresh metadata (charges)
    } catch (err: any) {
      showToast(err.response?.data?.message || "Erro ao usar item", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const activeItem = profile?.metadata?.equipped_item;
  const isItemActive = state?.revealed_wrong;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
        
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Mapa
          </button>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setShowInventory(true)}
              className="flex items-center gap-2 bg-card border border-border-main px-4 py-2 rounded-full shadow-lg hover:border-brand-primary transition-colors group"
            >
              <Package className="w-5 h-5 text-brand-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-foreground/80 dark:text-foreground">Inventário</span>
            </button>
            <div className="flex items-center gap-2 bg-card border border-border-main px-4 py-2 rounded-full shadow-lg" aria-label="Vidas">
              <div className="flex gap-1">
                {[...Array(profile?.max_hp || 3)].map((_, i) => (
                  <Heart 
                    key={i} 
                    className={`w-4 h-4 ${i < (profile?.hp || 0) ? "text-red-500 fill-red-500" : "text-slate-300 dark:text-slate-700"}`} 
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-card border border-border-main px-4 py-2 rounded-full shadow-lg">
              <Flame className={`w-5 h-5 ${combo > 0 ? "text-orange-500 animate-pulse" : "text-slate-400 dark:text-muted/50"}`} />
              <span className="font-bold text-sm text-foreground/80 dark:text-foreground">Combo: {combo}</span>
            </div>
            <div className="flex items-center gap-2 bg-card border border-border-main px-4 py-2 rounded-full shadow-lg">
              <Timer className="w-5 h-5 text-brand-primary" />
              <span className="font-mono font-bold text-sm text-foreground/80 dark:text-foreground">Tempo: {seconds}s</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border-main rounded-3xl overflow-hidden shadow-2xl">
          {/* Progress Bar */}
          <div className="h-2 bg-slate-200 dark:bg-slate-800 w-full" role="progressbar" aria-valuenow={roomProgress} aria-valuemin={0} aria-valuemax={100}>
            <div 
              className="h-full bg-brand-primary shadow-brand transition-all duration-500"
              style={{ width: `${roomProgress}%` }}
            ></div>
          </div>

          <div className="p-8 md:p-12">
            {inventoryMessage && (
              <div className="mb-6 p-4 bg-brand-primary/20 border border-brand-primary/40 rounded-xl text-brand-primary font-bold text-center animate-in slide-in-from-top-4">
                {inventoryMessage}
              </div>
            )}
            <div className="flex items-center justify-between mb-8">
              <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest rounded-full">
                {state?.current_dungeon?.title}
              </span>
              <span className="text-foreground/80 dark:text-muted font-bold text-sm">
                Sala {state?.room.order}/10
              </span>
            </div>

            <div className="mb-10 flex justify-center">
              <MathRenderer tex={state?.question.enunciado || ""} className="text-xl md:text-3xl font-bold text-foreground leading-relaxed text-center" />
            </div>

            <div className="grid grid-cols-1 gap-4 mb-10">
              {state?.question.opcoes.map((option, index) => {
                const isSelected = selectedOption === option;
                const isCorrect = result?.correct_answer === option;
                const isWrong = isSelected && !result?.is_correct;
                const isRevealedWrong = state?.revealed_wrong === option;
                
                return (
                  <button
                    key={index}
                    onClick={() => !result && setSelectedOption(option)}
                    disabled={!!result || isRevealedWrong}
                    className={`
                      w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between group
                      ${isSelected ? "border-brand-primary bg-brand-primary/5 text-slate-950 dark:text-brand-primary" : "border-border-main bg-background hover:border-slate-400 dark:hover:border-slate-600 text-muted dark:text-dim"}
                      ${result && isCorrect ? "border-green-500 bg-green-500/10 text-green-900 dark:text-green-400" : ""}
                      ${result && isWrong ? "border-red-500 bg-red-500/10 text-red-900 dark:text-red-400" : ""}
                      ${isRevealedWrong ? "opacity-30 grayscale cursor-not-allowed border-dashed" : ""}
                    `}
                  >
                    <MathRenderer tex={option} displayMode={false} className="font-medium text-lg" />
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                      ${isSelected ? "border-brand-primary bg-brand-primary" : "border-slate-300 dark:border-slate-700"}
                      ${result && isCorrect ? "border-green-500 bg-green-500" : ""}
                      ${result && isWrong ? "border-red-500 bg-red-500" : ""}
                      ${isRevealedWrong ? "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900" : ""}
                    `}>
                      {(isSelected || (result && isCorrect)) && <div className="w-2 h-2 bg-white dark:bg-slate-950 rounded-full" />}
                      {isRevealedWrong && <XCircle className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Item Slot */}
            <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 border border-border-main rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${activeItem ? "bg-brand-primary/10 border-brand-primary/30" : "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700"}`}>
                  <ShieldAlert className={`w-5 h-5 ${activeItem ? "text-brand-primary" : "text-slate-400"}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {activeItem ? activeItem.name : "Nenhum item equipado"}
                  </h4>
                  <div className="flex items-center gap-2">
                    {activeItem ? (
                      <>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          activeItem.is_broken ? "text-red-500" : (isItemActive ? "text-green-500" : "text-brand-primary")
                        }`}>
                          {activeItem.is_broken ? "Quebrado" : (isItemActive ? "Efeito Ativo" : "Pronto")}
                        </span>
                        {activeItem.max_charges > 0 && (
                          <span className="text-[10px] text-muted font-bold">
                            Cargas: {activeItem.current_charges}/{activeItem.max_charges}
                          </span>
                        )}
                        {activeItem.xp_bonus > 0 && (
                           <span className="text-[10px] text-orange-500 font-bold">
                             Bonus: +{(activeItem.xp_bonus * 100).toFixed(0)}% XP
                           </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-dim font-bold uppercase">Visite a loja para se equipar</span>
                    )}
                  </div>
                </div>
              </div>
              
              {activeItem?.activatable && !result && (
                <button
                  onClick={handleUseActiveItem}
                  disabled={submitting || isItemActive || activeItem.current_charges <= 0 || activeItem.is_broken}
                  className={`
                    px-4 py-2 rounded-xl text-xs font-bold transition-all
                    ${isItemActive 
                      ? "bg-green-500 text-white cursor-default" 
                      : (activeItem.current_charges > 0 && !activeItem.is_broken
                          ? "bg-brand-primary text-slate-950 hover:scale-105 active:scale-95 shadow-lg" 
                          : "bg-slate-200 dark:bg-slate-800 text-dim cursor-not-allowed")}
                  `}
                >
                  {isItemActive ? "Ativado" : "Ativar"}
                </button>
              )}
            </div>

            {!result ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedOption || submitting}
                className="w-full bg-brand-primary hover:bg-brand-hover disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-dim text-slate-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
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
                  result.is_correct ? "bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-500" : "bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-500"
                }`}>
                  {result.is_correct ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                  <div>
                    <h3 className="font-bold text-xl">{result.is_correct ? "Excelente!" : "Quase lá!"}</h3>
                    <div className="text-sm opacity-80">
                      {result.is_correct 
                        ? "Precisão cirúrgica no pensamento!" 
                        : `A resposta correta era: `}
                      {!result.is_correct && <MathRenderer tex={result.correct_answer || ""} displayMode={false} className="font-bold" />}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-card dark:bg-slate-800/50 p-4 rounded-xl border border-border-main flex items-center gap-3">
                    <Trophy className="text-brand-primary" />
                    <div>
                      <div className="text-xs text-foreground/60 dark:text-muted font-bold uppercase">XP</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-foreground">+{result.xp}</div>
                    </div>
                  </div>
                  <div className="flex-1 bg-card dark:bg-slate-800/50 p-4 rounded-xl border border-border-main flex items-center gap-3">
                    <Coins className="text-yellow-600 dark:text-yellow-500" />
                    <div>
                      <div className="text-xs text-foreground/60 dark:text-muted font-bold uppercase">Ouro</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-foreground">+{result.gold}</div>
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
                  className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
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
           <div className="text-xs font-bold text-foreground/60 dark:text-muted uppercase border-l-2 border-brand-primary pl-3">
             XP por questão: <span className="text-slate-900 dark:text-foreground">10</span>
           </div>
           <div className="text-xs font-bold text-foreground/60 dark:text-muted uppercase border-l-2 border-brand-primary pl-3">
             XP por sala: <span className="text-slate-900 dark:text-foreground">100</span>
           </div>
           <div className="text-xs font-bold text-foreground/60 dark:text-muted uppercase border-l-2 border-yellow-500 pl-3">
             Ouro por questão: <span className="text-slate-900 dark:text-foreground">5</span>
           </div>
           <div className="text-xs font-bold text-foreground/60 dark:text-muted uppercase border-l-2 border-blue-500 pl-3">
             Mult. XP: <span className="text-slate-900 dark:text-foreground">{profile?.metadata?.xp_multiplier || "1.0"}x</span>
           </div>
        </div>

        </div>
      </div>

      {showInventory && (
        <InventoryOverlay 
          onClose={() => setShowInventory(false)} 
          onUseItem={onUseItem}
        />
      )}
    </div>
  );
}
