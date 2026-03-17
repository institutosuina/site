import Layout from "@/components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileDown } from "lucide-react";
import logoSuina from "@/assets/logo-suina.png";

const EditalDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: edital, isLoading } = useQuery({
    queryKey: ["edital-detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("editais")
        .select("*")
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: anexos } = useQuery({
    queryKey: ["edital-anexos", edital?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("edital_anexos")
        .select("*")
        .eq("edital_id", edital!.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!edital?.id,
  });

  return (
    <Layout>
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={() => navigate("/editais")}
            className="flex items-center gap-2 text-secondary font-display font-bold mb-8 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Editais
          </button>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          ) : !edital ? (
            <p className="text-center text-muted-foreground font-body py-16">Edital não encontrado.</p>
          ) : (
            <div>
              {/* Cover image */}
              {edital.cover_image && (
                <div className="rounded-2xl overflow-hidden mb-8 h-48 md:h-64">
                  <img src={edital.cover_image} alt={edital.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Title */}
              <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground text-center mb-6 uppercase">
                EDITAIS
              </h1>

              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground text-center mb-8">
                {edital.title}
              </h2>

              {/* Content / Objeto */}
              {edital.content && (
                <div className="bg-muted/30 rounded-xl p-6 mb-10 border border-border">
                  <p className="font-body text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {edital.content}
                  </p>
                </div>
              )}

              {/* Two column: QR/info + Anexos */}
              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 items-start">
                {/* Left: QR-like info box */}
                <div className="bg-[hsl(var(--suina-green)/0.15)] rounded-2xl p-6 flex flex-col items-center text-center border border-[hsl(var(--suina-green)/0.3)]">
                  <p className="font-display text-sm font-bold text-foreground mb-2">{edital.title}</p>
                  <p className="font-body text-xs text-muted-foreground mb-4">
                    Acesse o edital através do nosso site:
                  </p>
                  <p className="font-body text-xs text-secondary break-all mb-4">
                    www.institutosuina.org/editais
                  </p>
                  <img src={logoSuina} alt="Instituto Suinã" className="h-10 w-auto opacity-80" />
                </div>

                {/* Right: Anexos list */}
                <div className="space-y-3">
                  {!anexos?.length ? (
                    <p className="text-muted-foreground font-body text-sm py-4">Nenhum anexo adicionado.</p>
                  ) : (
                    anexos.map((anexo) => (
                      <a
                        key={anexo.id}
                        href={anexo.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex-shrink-0 w-10 h-12 bg-[hsl(var(--suina-green)/0.2)] rounded-lg flex items-center justify-center">
                          <FileDown className="w-5 h-5 text-[hsl(var(--suina-green))]" />
                        </div>
                        <span className="font-display text-sm md:text-base font-bold text-foreground group-hover:text-secondary transition-colors">
                          {anexo.title}
                        </span>
                      </a>
                    ))
                  )}
                </div>
              </div>

              {/* Updated date */}
              {edital.updated_at && (
                <p className="text-center font-body text-xs text-muted-foreground mt-10">
                  Atualizado em: {new Date(edital.updated_at).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default EditalDetail;
