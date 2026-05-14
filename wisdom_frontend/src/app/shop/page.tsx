"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Header from "@/components/Header";
import { 
  ShoppingBag, 
  Coins, 
  Loader2, 
  Package, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Heart,
  Sparkles
} from "lucide-react";

interface Item {
  id: number;
  name: string;
  description: string;
  type: 'passive' | 'consumable';
  rarity: string;
  price: number;
  effect_type: string;
  effect_value: number;
  activatable: boolean;
  max_charges: number;
}

export default function ShopPage() {
  const { user, loading: authLoading, profile, refreshProfile, showToast } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const response = await api.get("/shop/");
      setItems(response.data);
    } catch (err) {
      console.error("Erro ao buscar itens da loja:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchItems();
    }
  }, [user, authLoading, fetchItems, router]);

  const handleBuy = async (itemId: number) => {
    setBuyingId(itemId);
    try {
      const response = await api.post(`/shop/${itemId}/buy/`);
      showToast(response.data.message, "success");
      await refreshProfile();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Erro ao realizar compra", "error");
    } finally {
      setBuyingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
        <p className="text-muted font-medium">Abrindo a loja...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-10 h-10 text-brand-primary" />
              <h2 className="text-4xl font-extrabold text-foreground">Mercado de Wisdom</h2>
            </div>
            <p className="text-muted text-lg italic">Troque seu ouro por artefatos de poder.</p>
          </div>
          
          <div className="bg-card border border-border-main px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl">
            <Coins className="text-yellow-500 w-8 h-8" />
            <div>
              <div className="text-xs text-muted font-bold uppercase tracking-widest">Seu Ouro</div>
              <div className="text-3xl font-black text-foreground">{profile?.gold}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => {
            const isAffordable = (profile?.gold || 0) >= item.price;
            
            return (
              <div 
                key={item.id}
                className="bg-card border border-border-main rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group border-b-4 hover:border-brand-primary/50"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-border-main group-hover:bg-brand-primary/10 group-hover:border-brand-primary/30 transition-colors`}>
                      {item.type === 'consumable' ? <Zap className="w-6 h-6 text-orange-500" /> : <ShieldCheck className="w-6 h-6 text-brand-primary" />}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                      item.rarity === 'legendary' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      item.rarity === 'rare' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                      'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}>
                      {item.rarity}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-foreground">{item.name}</h3>
                  <p className="text-sm text-dim mb-6 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest">
                      <Sparkles className="w-3 h-3 text-brand-primary" />
                      <span>{item.type === 'passive' ? 'Efeito Passivo' : 'Consumível'}</span>
                    </div>
                    {item.max_charges > 0 && (
                      <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-widest">
                        <Package className="w-3 h-3 text-brand-primary" />
                        <span>Cargas: {item.max_charges}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-500" />
                      <span className="text-xl font-black text-foreground">{item.price}</span>
                    </div>
                    
                    <button
                      onClick={() => handleBuy(item.id)}
                      disabled={!isAffordable || buyingId === item.id}
                      className={`
                        px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2
                        ${isAffordable 
                          ? 'bg-brand-primary text-slate-950 hover:bg-brand-hover shadow-brand' 
                          : 'bg-slate-100 dark:bg-slate-800 text-dim cursor-not-allowed'}
                      `}
                    >
                      {buyingId === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Comprar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="py-20 text-center">
            <Package className="w-20 h-20 text-muted mx-auto mb-6 opacity-20" />
            <h3 className="text-2xl font-bold text-muted">A loja está vazia por enquanto...</h3>
          </div>
        )}
      </main>
    </div>
  );
}
