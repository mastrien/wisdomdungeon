"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import api from "@/services/api";
import { 
  Trophy, 
  Medal, 
  Flame, 
  Loader2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

interface LeaderboardPlayer {
  username: string;
  xp: number;
  level: number;
  max_combo: number;
  total_normal_dungeons_completed: number;
  total_elite_dungeons_completed: number;
}

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await api.get("/leaderboard/");
      setPlayers(response.data.top_players);
      setUserRank(response.data.user_rank);
    } catch (err) {
      console.error("Erro ao buscar ranking:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Avoid synchronous setState by checking if we actually need to fetch
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
        <p className="text-muted font-medium">Convocando os heróis...</p>
      </div>
    );
  }

  const topThree = players.slice(0, 3);
  const others = players.slice(3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex flex-col items-center mb-12 text-center">
          <Trophy className="w-16 h-16 text-brand-primary mb-4 animate-bounce" />
          <h1 className="text-4xl font-black uppercase tracking-tighter">Hall da Fama</h1>
          <p className="text-muted font-medium mt-2">Os aventureiros mais lendários do Wisdom Dungeon</p>
        </div>

        {/* Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-end">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="order-2 md:order-1 flex flex-col items-center group">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-4 border-slate-300 dark:border-slate-500 shadow-xl overflow-hidden">
                  <span className="text-2xl font-black text-slate-400">{topThree[1].username[0].toUpperCase()}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center border-2 border-background">
                  <Medal className="w-4 h-4 text-slate-600" />
                </div>
              </div>
              <div className="bg-card border-2 border-slate-300/30 p-6 rounded-3xl w-full text-center h-40 flex flex-col justify-center transform group-hover:scale-105 transition-all">
                <div className="font-black text-lg truncate mb-1">{topThree[1].username}</div>
                <div className="text-brand-primary font-bold text-sm">Nível {topThree[1].level}</div>
                <div className="text-muted text-xs font-black uppercase mt-2">{topThree[1].xp} XP</div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="order-1 md:order-2 flex flex-col items-center group z-10">
              <div className="relative mb-4">
                <div className="w-28 h-28 rounded-full bg-brand-primary/20 flex items-center justify-center border-4 border-brand-primary shadow-2xl shadow-brand-glow overflow-hidden">
                   <span className="text-4xl font-black text-brand-primary">{topThree[0].username[0].toUpperCase()}</span>
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                   <Trophy className="w-8 h-8 text-brand-primary" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center border-2 border-background">
                  <Medal className="w-6 h-6 text-slate-950" />
                </div>
              </div>
              <div className="bg-card border-4 border-brand-primary p-8 rounded-[40px] w-full text-center h-52 flex flex-col justify-center shadow-2xl transform group-hover:scale-110 transition-all">
                <div className="font-black text-2xl truncate mb-1">{topThree[0].username}</div>
                <div className="text-brand-primary font-black">Nível {topThree[0].level}</div>
                <div className="text-muted font-black uppercase mt-2 tracking-widest">{topThree[0].xp} XP</div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="order-3 md:order-3 flex flex-col items-center group">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center border-4 border-orange-300 dark:border-orange-800 shadow-xl overflow-hidden">
                  <span className="text-2xl font-black text-orange-500">{topThree[2].username[0].toUpperCase()}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center border-2 border-background">
                  <Medal className="w-4 h-4 text-orange-700" />
                </div>
              </div>
              <div className="bg-card border-2 border-orange-300/30 p-6 rounded-3xl w-full text-center h-40 flex flex-col justify-center transform group-hover:scale-105 transition-all">
                <div className="font-black text-lg truncate mb-1">{topThree[2].username}</div>
                <div className="text-brand-primary font-bold text-sm">Nível {topThree[2].level}</div>
                <div className="text-muted text-xs font-black uppercase mt-2">{topThree[2].xp} XP</div>
              </div>
            </div>
          )}
        </div>

        {/* List of others */}
        <div className="bg-card border border-border-main rounded-3xl overflow-hidden shadow-xl mb-12">
          <div className="p-6 border-b border-border-main bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            <div className="flex items-center gap-12">
              <span className="w-8">Rank</span>
              <span>Aventureiro</span>
            </div>
            <div className="flex items-center gap-16 text-right">
              <span className="hidden md:block">Combo Máx</span>
              <span className="w-20">Experiência</span>
            </div>
          </div>

          <div className="divide-y divide-border-main">
            {others.map((player, index) => {
              const rank = index + 4;
              const isCurrentUser = profile?.user.username === player.username;
              
              return (
                <Link 
                  key={player.username}
                  href={`/profile/${player.username}`}
                  className={`
                    flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group
                    ${isCurrentUser ? "bg-brand-primary/5 border-l-4 border-l-brand-primary" : ""}
                  `}
                >
                  <div className="flex items-center gap-8">
                    <span className={`w-8 font-black text-lg ${rank <= 10 ? 'text-foreground' : 'text-dim'}`}>
                      {rank}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-brand-primary border border-border-main">
                        {player.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          {player.username}
                          {isCurrentUser && <span className="text-[10px] bg-brand-primary text-slate-950 px-2 py-0.5 rounded-full font-black uppercase">Você</span>}
                        </div>
                        <div className="text-xs text-muted font-bold">Nível {player.level}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-16">
                    <div className="hidden md:flex items-center gap-1 text-sm font-bold text-orange-500">
                      <Flame className="w-4 h-4" />
                      {player.max_combo}
                    </div>
                    <div className="w-20 text-right font-black text-foreground">
                      {player.xp.toLocaleString()}
                      <span className="text-[10px] text-muted block md:inline md:ml-1">XP</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-dim opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Current User Fixed Bar */}
        {profile && userRank && userRank > 3 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Link 
              href={`/profile/${profile.user.username}`}
              className="bg-slate-950 text-white p-6 rounded-3xl shadow-2xl flex items-center justify-between border-2 border-brand-primary hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-6">
                <div className="text-2xl font-black text-brand-primary">#{userRank}</div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary text-slate-950 flex items-center justify-center font-black">
                    {profile.user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-black uppercase tracking-tight">Sua Posição</div>
                    <div className="text-xs text-slate-400 font-bold">Nível {profile.level} • {profile.xp} XP</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase">Próximo Rank</div>
                  <div className="text-sm font-black text-brand-primary">-{players[userRank - 2]?.xp - profile.xp || 0} XP</div>
                </div>
                <ChevronRight className="w-6 h-6 text-brand-primary" />
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
