"use client";

import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { LogOut, Sword, Trophy, Coins, MoreVertical, Settings, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const { profile, isDarkMode, toggleDarkMode } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="border-b border-border-main bg-background/80 backdrop-blur-md sticky top-0 z-10 text-foreground">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sword className="text-brand-primary" />
          <span className="font-bold text-xl">Wisdom Dungeon</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {profile ? (
            <>
              <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-border-main shadow-sm">
                <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <Trophy className="w-4 h-4 text-brand-primary" />
                  <span>Nível {profile.level}</span>
                </div>
                <div className="w-px h-4 bg-border-main"></div>
                <div className="text-sm font-bold text-muted dark:text-slate-300">{profile.xp} XP</div>
                <div className="w-px h-4 bg-border-main"></div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-brand-primary">
                  <Coins className="w-4 h-4" />
                  <span>{profile.gold} Ouro</span>
                </div>
              </div>

              <Link 
                href={`/profile/${profile.user.username}`}
                className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group"
              >
                <span className="text-sm font-bold text-muted dark:text-slate-300 group-hover:text-foreground hidden lg:block">
                  {profile.user.username}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 border border-border-main flex items-center justify-center text-xs font-bold text-brand-primary overflow-hidden shadow-inner">
                  {profile.user.username[0].toUpperCase()}
                </div>
              </Link>

              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-dim hover:text-foreground transition-colors"
                  aria-label="Mais opções"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-background border border-border-main rounded-xl shadow-2xl py-2 z-20 overflow-hidden">
                      <Link 
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-muted dark:text-slate-300 hover:text-foreground transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Configurações
                      </Link>
                      <button 
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-muted dark:text-slate-300 hover:text-foreground transition-colors"
                        onClick={() => {
                          toggleDarkMode();
                          setShowMenu(false);
                        }}
                      >
                        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {isDarkMode ? "Modo Claro" : "Modo Escuro"}
                      </button>
                      <div className="h-px bg-border-main my-1 mx-2"></div>
                      <button 
                        onClick={() => auth.signOut()}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link 
              href="/login"
              className="px-6 py-2 bg-brand-primary hover:bg-brand-hover text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-brand-glow"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
;