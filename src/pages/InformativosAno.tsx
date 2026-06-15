import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { ArrowLeft, Download, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const InformativosAno = () => {
  const { ano } = useParams<{ ano: string }>();
  const navigate = useNavigate();

  const { data: anoData } = useQuery({
    queryKey: ["informativo-ano", ano],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("informativo_anos")
        .select("*")
        .eq("ano", parseInt(ano!))
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!ano,
  });

  const { data: informativos, isLoading } = useQuery({
    queryKey: ["informativos-public", anoData?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("informativos")
        .select("*")
        .eq("ano_id", anoData!.id)
        .order("numero", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!anoData?.id,
  });

  return (
    <Layout>
      <section className="py-16 md:py-24 px-4 bg-background min-h-[60vh]">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={() => navigate("/participe#conteudos")}
            className="flex items-center gap-2 text-secondary font-display font-bold mb-10 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] text-accent mb-4 text-center">
            Informativos {ano}
          </h1>
          <p className="body-text text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Confira todos os informativos publicados em {ano}. Clique para baixar o PDF.
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
            </div>
          ) : !informativos?.length ? (
            <p className="text-center text-muted-foreground font-body py-16">
              Nenhum informativo cadastrado para {ano}.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pr-6 sm:pr-0">
              {informativos.map((info) => (
                <a
                  key={info.id}
                  href={info.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center"
                >
                  <div className="relative w-full pr-10 md:pr-12">
                    <div className="bg-suina-brown rounded-[1.75rem] border-[3px] border-white shadow-md py-5 md:py-6 pl-5 pr-8 flex flex-col items-center justify-center min-h-[96px] md:min-h-[110px]">
                      <span className="font-display text-xs md:text-sm text-primary-foreground uppercase tracking-wider opacity-90 leading-none">
                        Informativo
                      </span>
                      <span className="font-display text-xl md:text-2xl font-bold text-primary-foreground leading-tight mt-1 break-all text-center">
                        {info.numero}/{ano}
                      </span>
                    </div>
                    <div
                      className="absolute top-1/2 right-0 -translate-y-1/2 bg-suina-brown border-[3px] border-white rounded-full shadow-md flex items-center justify-center w-16 h-16 md:w-20 md:h-20"
                      aria-hidden="true"
                    >
                      <Plus className="w-7 h-7 md:w-9 md:h-9 text-primary-foreground" strokeWidth={2.5} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-muted-foreground group-hover:text-accent transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="font-body text-sm font-medium">Baixar PDF</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default InformativosAno;
