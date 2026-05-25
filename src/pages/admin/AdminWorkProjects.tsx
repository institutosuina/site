import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { WORK_AREAS_DATA } from "@/data/nossoTrabalho";

type AreaKey = "educacao" | "fortalecimento" | "conservacao";
type WorkProject = {
  title: string;
  text: string;
  images: string[];
};
type WorkProjectsContent = Record<AreaKey, WorkProject[]>;

const s = { fontFamily: "'Inter', sans-serif" } as const;

const areaLabels: Record<AreaKey, string> = {
  educacao: "Educação Ambiental",
  fortalecimento: "Fortalecimento e Mobilização",
  conservacao: "Conservação e Manejo",
};

const normalize = (raw: unknown): WorkProjectsContent => {
  const fallback = WORK_AREAS_DATA as WorkProjectsContent;
  if (!raw || typeof raw !== "object") return fallback;
  const data = raw as Partial<WorkProjectsContent>;
  const parseList = (key: AreaKey) => {
    const list = data[key];
    if (!Array.isArray(list)) return fallback[key];
    const normalized = list
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const project = item as Partial<WorkProject>;
        return {
          title: typeof project.title === "string" ? project.title : "",
          text: typeof project.text === "string" ? project.text : "",
          images: Array.isArray(project.images) ? project.images.filter((img): img is string => typeof img === "string") : [],
        };
      })
      .filter((item) => item.title.trim().length > 0);
    return normalized.length ? normalized : fallback[key];
  };

  return {
    educacao: parseList("educacao"),
    fortalecimento: parseList("fortalecimento"),
    conservacao: parseList("conservacao"),
  };
};

const AdminWorkProjects = () => {
  const queryClient = useQueryClient();
  const [activeArea, setActiveArea] = useState<AreaKey>("educacao");
  const [form, setForm] = useState<WorkProjectsContent>(WORK_AREAS_DATA as WorkProjectsContent);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const { isLoading } = useQuery({
    queryKey: ["admin-page-content", "nosso_trabalho"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_page_content")
        .select("content")
        .eq("page_key", "nosso_trabalho")
        .maybeSingle();
      if (error) throw error;
      setForm(normalize(data?.content));
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        page_key: "nosso_trabalho",
        content: form,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("site_page_content").upsert(payload, { onConflict: "page_key" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "✅ Projetos de Nosso Trabalho atualizados!" });
      queryClient.invalidateQueries({ queryKey: ["admin-page-content", "nosso_trabalho"] });
      queryClient.invalidateQueries({ queryKey: ["work-projects-content"] });
    },
    onError: (error: Error) => {
      toast({ title: "❌ Erro ao salvar", description: error.message, variant: "destructive" });
    },
  });

  const updateProject = (index: number, field: "title" | "text", value: string) => {
    setForm((current) => {
      const next = [...current[activeArea]];
      next[index] = { ...next[index], [field]: value };
      return { ...current, [activeArea]: next };
    });
  };

  const setProjectImages = (index: number, updater: (current: string[]) => string[]) => {
    setForm((current) => {
      const next = [...current[activeArea]];
      next[index] = { ...next[index], images: updater(next[index].images) };
      return { ...current, [activeArea]: next };
    });
  };

  const handleImageUpload = async (
    projectIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploadingIndex(projectIndex);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `projetos/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from("covers").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("covers").getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }
      setProjectImages(projectIndex, (current) => [...current, ...uploadedUrls]);
      toast({ title: `✅ ${uploadedUrls.length} imagem(ns) enviada(s)!` });
    } catch (err: any) {
      toast({ title: "❌ Erro ao enviar imagem", description: err.message, variant: "destructive" });
    } finally {
      setUploadingIndex(null);
      event.target.value = "";
    }
  };

  const removeImage = (projectIndex: number, imageIndex: number) => {
    setProjectImages(projectIndex, (current) => current.filter((_, i) => i !== imageIndex));
  };

  const addProject = () => {
    setForm((current) => ({
      ...current,
      [activeArea]: [{ title: "", text: "", images: [] }, ...current[activeArea]],
    }));
  };

  const removeProject = (index: number) => {
    setForm((current) => ({
      ...current,
      [activeArea]: current[activeArea].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>
            Nosso Trabalho
          </h2>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
            Edite os projetos exibidos na página Nosso Trabalho.
          </p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(areaLabels) as AreaKey[]).map((key) => (
          <Button
            key={key}
            variant={activeArea === key ? "default" : "outline"}
            onClick={() => setActiveArea(key)}
            className={activeArea === key ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
          >
            {areaLabels[key]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <section className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={addProject} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo projeto
            </Button>
          </div>
          {form[activeArea].map((project, index) => (
            <div key={`${activeArea}-${index}`} className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={project.title}
                  onChange={(event) => updateProject(index, "title", event.target.value)}
                  placeholder="Título do projeto"
                />
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600" onClick={() => removeProject(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={project.text}
                onChange={(event) => updateProject(index, "text", event.target.value)}
                placeholder="Descrição do projeto"
                className="min-h-28"
              />
              <div className="space-y-2">
                <label className="text-sm text-zinc-600">Imagens do projeto</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {project.images.map((url, imgIndex) => (
                    <div
                      key={`${url}-${imgIndex}`}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50"
                    >
                      <img src={url} alt={`Imagem ${imgIndex + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index, imgIndex)}
                        className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-white/90 text-zinc-600 hover:text-red-600 hover:bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remover imagem"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center gap-1.5 aspect-square rounded-lg border-2 border-dashed border-zinc-200 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all">
                    <Upload className="h-5 w-5 text-zinc-400" />
                    <span className="text-xs text-zinc-500 text-center px-2">
                      {uploadingIndex === index ? "Enviando..." : "Adicionar imagem"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => handleImageUpload(index, event)}
                      disabled={uploadingIndex === index}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default AdminWorkProjects;
