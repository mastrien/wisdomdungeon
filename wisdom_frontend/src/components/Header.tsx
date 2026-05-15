"use client";

import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { LogOut, Sword, Trophy, Coins, MoreVertical, Settings, ShoppingBag, Package } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const { profile } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await auth.signOut();
    setShowMenu(false);
    
    // Check if the current page is public
    const isPublicProfile = pathname?.startsWith("/profile/");
    
    if (!isPublicProfile) {
      router.push("/login");
    }
  };

  // XP Progress calculation
  const currentLevelXP = profile ? profile.xp - profile.current_level_xp_threshold : 0;
  const nextLevelNeededXP = profile ? profile.next_level_xp - profile.current_level_xp_threshold : 1;
  const xpProgress = Math.min(100, Math.max(0, (currentLevelXP / (nextLevelNeededXP || 1)) * 100));

  return (
    <header className="border-b border-border-main bg-background/80 backdrop-blur-md sticky top-0 z-50 text-foreground">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sword className="text-brand-primary" />
          <span className="font-bold text-xl tracking-tight">Wisdom Dungeon</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {profile ? (
            <>
              <Link 
                href="/progression"
                className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-card dark:bg-slate-800 rounded-full border border-border-main shadow-sm hover:border-brand-primary/50 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <Trophy className="w-4 h-4 text-brand-primary" />
                  <span>Nível {profile.level}</span>
                </div>
                <div className="w-px h-4 bg-border-main"></div>
                <div className="text-sm font-bold text-foreground/80 dark:text-slate-300">{profile.xp} XP</div>
                <div className="w-px h-4 bg-border-main"></div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-brand-primary">
                  <Coins className="w-4 h-4" />
                  <span>{profile.gold} Ouro</span>
                </div>
              </Link>

              <Link 
                href={`/profile/${profile.user.username}`}
                className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full transition-colors group"
              >
                <span className="text-sm font-bold text-muted dark:text-slate-300 group-hover:text-foreground hidden lg:block">
                  {profile.user.username}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-700 border border-border-main flex items-center justify-center text-xs font-bold text-brand-primary overflow-hidden shadow-inner">
                  {profile.user.username[0].toUpperCase()}
                </div>
              </Link>

              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg text-dim hover:text-slate-950 dark:hover:text-foreground transition-colors"
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
                        href="/leaderboard"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-sm text-muted dark:text-slate-300 hover:text-slate-950 dark:hover:text-foreground transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        <Trophy className="w-4 h-4 text-brand-primary" />
                        Ranking Global
                      </Link>
                      <Link 
                        href="/shop"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-sm text-muted dark:text-slate-300 hover:text-slate-950 dark:hover:text-foreground transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Loja de Itens
                      </Link>
                      <Link 
                        href="/inventory"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-sm text-muted dark:text-slate-300 hover:text-slate-950 dark:hover:text-foreground transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        <Package className="w-4 h-4" />
                        Seu Inventário
                      </Link>
                      <Link 
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-sm text-muted dark:text-slate-300 hover:text-slate-950 dark:hover:text-foreground transition-colors"
                        onClick={() => setShowMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Configurações
                      </Link>
                      <div className="h-px bg-border-main my-1 mx-2"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
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

      {/* XP Progress Bar */}
      {profile && (
        <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 absolute bottom-0 left-0">
          <div 
            className="h-full bg-brand-primary shadow-brand transition-all duration-1000 ease-out"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      )}
    </header>
  );
}
