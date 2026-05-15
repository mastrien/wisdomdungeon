"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Package, Loader2 } from "lucide-react";

export default function InventoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
        <p className="text-muted font-medium">Carregando inventário...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-10 h-10 text-brand-primary" />
            <h2 className="text-4xl font-extrabold text-foreground">Seu Inventário</h2>
          </div>
          <p className="text-muted text-lg">Gerencie seus equipamentos e consumíveis.</p>
        </div>

        {/* We can just use the Overlay logic here but as a static list if we wanted, 
            but for now, let's just render the component logic or the component itself 
            adapted for page use. 
            Since InventoryOverlay is fixed, I'll create a simpler version for the page 
            or just let it be a modal that auto-opens. 
            Actually, let's just implement the list here.
        */}
        <div className="bg-card border border-border-main rounded-3xl p-6 shadow-xl">
           <InventoryList />
        </div>
      </main>
    </div>
  );
}

interface InventoryItem {
  id: number;
  is_equipped: boolean;
  item: {
    name: string;
    description: string;
    type: 'passive' | 'consumable';
  }
}

function InventoryList() {
  const { showToast } = useAuth();
  // Similar to InventoryOverlay but without fixed positioning
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    try {
      const response = await (await import("@/services/api")).default.get("/inventory/");
      setItems(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    if (!loading) return; // Prevent cascading renders if already loaded
    fetchInventory(); 
  }, [fetchInventory, loading]);

  const handleEquip = async (itemId: number) => {
    try {
      const apiModule = await import("@/services/api");
      const response = await apiModule.default.post(`/inventory/${itemId}/equip/`);
      showToast(response.data.is_equipped ? "Item equipado!" : "Item desequipado!", "info");
      fetchInventory();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Erro ao equipar", "error");
    }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-primary" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((invItem) => (
        <div key={invItem.id} className={`p-6 rounded-2xl border-2 transition-all ${invItem.is_equipped ? "border-brand-primary bg-brand-primary/5" : "border-border-main"}`}>
           <h3 className="font-bold text-lg mb-2">{invItem.item.name}</h3>
           <p className="text-sm text-dim mb-4">{invItem.item.description}</p>
           {invItem.item.type === 'passive' && (
             <button 
               onClick={() => handleEquip(invItem.id)}
               className={`px-4 py-2 rounded-xl font-bold text-sm ${invItem.is_equipped ? "bg-brand-primary text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-foreground"}`}
             >
               {invItem.is_equipped ? "Equipado" : "Equipar"}
             </button>
           )}
        </div>
      ))}
      {items.length === 0 && <p className="text-muted text-center col-span-2">Nenhum item encontrado.</p>}
    </div>
  );
}
