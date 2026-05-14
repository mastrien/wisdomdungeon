"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { 
  Package, 
  Zap, 
  ShieldCheck, 
  X, 
  Loader2,
  AlertCircle,
  RotateCcw
} from "lucide-react";

interface InventoryItem {
  id: number;
  item: {
    id: number;
    name: string;
    description: string;
    type: 'passive' | 'consumable';
    activatable: boolean;
    max_charges: number;
  };
  current_charges: number;
  quantity: number;
  is_broken: boolean;
  is_equipped: boolean;
}

interface InventoryOverlayProps {
  onClose: () => void;
  onUseItem?: (message: string) => void;
  refreshTrigger?: number;
}

export default function InventoryOverlay({ onClose, onUseItem, refreshTrigger }: InventoryOverlayProps) {
  const { showToast, refreshProfile } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingId, setUsingId] = useState<number | null>(null);

  const fetchInventory = async () => {
    try {
      const response = await api.get("/inventory/");
      setItems(response.data);
    } catch (err) {
      console.error("Erro ao buscar inventário:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [refreshTrigger]);

  const handleUse = async (itemId: number) => {
    setUsingId(itemId);
    try {
      const response = await api.post(`/inventory/${itemId}/use/`);
      if (onUseItem) onUseItem(response.data.message);
      showToast(response.data.message, "success");
      fetchInventory();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Erro ao usar item", "error");
    } finally {
      setUsingId(null);
    }
  };

  const handleEquip = async (itemId: number) => {
    try {
      const response = await api.post(`/inventory/${itemId}/equip/`);
      showToast(response.data.is_equipped ? "Item equipado!" : "Item desequipado!", "info");
      await refreshProfile(); // Refresh attributes in real-time
      fetchInventory();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Erro ao equipar", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border-main w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-border-main flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Package className="text-brand-primary w-6 h-6" />
            <h2 className="text-xl font-bold text-foreground">Seu Inventário</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
              <p className="text-muted text-sm font-bold uppercase tracking-widest">Organizando itens...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-12 h-12 text-muted mb-4 opacity-20" />
              <p className="text-muted font-medium">Seu inventário está vazio.</p>
              <p className="text-xs text-dim mt-1">Visite a loja para adquirir novos itens!</p>
            </div>
          ) : (
            items.map((invItem) => (
              <div 
                key={invItem.id}
                className={`
                  p-4 rounded-2xl border-2 transition-all flex flex-col gap-3
                  ${invItem.is_equipped ? "border-brand-primary bg-brand-primary/5" : "border-border-main bg-background"}
                  ${invItem.is_broken ? "opacity-60 border-red-500/50 grayscale" : ""}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-card border border-border-main rounded-xl">
                      {invItem.item.type === 'consumable' ? <Zap className="w-5 h-5 text-orange-500" /> : <ShieldCheck className="w-5 h-5 text-brand-primary" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{invItem.item.name}</h3>
                      <p className="text-[10px] text-muted font-black uppercase tracking-widest">
                        {invItem.item.type === 'passive' ? 'Item Passivo' : 'Consumível'}
                      </p>
                    </div>
                  </div>
                  {invItem.is_broken && (
                    <div className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">Quebrado</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-dim leading-relaxed">{invItem.item.description}</p>

                <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="flex gap-2">
                    {invItem.item.type === 'passive' && invItem.item.max_charges > 0 && (
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-border-main">
                        <RotateCcw className="w-3 h-3 text-brand-primary" />
                        <span className="text-xs font-bold">{invItem.current_charges}/{invItem.item.max_charges}</span>
                      </div>
                    )}
                    {invItem.item.type === 'consumable' && (
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-border-main">
                        <Package className="w-3 h-3 text-brand-primary" />
                        <span className="text-xs font-bold">Qtd: {invItem.quantity}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {invItem.item.type === 'passive' && (
                      <button
                        onClick={() => handleEquip(invItem.id)}
                        disabled={invItem.is_broken}
                        className={`
                          px-4 py-1.5 rounded-lg text-xs font-bold transition-all
                          ${invItem.is_equipped 
                            ? 'bg-brand-primary text-slate-950' 
                            : 'bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-slate-200'}
                          ${invItem.is_broken ? 'cursor-not-allowed opacity-50' : ''}
                        `}
                      >
                        {invItem.is_equipped ? 'Equipado' : 'Equipar'}
                      </button>
                    )}
                    
                    {invItem.item.activatable && (
                      <button
                        onClick={() => handleUse(invItem.id)}
                        disabled={(invItem.item.type === 'consumable' ? invItem.quantity <= 0 : invItem.current_charges <= 0) || usingId === invItem.id || invItem.is_broken}
                        className={`
                          px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2
                          ${(invItem.item.type === 'consumable' ? invItem.quantity > 0 : invItem.current_charges > 0) 
                            ? 'bg-orange-500 text-white hover:bg-orange-600' 
                            : 'bg-slate-100 dark:bg-slate-800 text-dim cursor-not-allowed'}
                          ${invItem.is_broken ? 'cursor-not-allowed opacity-50' : ''}
                        `}
                      >
                        {usingId === invItem.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Usar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-border-main text-center">
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
            Dica: Itens passivos ativam automaticamente!
          </p>
        </div>
      </div>
    </div>
  );
}
