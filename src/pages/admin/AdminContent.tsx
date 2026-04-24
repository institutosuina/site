import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Newspaper, BookOpen, ClipboardList, Plus, Pencil, Trash2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AnexosManager from "@/components/admin/AnexosManager";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

const tabConfig: Record<ContentTable, { label: string; icon: any }> = {
  posts_blog: { label: "Blog", icon: FileText },
  noticias: { label: "Notícias", icon: Newspaper },
  material_tecnico: { label: "Material Técnico", icon: BookOpen },
  editais: { label: "Editais", icon: ClipboardList },
};

type ContentTable = "posts_blog" | "noticias" | "material_tecnico" | "editais";
type ContentRow = Tables<ContentTable>;

interface AdminContentProps {
  contentType?: ContentTable;
}

const AdminContent = ({ contentType = "posts_blog" }: AdminContentProps) => {
  const activeTab = contentType;
  const navigate = useNavigate();
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
    navigate(`/admin/content/${activeTab}/new`);
  };

  const openEdit = (item: ContentRow) => {
    navigate(`/admin/content/${activeTab}/${item.id}/edit`);
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
                      {(activeTab === "editais" || activeTab === "material_tecnico") && (
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

      {anexosItem && (
        <AnexosManager
          parentId={anexosItem.id}
          parentTitle={anexosItem.title}
          open={!!anexosItem}
          onOpenChange={(open) => !open && setAnexosItem(null)}
          tableName={activeTab === "editais" ? "edital_anexos" : "material_tecnico_anexos"}
          foreignKey={activeTab === "editais" ? "edital_id" : "material_id"}
          storageBucket={activeTab === "editais" ? "editais" : "covers"}
          label={activeTab === "editais" ? "Anexos do Edital" : "Anexos do Material Técnico"}
        />
      )}
    </div>
  );
};

export default AdminContent;
