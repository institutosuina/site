import { useState } from "react";
import Layout from "@/components/Layout";
import { Download, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const MaterialTecnico = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["material-tecnico-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_tecnico")
        .select("*")
        .eq("status", "Publicado")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const selectedItem = items?.find((m) => m.id === selectedId);

  const { data: anexos } = useQuery({
    queryKey: ["material-tecnico-anexos", selectedId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_tecnico_anexos")
        .select("*")
        .eq("material_id", selectedId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedId,
  });

  return (
    <Layout>
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="section-title mb-8 uppercase">Material Técnico</h1>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : !items?.length ? (
            <p className="text-center text-muted-foreground font-body py-16">Nenhum material publicado ainda.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {items.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className="rounded-2xl overflow-hidden shadow-lg group cursor-pointer relative block aspect-[4/3] w-full text-left"
                >
                  {m.cover_image ? (
                    <img src={m.cover_image} alt={m.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Sem imagem</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 text-center">
                    <Download className="w-10 h-10 mb-3" />
                    <p className="font-display text-lg font-bold leading-tight">{m.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal de downloads */}
      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground leading-tight">
              {selectedItem?.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-body text-sm">
              Documentos disponíveis para download
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {!anexos?.length ? (
              <p className="text-muted-foreground text-sm text-center py-6 font-body">
                Nenhum documento disponível.
              </p>
            ) : (
              anexos.map((a) => (
                <a
                  key={a.id}
                  href={a.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-body font-medium text-foreground flex-1">{a.title}</span>
                </a>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MaterialTecnico;
