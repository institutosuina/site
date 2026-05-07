import Layout from "@/components/Layout";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const Noticias = () => {
  const { data: items, isLoading } = useQuery({
    queryKey: ["noticias-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("status", "Publicado")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return [...(data || [])].sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at || 0).getTime();
        const dateB = new Date(b.published_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });
    },
  });

  return (
    <Layout>
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="section-title mb-8 uppercase text-secondary">Notícias</h1>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : !items?.length ? (
            <p className="text-center text-muted-foreground font-body py-16">Nenhuma notícia publicada ainda.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item) => (
                <div key={item.id} className="group cursor-pointer rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
                  <div className="relative overflow-hidden h-52 md:h-60">
                    {item.cover_image ? (
                      <>
                        <img src={item.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110 group-hover:scale-125 transition-transform duration-500" />
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          className="relative w-full h-full object-contain p-2 drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                        />
                      </>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Sem imagem</span>
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-4">
                    <h3 className="font-display text-base md:text-lg font-bold text-foreground leading-snug mb-3">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="caption-text italic text-secondary">
                        Publicação: {item.published_at ? new Date(item.published_at).toLocaleDateString("pt-BR") : "—"}
                      </span>
                      <Link
                        to={`/noticias/${item.slug}`}
                        className="flex items-center gap-1 bg-secondary text-secondary-foreground px-4 py-1.5 rounded font-body text-xs font-semibold uppercase hover:bg-secondary/90 transition-colors"
                      >
                        Acesse aqui <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Noticias;
