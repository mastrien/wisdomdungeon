"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { 
  Sword, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Trophy,
  Coins
} from "lucide-react";
import Header from "@/components/Header";
import MathRenderer from "@/components/MathRenderer";

interface Question {
  enunciado: string;
  opcoes: string[];
  resposta_correta: string;
  hash: string;
}

export default function DungeonPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<{ is_correct: boolean; xp: number; gold: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setResult(null);
    try {
      const response = await api.get(`/question/?topic=${id}`);
      setQuestion(response.data);
    } catch (err) {
      console.error("Erro ao buscar questão:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchQuestion();
    }
  }, [user, authLoading, id]);

  const handleSubmit = async () => {
    if (!selectedOption || !question) return;

    setSubmitting(true);
    try {
      const response = await api.post("/question/", {
        topic: id,
        hash: question.hash,
        enunciado: question.enunciado,
        selected_answer: selectedOption,
        correct_answer: question.resposta_correta
      });
      setResult({
        is_correct: response.data.is_correct,
        xp: response.data.xp_gained,
        gold: response.data.gold_gained
      });
      // Atualiza o perfil instantaneamente no Header
      if (response.data.is_correct) {
        refreshProfile();
      }
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-slate-400 font-medium">Preparando desafio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header />
      <div className="p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar para o Mapa
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Progress Bar (Simulada para o MVP) */}
          <div className="h-2 bg-slate-800 w-full">
            <div className="h-full bg-amber-500 w-1/3 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest rounded-full">
                Masmorra: {String(id).replace("_", " ")}
              </span>
            </div>

            <div className="mb-8 flex justify-center">
              <MathRenderer tex={question?.enunciado || ""} className="text-xl md:text-3xl font-bold text-white leading-relaxed text-center" />
            </div>

            <div className="grid grid-cols-1 gap-4 mb-10">
              {question?.opcoes.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !result && setSelectedOption(option)}
                  disabled={!!result}
                  className={`
                    w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between group
                    ${selectedOption === option 
                      ? "border-amber-500 bg-amber-500/5 text-white" 
                      : "border-slate-800 bg-slate-950 hover:border-slate-600 text-slate-400"}
                    ${result && option === question.resposta_correta ? "border-green-500 bg-green-500/10 !text-green-500" : ""}
                    ${result && selectedOption === option && !result.is_correct ? "border-red-500 bg-red-500/10 !text-red-500" : ""}
                  `}
                >
                  <MathRenderer tex={option} displayMode={false} className="font-medium text-lg" />
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                    ${selectedOption === option ? "border-amber-500 bg-amber-500" : "border-slate-700"}
                    ${result && option === question.resposta_correta ? "border-green-500 bg-green-500" : ""}
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
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
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
                        ? "Você resolveu o desafio com precisão!" 
                        : "Não desanime. Analise a questão e tente novamente!"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
                    <Trophy className="text-amber-500" />
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase">XP Ganho</div>
                      <div className="text-xl font-bold text-white">+{result.xp}</div>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
                    <Coins className="text-yellow-500" />
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase">Ouro Ganho</div>
                      <div className="text-xl font-bold text-white">+{result.gold}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={fetchQuestion}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all"
                >
                  Próximo Desafio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
