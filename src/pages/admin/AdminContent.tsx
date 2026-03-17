import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Newspaper, BookOpen, ClipboardList, Plus, Pencil, Trash2, X, Save, Paperclip, Upload, Image as ImageIcon, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnexosManager from "@/components/admin/AnexosManager";
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

const tabConfig: Record<ContentTable, { label: string; icon: any }> = {
  posts_blog: { label: "Blog", icon: FileText },
  noticias: { label: "Notícias", icon: Newspaper },
  material_tecnico: { label: "Material Técnico", icon: BookOpen },
  editais: { label: "Editais", icon: ClipboardList },
};

type ContentTable = "posts_blog" | "noticias" | "material_tecnico" | "editais";
type ContentRow = Tables<ContentTable>;

const slugify = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const emptyForm = { title: "", slug: "", content: "", status: "Rascunho", cover_image: "", attachments: [] as { name: string; url: string }[] };

interface AdminContentProps {
  contentType?: ContentTable;
}

const AdminContent = ({ contentType = "posts_blog" }: AdminContentProps) => {
  const activeTab = contentType;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [anexosItem, setAnexosItem] = useState<{ id: string; title: string } | null>(null);
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
      attachments: [],
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdfs, setUploadingPdfs] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const path = `${activeTab}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("covers").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      setForm((f) => ({ ...f, cover_image: data.publicUrl }));
      toast({ title: "✅ Imagem enviada!" });
    } catch (err: any) {
      toast({ title: "❌ Erro ao enviar imagem.", description: err.message, variant: "destructive" });
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingPdfs(true);
    try {
      const newAttachments: { name: string; url: string }[] = [];
      for (const file of Array.from(files)) {
        const path = `${activeTab}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("covers").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("covers").getPublicUrl(path);
        newAttachments.push({ name: file.name, url: data.publicUrl });
      }
      setForm((f) => ({ ...f, attachments: [...f.attachments, ...newAttachments] }));
      toast({ title: `✅ ${newAttachments.length} arquivo(s) enviado(s)!` });
    } catch (err: any) {
      toast({ title: "❌ Erro ao enviar arquivo.", description: err.message, variant: "destructive" });
    } finally {
      setUploadingPdfs(false);
      e.target.value = "";
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
      return;
    }
    const slug = form.slug || slugify(form.title);
    // Build content: text + attachment links
    let finalContent = form.content;
    if (form.attachments.length > 0) {
      const links = form.attachments.map((a) => `[${a.name}](${a.url})`).join("\n");
      finalContent = finalContent ? `${finalContent}\n\n---\n\n**Arquivos anexos:**\n${links}` : `**Arquivos anexos:**\n${links}`;
    }
    const payload: any = {
      title: form.title.trim(),
      slug,
      content: finalContent,
      status: form.status,
      cover_image: form.cover_image || null,
      published_at: form.status === "Publicado" ? new Date().toISOString() : null,
    };
    upsertMutation.mutate(payload);
  };

  const s = { fontFamily: "'Inter', sans-serif" } as const;

  const config = tabConfig[activeTab];

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem", color: "#27272a" }}>
            {config.label}
          </h2>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
            Gerencie os conteúdos de {config.label.toLowerCase()}
          </p>
        </div>
        <Button onClick={openNew} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
          <Plus className="h-4 w-4 mr-2" /> Adicionar
        </Button>
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
                      {activeTab === "editais" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-600" onClick={() => setAnexosItem({ id: item.id, title: item.title })} title="Gerenciar anexos">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      )}
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
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Imagem de capa</label>
              {form.cover_image && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-zinc-200 mb-2">
                  <img src={form.cover_image} alt="Capa" className="w-full h-full object-cover" />
                  <button onClick={() => setForm({ ...form, cover_image: "" })} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-zinc-300 cursor-pointer hover:border-emerald-400 transition-colors">
                <ImageIcon className="h-4 w-4 text-zinc-500" />
                <span style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-600">
                  {uploadingCover ? "Enviando..." : "Selecionar imagem"}
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} />
              </label>
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Conteúdo (texto)</label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Escreva o conteúdo aqui (opcional)" rows={6} className="!text-sm" />
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Arquivos (PDFs, documentos)</label>
              {form.attachments.length > 0 && (
                <div className="space-y-1">
                  {form.attachments.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded border border-zinc-200 bg-zinc-50">
                      <File className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                      <span style={{ ...s, fontSize: "0.75rem" }} className="flex-1 truncate text-zinc-700">{a.name}</span>
                      <button onClick={() => setForm((f) => ({ ...f, attachments: f.attachments.filter((_, j) => j !== i) }))} className="text-zinc-400 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-zinc-300 cursor-pointer hover:border-emerald-400 transition-colors">
                <Upload className="h-4 w-4 text-zinc-500" />
                <span style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-600">
                  {uploadingPdfs ? "Enviando..." : "Selecionar arquivos (múltiplos)"}
                </span>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" multiple onChange={handlePdfUpload} disabled={uploadingPdfs} />
              </label>
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

      {/* Edital Anexos Manager */}
      {anexosItem && (
        <EditalAnexosManager
          editalId={anexosItem.id}
          editalTitle={anexosItem.title}
          open={!!anexosItem}
          onOpenChange={(open) => !open && setAnexosItem(null)}
        />
      )}
    </div>
  );
};

export default AdminContent;
