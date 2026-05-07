import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, X, ImageIcon, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import TiptapEditor from "@/components/admin/TiptapEditor";
import AnexosManager from "@/components/admin/AnexosManager";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type ContentTable = "posts_blog" | "noticias" | "material_tecnico" | "editais";

const labelMap: Record<ContentTable, { singular: string; backPath: string; bucket: string; anexosTable: string; fk: string }> = {
  posts_blog: { singular: "Blog", backPath: "/admin/blog", bucket: "covers", anexosTable: "blog_posts_anexos", fk: "post_id" },
  noticias: { singular: "Notícia", backPath: "/admin/noticias", bucket: "covers", anexosTable: "noticias_anexos", fk: "noticia_id" },
  material_tecnico: { singular: "Material Técnico", backPath: "/admin/material-tecnico", bucket: "covers", anexosTable: "material_tecnico_anexos", fk: "material_id" },
  editais: { singular: "Edital", backPath: "/admin/editais", bucket: "editais", anexosTable: "edital_anexos", fk: "edital_id" },
};

const slugify = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const AdminContentEdit = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id || id === "new";
  const activeTab = type as ContentTable;
  const config = labelMap[activeTab];

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    status: "Rascunho",
    cover_image: "",
  });
  const [showAnexos, setShowAnexos] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ["admin-content-detail", activeTab, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(activeTab)
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Tables<ContentTable>;
    },
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title,
        slug: item.slug,
        content: item.content || "",
        status: item.status,
        cover_image: item.cover_image || "",
      });
    }
  }, [item]);

  const upsertMutation = useMutation({
    mutationFn: async (payload: TablesInsert<ContentTable>) => {
      if (!isNew) {
        const { error } = await supabase.from(activeTab).update(payload).eq("id", id!);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from(activeTab).insert(payload).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-content", activeTab] });
      if (activeTab === "posts_blog") {
        queryClient.invalidateQueries({ queryKey: ["blog-public"] });
      }
      if (activeTab === "noticias") {
        queryClient.invalidateQueries({ queryKey: ["noticias-public"] });
      }
      queryClient.invalidateQueries({ queryKey: ["post-detail"] });
      toast({ title: `✅ ${config.singular} salvo com sucesso!` });
      if (isNew && data) {
        navigate(`/admin/content/${activeTab}/${data.id}/edit`, { replace: true });
      }
    },
    onError: () => toast({ title: "❌ Erro ao salvar conteúdo.", variant: "destructive" }),
  });

  const [uploadingCover, setUploadingCover] = useState(false);

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
      published_at: form.status === "Publicado" ? (item?.published_at || new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    };
    upsertMutation.mutate(payload);
  };

  if (isLoading && !isNew) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  const s = { fontFamily: "'Inter', sans-serif" } as const;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 pb-20 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(config.backPath)}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h2 className="font-bold text-zinc-900" style={{ ...s, fontSize: "1.5rem" }}>
              {isNew ? `Novo ${config.singular}` : `Editar ${config.singular}`}
            </h2>
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500">
              {form.title || "Sem título"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <Button variant="outline" onClick={() => setShowAnexos(true)} className="gap-2 border-primary/20 hover:bg-primary/5">
              <Paperclip className="h-4 w-4" /> Anexos / Downloads
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={upsertMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]">
            <Save className="h-4 w-4 mr-2" /> {upsertMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label style={{ ...s, fontSize: "0.8125rem" }} className="font-bold text-zinc-700 uppercase tracking-wider">Título</label>
            <Input
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value, slug: !isNew ? form.slug : slugify(e.target.value) });
              }}
              placeholder="Digite o título chamativo..."
              className="!text-lg font-bold h-12 border-zinc-200"
              style={s}
            />
          </div>

          <div className="space-y-2">
            <label style={{ ...s, fontSize: "0.8125rem" }} className="font-bold text-zinc-700 uppercase tracking-wider">Conteúdo Visual</label>
            <TiptapEditor 
              content={form.content} 
              onChange={(html) => setForm(f => ({ ...f, content: html }))} 
              storageBucket="covers"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-6">
            <h3 className="font-bold text-zinc-900" style={{ ...s, fontSize: "1rem" }}>Configurações</h3>
            
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-bold text-zinc-700 uppercase tracking-wider">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rascunho">Rascunho</SelectItem>
                  <SelectItem value="Publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-bold text-zinc-700 uppercase tracking-wider">Slug (URL)</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="url-do-post" className="bg-white border-zinc-200 text-sm" />
            </div>

            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-bold text-zinc-700 uppercase tracking-wider">Imagem de Capa</label>
              {form.cover_image ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 shadow-inner group">
                  <img src={form.cover_image} alt="Capa" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="icon" onClick={() => setForm({ ...form, cover_image: "" })}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 aspect-video rounded-xl border-2 border-dashed border-zinc-300 bg-white cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/10 transition-all">
                  <ImageIcon className="h-8 w-8 text-zinc-400" />
                  <span style={{ ...s, fontSize: "0.75rem" }} className="text-zinc-500 font-medium">
                    {uploadingCover ? "Enviando..." : "Click para selecionar capa"}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} />
                </label>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
            <p className="text-xs leading-relaxed font-medium" style={s}>
              <strong>Dica:</strong> Use o botão "Botão" no editor para criar links destacados com o visual do site. 🌻
            </p>
          </div>
        </div>
      </div>

      {showAnexos && !isNew && id && (
        <AnexosManager
          parentId={id}
          parentTitle={form.title}
          open={showAnexos}
          onOpenChange={setShowAnexos}
          tableName={config.anexosTable as any}
          foreignKey={config.fk as any}
          storageBucket={config.bucket}
          label={`Downloads de ${config.singular}`}
        />
      )}
    </div>
  );
};

export default AdminContentEdit;
