import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MaterialTecnicoDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: material, isLoading } = useQuery({
    queryKey: ["material-tecnico-detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_tecnico")
        .select("*")
        .eq("slug", slug)
        .eq("status", "Publicado")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: anexos } = useQuery({
    queryKey: ["material-tecnico-anexos", material?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_tecnico_anexos")
        .select("*")
        .eq("material_id", material!.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!material?.id,
  });

  if (isLoading) {
    return (
      <Layout>
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <Skeleton className="h-10 w-2/3 mb-6" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </section>
      </Layout>
    );
  }

  if (!material) {
    return (
      <Layout>
        <section className="py-16 md:py-24 px-4 text-center">
          <p className="text-muted-foreground font-body">Material não encontrado.</p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="section-title mb-8 uppercase">{material.title}</h1>

          {material.cover_image && (
            <img src={material.cover_image} alt={material.title}
              className="w-full max-h-96 object-cover rounded-2xl mb-8" />
          )}

          {material.content && (
            <div className="prose prose-lg max-w-none mb-10 font-body text-foreground whitespace-pre-wrap">
              {material.content}
            </div>
          )}

          {anexos && anexos.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-foreground">Documentos para download</h2>
              <div className="grid gap-3">
                {anexos.map((a) => (
                  <a
                    key={a.id}
                    href={a.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
                  >
                    <Download className="h-5 w-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-body font-medium text-foreground">{a.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default MaterialTecnicoDetail;
