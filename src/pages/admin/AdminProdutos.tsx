import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Upload, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { subirParaR2 } from "@/lib/storage/upload";
import { formatBRL } from "@/lib/pix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

const db = supabase as any;
const s = { fontFamily: "'Inter', sans-serif" } as const;

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem_url: string | null;
  ativo: boolean;
}

const empty = { nome: "", descricao: "", preco: "", estoque: "", imagem_url: "" as string | null, ativo: true };

const AdminProdutos = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Produto | "new" | null>(null);
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: produtos, isLoading } = useQuery({
    queryKey: ["admin-produtos"],
    queryFn: async () => {
      // Admin vê também os inativos; a policy de leitura pública só libera ativos,
      // mas a policy "ALL" de authenticated cobre todos.
      const { data, error } = await db.from("produtos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Produto[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        preco: Number(String(form.preco).replace(",", ".")),
        estoque: parseInt(String(form.estoque), 10),
        imagem_url: form.imagem_url || null,
        ativo: form.ativo,
      };
      if (!payload.nome || !(payload.preco >= 0) || !(payload.estoque >= 0)) {
        throw new Error("Preencha nome, preço e quantidade.");
      }
      const q = editing === "new"
        ? db.from("produtos").insert(payload)
        : db.from("produtos").update(payload).eq("id", (editing as Produto).id);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-produtos"] });
      toast({ title: "✅ Produto salvo!" });
      setEditing(null);
    },
    onError: (err: any) => toast({ title: "❌ Erro", description: err.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("produtos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-produtos"] });
      toast({ title: "✅ Produto excluído." });
      setDeleteId(null);
    },
    onError: (err: any) => toast({ title: "❌ Erro ao excluir", description: err.message, variant: "destructive" }),
  });

  const openNew = () => { setForm(empty); setEditing("new"); };
  const openEdit = (p: Produto) => {
    setForm({ nome: p.nome, descricao: p.descricao, preco: String(p.preco), estoque: String(p.estoque), imagem_url: p.imagem_url, ativo: p.ativo });
    setEditing(p);
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      // Reaproveita o prefixo "covers" já liberado na função r2-upload-url.
      const url = await subirParaR2("covers", `loja/${Date.now()}-${safe}`, file);
      setForm((f) => ({ ...f, imagem_url: url }));
    } catch (err: any) {
      toast({ title: "❌ Erro ao enviar imagem", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const label = (text: string) => (
    <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">{text}</label>
  );

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>Produtos da Loja</h2>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
            Cadastre produtos com descrição, preço e quantidade disponível
          </p>
        </div>
        <Button onClick={openNew} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
          <Plus className="h-4 w-4 mr-2" /> Novo Produto
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !produtos?.length ? (
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-center text-zinc-400 py-16">Nenhum produto cadastrado.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {produtos.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-14 h-14 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
                  {p.imagem_url ? <img src={p.imagem_url} alt={p.nome} className="w-full h-full object-cover" /> : <ShoppingBag className="h-5 w-5 text-zinc-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ ...s, fontSize: "0.9375rem" }} className="font-semibold text-zinc-800 truncate">{p.nome}</p>
                  <p style={{ ...s, fontSize: "0.75rem" }} className="text-zinc-500">
                    {formatBRL(p.preco)} · {p.estoque} em estoque{!p.ativo && " · oculto"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-600" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>{editing === "new" ? "Novo Produto" : "Editar Produto"}</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>Aparece na loja se estiver visível e com estoque.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">{label("Nome")}<Input className="!text-sm" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
            <div className="space-y-2">{label("Descrição")}<Textarea className="!text-sm" rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">{label("Preço (R$)")}<Input className="!text-sm" inputMode="decimal" placeholder="0,00" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} /></div>
              <div className="space-y-2">{label("Quantidade disponível")}<Input className="!text-sm" type="number" min={0} value={form.estoque} onChange={(e) => setForm({ ...form, estoque: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              {label("Imagem")}
              <div className="flex items-center gap-3">
                {form.imagem_url && <img src={form.imagem_url} alt="" className="w-14 h-14 rounded-lg object-cover border border-zinc-200" />}
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 cursor-pointer text-sm hover:bg-zinc-50">
                  <Upload className="h-4 w-4" /> {uploading ? "Enviando..." : form.imagem_url ? "Trocar" : "Enviar imagem"}
                  <input type="file" accept="image/*" className="hidden" onChange={upload} disabled={uploading} />
                </label>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
              Visível na loja
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} className="!text-sm">Cancelar</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending || uploading} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              {save.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Confirmar exclusão</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>Os pedidos já feitos continuam guardados. Para só tirar da loja, desmarque "Visível na loja".</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="!text-sm">Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteId && remove.mutate(deleteId)} disabled={remove.isPending} className="!text-sm">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProdutos;
