import Layout from "@/components/Layout";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const MaterialTecnico = () => {
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
                <Link
                  key={m.id}
                  to={`/material-tecnico/${m.slug}`}
                  className="rounded-2xl overflow-hidden shadow-lg group cursor-pointer relative block"
                >
                  {m.cover_image ? (
                    <img src={m.cover_image} alt={m.title} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-72 bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Sem imagem</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 text-center">
                    <Download className="w-10 h-10 mb-3" />
                    <p className="font-display text-xl font-bold leading-tight">{m.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default MaterialTecnico;
