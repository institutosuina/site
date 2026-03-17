import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Newspaper, BookOpen, ClipboardList, Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

const tabConfig = [
  { key: "posts_blog" as const, label: "Blog", icon: FileText },
  { key: "noticias" as const, label: "Notícias", icon: Newspaper },
  { key: "material_tecnico" as const, label: "Material Técnico", icon: BookOpen },
  { key: "editais" as const, label: "Editais", icon: ClipboardList },
];

type ContentTable = "posts_blog" | "noticias" | "material_tecnico" | "editais";
type ContentRow = Tables<ContentTable>;

const slugify = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const emptyForm = { title: "", slug: "", content: "", status: "Rascunho", cover_image: "" };

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState<ContentTable>("posts_blog");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-content", activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(activeTab)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContentRow[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: TablesInsert<ContentTable>) => {
      if (editingId) {
        const { error } = await supabase.from(activeTab).update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(activeTab).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content", activeTab] });
      toast({ title: "✅ Conteúdo publicado com sucesso!" });
      closeDialog();
    },
    onError: () => toast({ title: "❌ Erro ao salvar conteúdo.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(activeTab).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content", activeTab] });
      toast({ title: "✅ Conteúdo excluído." });
      setDeleteId(null);
    },
    onError: () => toast({ title: "❌ Erro ao excluir.", variant: "destructive" }),
  });

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: ContentRow) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      content: item.content || "",
      status: item.status,
      cover_image: item.cover_image || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
      return;
    }
    const slug = form.slug || slugify(form.title);
    const payload: any = {
      title: form.title.trim(),
      slug,
      content: form.content,
      status: form.status,
      cover_image: form.cover_image || null,
      published_at: form.status === "Publicado" ? new Date().toISOString() : null,
    };
    upsertMutation.mutate(payload);
  };

  const s = { fontFamily: "'Inter', sans-serif" } as const;

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem", color: "#27272a" }}>
            Gestão de Conteúdo
          </h2>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
            Gerencie blog, notícias, materiais e editais
          </p>
        </div>
        <Button onClick={openNew} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
          <Plus className="h-4 w-4 mr-2" /> Adicionar
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg overflow-x-auto">
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
            style={{ ...s, fontSize: "0.8125rem" }}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !items?.length ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">
              Nenhum conteúdo encontrado. Clique em "Adicionar" para começar.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50">
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600">Título</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 hidden md:table-cell">Slug</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600">Status</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 hidden sm:table-cell">Data</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="hover:bg-zinc-50">
                  <TableCell style={{ ...s, fontSize: "0.875rem" }} className="font-medium text-zinc-800">{item.title}</TableCell>
                  <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-400 hidden md:table-cell">{item.slug}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === "Publicado" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                    }`} style={s}>{item.status}</span>
                  </TableCell>
                  <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500 hidden sm:table-cell">
                    {item.published_at ? new Date(item.published_at).toLocaleDateString("pt-BR") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => setDeleteId(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>
              {editingId ? "Editar conteúdo" : "Novo conteúdo"}
            </DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>
              Preencha os campos abaixo para {editingId ? "atualizar" : "criar"} o conteúdo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Título</label>
              <Input
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) });
                }}
                placeholder="Título do conteúdo"
                className="!text-sm"
              />
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Slug</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="slug-automatico" className="!text-sm" />
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">URL da imagem de capa</label>
              <Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." className="!text-sm" />
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Conteúdo</label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Escreva o conteúdo aqui (Markdown suportado)" rows={10} className="!text-sm" />
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="!text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rascunho">Rascunho</SelectItem>
                  <SelectItem value="Publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="!text-sm">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={upsertMutation.isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              <Save className="h-4 w-4 mr-2" /> {upsertMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Confirmar exclusão</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>
              Tem certeza que deseja excluir este conteúdo? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="!text-sm">Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="!text-sm">
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContent;
