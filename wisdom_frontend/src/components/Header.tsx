"use client";

import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { LogOut, Sword, Trophy, Coins } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { profile } = useAuth();

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sword className="text-amber-500" />
          <span className="font-bold text-xl text-white">Wisdom Dungeon</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {profile ? (
            <>
              <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Nível {profile.level}</span>
                </div>
                <div className="w-px h-4 bg-slate-700"></div>
                <div className="text-sm font-medium text-slate-300">{profile.xp} XP</div>
                <div className="w-px h-4 bg-slate-700"></div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-amber-400">
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
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-amber-500 overflow-hidden">
                  {profile.user.username[0].toUpperCase()}
                </div>
              </Link>

              <button 
                onClick={() => auth.signOut()}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <Link 
              href="/login"
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/10"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
