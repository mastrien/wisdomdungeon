"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { History, Play } from "lucide-react";
import Header from "@/components/Header";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Carregando dungeon...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-white mb-4">Mundo da Matemática</h2>
          <p className="text-slate-400 text-lg">Selecione uma masmorra e comece seu desafio procedural.</p>
        </div>

        {/* Dungeon List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { id: "algebra_basica", name: "Torre de Álgebra", desc: "Equações de 1º grau" },
            { id: "calculo_basico", name: "Cripta das Derivadas", desc: "Cálculo diferencial básico" },
            { id: "geometria", name: "Labirinto de Formas", desc: "Áreas e volumes" },
            { id: "algebra_linear", name: "Fortaleza das Matrizes", desc: "Determinantes e sistemas" },
            { id: "probabilidade", name: "Templo do Acaso", desc: "Probabilidade simples" }
          ].map((dungeon) => (
            <div 
              key={dungeon.id}
              onClick={() => router.push(`/dungeon/${dungeon.id}`)}
              className="group bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-amber-500/50 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-amber-500 transition-opacity">
                <Play className="fill-current" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{dungeon.name}</h3>
              <p className="text-slate-400 mb-6">{dungeon.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Dificuldade: Fácil</span>
                <button className="bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                  Explorar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats & History Shortcut */}
        <div className="mt-12 p-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Seu Progresso</h3>
            <p className="text-slate-400">Você ainda não completou nenhuma dungeon hoje.</p>
          </div>
          <button 
            onClick={() => router.push("/history")}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
          >
            <History className="w-5 h-5" />
            Ver Histórico Completo
          </button>
        </div>
      </main>
    </div>
  );
}
