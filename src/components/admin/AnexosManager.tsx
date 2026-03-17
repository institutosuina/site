import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Upload, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

const s = { fontFamily: "'Inter', sans-serif" } as const;

interface Props {
  parentId: string;
  parentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: "edital_anexos" | "material_tecnico_anexos";
  foreignKey: "edital_id" | "material_id";
  storageBucket: string;
  label?: string;
}

const AnexosManager = ({
  parentId, parentTitle, open, onOpenChange,
  tableName, foreignKey, storageBucket, label = "Anexos",
}: Props) => {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const queryKey = [tableName, parentId];

  const { data: anexos, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from(tableName as "edital_anexos") as any)
        .select("*")
        .eq(foreignKey, parentId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from(tableName as "edital_anexos") as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "✅ Anexo removido." });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!newTitle.trim()) {
      toast({ title: "Preencha o título do anexo antes de enviar o arquivo.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${parentId}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(storageBucket).getPublicUrl(filePath);

      const nextOrder = (anexos?.length || 0) + 1;
      const insertData: any = {
        [foreignKey]: parentId,
        title: newTitle.trim(),
        file_url: urlData.publicUrl,
        sort_order: nextOrder,
      };
      const { error: insertError } = await (supabase.from(tableName as "edital_anexos") as any).insert(insertData);
      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey });
      toast({ title: "✅ Anexo adicionado!" });
      setNewTitle("");
    } catch (err: any) {
      toast({ title: "❌ Erro ao enviar arquivo.", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>{label}</DialogTitle>
          <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>{parentTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {isLoading ? (
            <p style={s} className="text-zinc-400 text-sm">Carregando...</p>
          ) : !anexos?.length ? (
            <p style={s} className="text-zinc-400 text-sm text-center py-4">Nenhum anexo adicionado.</p>
          ) : (
            anexos.map((a: any, i: number) => (
              <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 bg-zinc-50">
                <GripVertical className="h-4 w-4 text-zinc-300 flex-shrink-0" />
                <span style={{ ...s, fontSize: "0.8125rem" }} className="flex-1 text-zinc-700 truncate">
                  {i + 1}. {a.title}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-600"
                  onClick={() => deleteMutation.mutate(a.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-zinc-200 pt-4 space-y-3">
          <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">
            Adicionar novo anexo
          </label>
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título do anexo" className="!text-sm" />
          <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-zinc-300 cursor-pointer hover:border-emerald-400 transition-colors">
            <Upload className="h-4 w-4 text-zinc-500" />
            <span style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-600">
              {uploading ? "Enviando..." : "Selecionar arquivo (PDF, DOC, etc.)"}
            </span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg"
              onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="!text-sm">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnexosManager;
