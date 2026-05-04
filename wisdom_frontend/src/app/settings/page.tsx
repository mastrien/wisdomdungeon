"use client";

import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { useState } from "react";
import api from "@/services/api";
import { 
  Palette, 
  Type, 
  Check, 
  Lock, 
  Loader2,
  ChevronLeft
} from "lucide-react";
import { useRouter } from "next/navigation";

const themes = [
  { id: "amber", name: "Âmbar", color: "#f59e0b", level: 1 },
  { id: "emerald", name: "Esmeralda", color: "#10b981", level: 5 },
  { id: "rose", name: "Rosa", color: "#f43f5e", level: 10 },
  { id: "blue", name: "Azul", color: "#3b82f6", level: 15 },
  { id: "purple", name: "Roxo", color: "#a855f7", level: 20 },
];

const fontSizes = [
  { id: "small", name: "Pequena" },
  { id: "medium", name: "Média" },
  { id: "large", name: "Grande" },
];

export default function SettingsPage() {
  const { profile, refreshProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  const updateSetting = async (key: string, value: string) => {
    setUpdating(true);
    try {
      await api.patch("/profile/", { [key]: value });
      await refreshProfile();
    } catch (err) {
      console.error("Erro ao atualizar configuração:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 py-12">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Voltar ao Mapa
        </button>

        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted mb-12">Personalize sua experiência no Wisdom Dungeon.</p>

        <section className="space-y-12">
          {/* Theme Color */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-primary/10 rounded-lg">
                <Palette className="w-5 h-5 text-brand-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Cor do Tema</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((theme) => {
                const isLocked = (profile.level || 1) < theme.level;
                const isSelected = profile.theme_color === theme.id;
                
                return (
                  <button
                    key={theme.id}
                    disabled={isLocked || updating}
                    onClick={() => updateSetting("theme_color", theme.id)}
                    className={`
                      flex items-center justify-between p-4 rounded-2xl border-2 transition-all
                      ${isSelected 
                        ? "border-brand-primary bg-brand-primary/5" 
                        : "border-border-main bg-card hover:border-slate-300 dark:hover:border-slate-700"}
                      ${isLocked ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full" 
                        style={{ backgroundColor: theme.color }}
                      ></div>
                      <span className="font-bold">{theme.name}</span>
                    </div>
                    
                    {isLocked ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted uppercase">
                        <Lock className="w-3.5 h-3.5" />
                        Nível {theme.level}
                      </div>
                    ) : isSelected ? (
                      <Check className="w-5 h-5 text-brand-primary" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-primary/10 rounded-lg">
                <Type className="w-5 h-5 text-brand-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Tamanho da Fonte</h2>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {fontSizes.map((size) => {
                const isSelected = profile.font_size === size.id;
                
                return (
                  <button
                    key={size.id}
                    disabled={updating}
                    onClick={() => updateSetting("font_size", size.id)}
                    className={`
                      px-8 py-4 rounded-2xl border-2 font-bold transition-all
                      ${isSelected 
                        ? "border-brand-primary bg-brand-primary/5 text-slate-900 dark:text-brand-primary" 
                        : "border-border-main bg-card hover:border-slate-300 dark:hover:border-slate-700 text-muted"}
                    `}
                  >
                    {size.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {updating && (
          <div className="mt-8 flex items-center gap-2 text-muted text-sm animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Salvando alterações...
          </div>
        )}
      </main>
    </div>
  );
}

