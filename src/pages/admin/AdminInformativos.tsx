import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Upload, File, X, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

const s = { fontFamily: "'Inter', sans-serif" } as const;

const AdminInformativos = () => {
  const queryClient = useQueryClient();
  const [selectedAno, setSelectedAno] = useState<{ id: string; ano: number } | null>(null);
  const [newAnoDialog, setNewAnoDialog] = useState(false);
  const [newAnoValue, setNewAnoValue] = useState("");
  const [newInfoDialog, setNewInfoDialog] = useState(false);
  const [newInfoTitle, setNewInfoTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ name: string; url: string } | null>(null);
  const [deleteAnoId, setDeleteAnoId] = useState<string | null>(null);
  const [deleteInfoId, setDeleteInfoId] = useState<string | null>(null);

  // Fetch years
  const { data: anos, isLoading: loadingAnos } = useQuery({
    queryKey: ["informativo-anos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("informativo_anos")
        .select("*")
        .order("ano", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch informativos for selected year
  const { data: informativos, isLoading: loadingInfos } = useQuery({
    queryKey: ["informativos", selectedAno?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("informativos")
        .select("*")
        .eq("ano_id", selectedAno!.id)
        .order("numero", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedAno,
  });

  // Create year
  const createAno = useMutation({
    mutationFn: async (ano: number) => {
      const { error } = await supabase.from("informativo_anos").insert({ ano });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["informativo-anos"] });
      toast({ title: "✅ Ano criado!" });
      setNewAnoDialog(false);
      setNewAnoValue("");
    },
    onError: (err: any) => toast({ title: "❌ Erro", description: err.message, variant: "destructive" }),
  });

  // Delete year
  const deleteAno = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("informativo_anos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["informativo-anos"] });
      toast({ title: "✅ Ano excluído." });
      setDeleteAnoId(null);
      if (selectedAno?.id === deleteAnoId) setSelectedAno(null);
    },
    onError: () => toast({ title: "❌ Erro ao excluir.", variant: "destructive" }),
  });

  // Create informativo
  const createInfo = useMutation({
    mutationFn: async (payload: { ano_id: string; numero: number; title: string; file_url: string }) => {
      const { error } = await supabase.from("informativos").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["informativos", selectedAno?.id] });
      toast({ title: "✅ Informativo adicionado!" });
      setNewInfoDialog(false);
      setNewInfoTitle("");
      setPendingFile(null);
    },
    onError: (err: any) => toast({ title: "❌ Erro", description: err.message, variant: "destructive" }),
  });

  // Delete informativo
  const deleteInfo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("informativos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["informativos", selectedAno?.id] });
      toast({ title: "✅ Informativo excluído." });
      setDeleteInfoId(null);
    },
    onError: () => toast({ title: "❌ Erro ao excluir.", variant: "destructive" }),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `informativos/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("covers").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      setPendingFile({ name: file.name, url: data.publicUrl });
    } catch (err: any) {
      toast({ title: "❌ Erro ao enviar arquivo.", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleCreateInfo = () => {
    if (!newInfoTitle.trim() || !pendingFile || !selectedAno) return;
    const nextNum = (informativos?.length || 0) + 1;
    createInfo.mutate({
      ano_id: selectedAno.id,
      numero: nextNum,
      title: newInfoTitle.trim(),
      file_url: pendingFile.url,
    });
  };

  // ── Year list view ──
  if (!selectedAno) {
    return (
      <div className="space-y-6 font-['Inter',sans-serif]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>Informativos</h2>
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
              Gerencie os informativos por ano
            </p>
          </div>
          <Button onClick={() => setNewAnoDialog(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
            <Plus className="h-4 w-4 mr-2" /> Novo Ano
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {loadingAnos ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !anos?.length ? (
            <div className="text-center py-16">
              <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">Nenhum ano cadastrado.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {anos.map((ano) => (
                <div key={ano.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors">
                  <button
                    onClick={() => setSelectedAno({ id: ano.id, ano: ano.ano })}
                    className="flex items-center gap-3 text-left flex-1"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <span style={s} className="font-bold text-emerald-700 text-lg">{ano.ano}</span>
                    </div>
                    <div>
                      <p style={{ ...s, fontSize: "0.9375rem" }} className="font-semibold text-zinc-800">Informativos {ano.ano}</p>
                      <p style={{ ...s, fontSize: "0.75rem" }} className="text-zinc-400">Clique para gerenciar</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => setDeleteAnoId(ano.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-zinc-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Year Dialog */}
        <Dialog open={newAnoDialog} onOpenChange={setNewAnoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Novo Ano</DialogTitle>
              <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>Digite o ano para os informativos.</DialogDescription>
            </DialogHeader>
            <Input
              type="number"
              value={newAnoValue}
              onChange={(e) => setNewAnoValue(e.target.value)}
              placeholder="Ex: 2025"
              className="!text-sm"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewAnoDialog(false)} className="!text-sm">Cancelar</Button>
              <Button
                onClick={() => newAnoValue && createAno.mutate(parseInt(newAnoValue))}
                disabled={!newAnoValue || createAno.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm"
              >
                {createAno.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Year Confirmation */}
        <Dialog open={!!deleteAnoId} onOpenChange={() => setDeleteAnoId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Confirmar exclusão</DialogTitle>
              <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>
                Isso excluirá o ano e todos os informativos associados. Essa ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteAnoId(null)} className="!text-sm">Cancelar</Button>
              <Button variant="destructive" onClick={() => deleteAnoId && deleteAno.mutate(deleteAnoId)} disabled={deleteAno.isPending} className="!text-sm">
                {deleteAno.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Informativos list for selected year ──
  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedAno(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>Informativos {selectedAno.ano}</h2>
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
              Gerencie os informativos deste ano
            </p>
          </div>
        </div>
        <Button onClick={() => { setNewInfoDialog(true); setPendingFile(null); setNewInfoTitle(""); }} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
          <Plus className="h-4 w-4 mr-2" /> Novo Informativo
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {loadingInfos ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !informativos?.length ? (
          <div className="text-center py-16">
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">Nenhum informativo cadastrado para {selectedAno.ano}.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {informativos.map((info) => (
              <div key={info.id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <File className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ ...s, fontSize: "0.875rem" }} className="font-medium text-zinc-800">{info.title}</p>
                  <p style={{ ...s, fontSize: "0.75rem" }} className="text-zinc-400">Informativo {info.numero}/{selectedAno.ano}</p>
                </div>
                <a href={info.file_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline text-xs font-medium" style={s}>
                  Ver PDF
                </a>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => setDeleteInfoId(info.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Informativo Dialog */}
      <Dialog open={newInfoDialog} onOpenChange={setNewInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Novo Informativo</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>Adicione um novo informativo para {selectedAno.ano}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Título</label>
              <Input value={newInfoTitle} onChange={(e) => setNewInfoTitle(e.target.value)} placeholder={`Ex: Informativo ${(informativos?.length || 0) + 1}/${selectedAno.ano}`} className="!text-sm" />
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Arquivo PDF</label>
              {pendingFile ? (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-zinc-200 bg-zinc-50">
                  <File className="h-4 w-4 text-zinc-500" />
                  <span style={{ ...s, fontSize: "0.8125rem" }} className="flex-1 truncate text-zinc-700">{pendingFile.name}</span>
                  <button onClick={() => setPendingFile(null)} className="text-zinc-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-zinc-300 cursor-pointer hover:border-emerald-400 transition-colors">
                  <Upload className="h-4 w-4 text-zinc-500" />
                  <span style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-600">{uploading ? "Enviando..." : "Selecionar PDF"}</span>
                  <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewInfoDialog(false)} className="!text-sm">Cancelar</Button>
            <Button onClick={handleCreateInfo} disabled={!newInfoTitle.trim() || !pendingFile || createInfo.isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              {createInfo.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Info Confirmation */}
      <Dialog open={!!deleteInfoId} onOpenChange={() => setDeleteInfoId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Confirmar exclusão</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>Tem certeza que deseja excluir este informativo?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteInfoId(null)} className="!text-sm">Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteInfoId && deleteInfo.mutate(deleteInfoId)} disabled={deleteInfo.isPending} className="!text-sm">
              {deleteInfo.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInformativos;
