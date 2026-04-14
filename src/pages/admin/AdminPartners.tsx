import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Upload, X, GripVertical, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const s = { fontFamily: "'Inter', sans-serif" } as const;

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  sort_order: number;
}

const AdminPartners = () => {
  const queryClient = useQueryClient();
  const [newPartnerDialog, setNewPartnerDialog] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingLogo, setPendingLogo] = useState<{ name: string; url: string } | null>(null);
  const [deletePartnerId, setDeletePartnerId] = useState<string | null>(null);
  const [localPartners, setLocalPartners] = useState<Partner[]>([]);

  // Fetch partners
  const { data: partners, isLoading } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parceiros")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Partner[];
    },
  });

  // Update local state when data changes
  useEffect(() => {
    if (partners) {
      setLocalPartners(partners);
    }
  }, [partners]);

  // Create partner
  const createPartner = useMutation({
    mutationFn: async (payload: { name: string; logo_url: string; sort_order: number }) => {
      const { error } = await supabase.from("parceiros").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      toast({ title: "✅ Parceiro adicionado!" });
      setNewPartnerDialog(false);
      setPartnerName("");
      setPendingLogo(null);
    },
    onError: (err: any) => toast({ title: "❌ Erro", description: err.message, variant: "destructive" }),
  });

  // Delete partner
  const deletePartner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("parceiros").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
      toast({ title: "✅ Parceiro excluído." });
      setDeletePartnerId(null);
    },
    onError: (err: any) => toast({ title: "❌ Erro ao excluir.", description: err.message, variant: "destructive" }),
  });

  // Update sort order
  const updateOrder = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      const { error } = await supabase.from("parceiros").upsert(updates);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
    },
    onError: (err: any) => {
      setLocalPartners(partners || []); // Rollback on error
      toast({ title: "❌ Erro ao salvar ordem", description: err.message, variant: "destructive" });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("parceiros").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("parceiros").getPublicUrl(path);
      setPendingLogo({ name: file.name, url: data.publicUrl });
    } catch (err: any) {
      toast({ title: "❌ Erro ao enviar imagem", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleCreatePartner = () => {
    if (!partnerName.trim() || !pendingLogo) return;
    const nextOrder = (localPartners.length > 0) 
      ? Math.max(...localPartners.map(p => p.sort_order)) + 1 
      : 0;
    
    createPartner.mutate({
      name: partnerName.trim(),
      logo_url: pendingLogo.url,
      sort_order: nextOrder,
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(localPartners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index,
    }));
    
    setLocalPartners(updatedItems);
    
    // Save to DB
    updateOrder.mutate(updatedItems.map(item => ({
      id: item.id,
      sort_order: item.sort_order,
    })));
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>Parceiros e Apoiadores</h2>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
            Gerencie as logomarcas dos parceiros que aparecem no site
          </p>
        </div>
        <Button onClick={() => { setNewPartnerDialog(true); setPendingLogo(null); setPartnerName(""); }} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
          <Plus className="h-4 w-4 mr-2" /> Novo Parceiro
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !localPartners?.length ? (
          <div className="text-center py-16">
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">Nenhum parceiro cadastrado.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="partners">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-zinc-100">
                  {localPartners.map((partner, index) => (
                    <Draggable key={partner.id} draggableId={partner.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-4 px-6 py-4 transition-colors ${snapshot.isDragging ? "bg-emerald-50/50 shadow-inner" : "hover:bg-zinc-50"}`}
                        >
                          <div {...provided.dragHandleProps} className="text-zinc-300 hover:text-zinc-500 transition-colors">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          
                          <div className="w-12 h-12 rounded-lg bg-white border border-zinc-200 flex items-center justify-center p-2 overflow-hidden shrink-0">
                            <img src={partner.logo_url} alt={partner.name} className="max-w-full max-h-full object-contain" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p style={{ ...s, fontSize: "0.9375rem" }} className="font-semibold text-zinc-800 truncate">{partner.name}</p>
                            <p style={{ ...s, fontSize: "0.75rem" }} className="text-zinc-400">Ordem: {partner.sort_order + 1}</p>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-zinc-400 hover:text-red-600" 
                            onClick={() => setDeletePartnerId(partner.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* New Partner Dialog */}
      <Dialog open={newPartnerDialog} onOpenChange={setNewPartnerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Novo Parceiro</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>Adicione um novo parceiro ou apoiador.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Nome da Instituição (Alt)</label>
              <Input 
                value={partnerName} 
                onChange={(e) => setPartnerName(e.target.value)} 
                placeholder="Ex: SOS Mata Atlântica" 
                className="!text-sm" 
              />
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Logo</label>
              {pendingLogo ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-zinc-50 relative group">
                  <div className="w-10 h-10 rounded-md bg-white border border-zinc-200 flex items-center justify-center p-1 overflow-hidden">
                    <img src={pendingLogo.url} alt="Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                  <span style={{ ...s, fontSize: "0.8125rem" }} className="flex-1 truncate text-zinc-700">{pendingLogo.name}</span>
                  <button onClick={() => setPendingLogo(null)} className="text-zinc-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-zinc-200 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200">
                  <div className="p-3 bg-zinc-50 rounded-full group-hover:bg-emerald-100 transition-colors">
                    <Upload className="h-5 w-5 text-zinc-400 group-hover:text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <p style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">{uploading ? "Enviando..." : "Carregar Logotipo"}</p>
                    <p style={{ ...s, fontSize: "0.6875rem" }} className="text-zinc-400 mt-0.5">PNG, JPG ou WEBP (Max 2MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPartnerDialog(false)} className="!text-sm">Cancelar</Button>
            <Button onClick={handleCreatePartner} disabled={!partnerName.trim() || !pendingLogo || createPartner.isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              {createPartner.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Partner Confirmation */}
      <Dialog open={!!deletePartnerId} onOpenChange={() => setDeletePartnerId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Confirmar exclusão</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>Tem certeza que deseja remover este parceiro da lista?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePartnerId(null)} className="!text-sm">Cancelar</Button>
            <Button variant="destructive" onClick={() => deletePartnerId && deletePartner.mutate(deletePartnerId)} disabled={deletePartner.isPending} className="!text-sm">
              {deletePartner.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPartners;
