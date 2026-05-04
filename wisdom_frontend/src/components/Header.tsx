"use client";

import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { LogOut, Sword, Trophy, Coins, MoreVertical, Settings, Moon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const { profile } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sword className="text-brand-primary" />
          <span className="font-bold text-xl text-white">Wisdom Dungeon</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {profile ? (
            <>
              <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Trophy className="w-4 h-4 text-brand-primary" />
                  <span>Nível {profile.level}</span>
                </div>
                <div className="w-px h-4 bg-slate-700"></div>
                <div className="text-sm font-medium text-slate-300">{profile.xp} XP</div>
                <div className="w-px h-4 bg-slate-700"></div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-brand-primary">
                  <Coins className="w-4 h-4" />
                  <span>{profile.gold} Ouro</span>
                </div>
              </div>

              <Link 
                href={`/profile/${profile.user.username}`}
                className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-slate-800 rounded-full transition-colors group"
              >
                <span className="text-sm font-bold text-slate-300 group-hover:text-white hidden lg:block">
                  {profile.user.username}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-brand-primary overflow-hidden">
                  {profile.user.username[0].toUpperCase()}
                </div>
              </Link>

              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
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
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-20">
                      <Link 
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-800 text-sm text-slate-300 hover:text-white transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Configurações
                      </Link>
                      <button 
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-800 text-sm text-slate-300 hover:text-white transition-colors"
                        onClick={() => {
                          // Toggle theme logic later
                          setShowMenu(false);
                        }}
                      >
                        <Moon className="w-4 h-4" />
                        Alternar Tema
                      </button>
                      <div className="h-px bg-slate-800 my-1"></div>
                      <button 
                        onClick={() => auth.signOut()}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-800 text-sm text-red-400 hover:text-red-300 transition-colors"
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
