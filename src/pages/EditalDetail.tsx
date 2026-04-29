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
            <div className="animate-fade-in">
              {/* Header Section */}
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider mb-4">
                  Edital de Contratação
                </span>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                  {edital.title}
                </h1>
                <div className="w-20 h-1.5 bg-secondary mx-auto rounded-full"></div>
              </div>


              {/* Objeto / Descrição Section */}
              <div className="bg-white rounded-3xl p-8 md:p-10 mb-12 shadow-sm border border-border/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-secondary"></div>
                <h3 className="font-display text-lg font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-[10px]">i</span>
                  Objeto do Edital
                </h3>
                <p className="font-body text-base md:text-lg text-foreground/80 leading-relaxed italic">
                  {edital.content}
                </p>
              </div>

              {/* Downloads Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                  <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <FileDown className="text-secondary w-6 h-6" />
                    Documentos e Anexos
                  </h3>
                  
                  <div className="space-y-4">
                    {!anexos?.length ? (
                      <div className="p-8 text-center rounded-2xl border-2 border-dashed border-border bg-muted/20 text-muted-foreground font-body italic">
                        Nenhum anexo disponível para este edital.
                      </div>
                    ) : (
                      anexos.map((anexo, index) => (
                        <a
                          key={anexo.id}
                          href={anexo.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-white hover:border-secondary hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                            <FileDown className="w-6 h-6 text-secondary group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block font-display text-sm md:text-base font-bold text-foreground group-hover:text-secondary transition-colors truncate">
                              {anexo.title}
                            </span>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest group-hover:text-secondary/60">
                                Clique para baixar (PDF)
                              </span>
                              {anexo.created_at && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-border"></span>
                                  <span className="text-[10px] text-muted-foreground font-medium">
                                    {new Date(anexo.created_at).toLocaleDateString("pt-BR")}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                  <div className="bg-SuinaDark rounded-3xl p-8 text-white shadow-lg shadow-SuinaDark/20 relative overflow-hidden group">
                    <div className="relative z-10">
                      <p className="font-display text-sm font-bold opacity-70 mb-2 uppercase tracking-widest">Informações</p>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase opacity-50 font-bold mb-1">Publicação</p>
                          <p className="font-body text-sm">
                            {edital.published_at ? new Date(edital.published_at).toLocaleDateString("pt-BR") : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase opacity-50 font-bold mb-1">Status</p>
                          <span className="inline-block px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase">
                            {edital.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-white/10">
                        <img src={logoSuina} alt="Instituto Suinã" className="h-8 w-auto brightness-0 invert opacity-80" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-secondary/5 border border-secondary/10 text-center">
                    <p className="font-body text-xs text-muted-foreground italic leading-relaxed">
                      Este é um documento oficial do Instituto Suinã. Em caso de dúvidas, entre em contato através dos nossos canais de atendimento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default EditalDetail;
