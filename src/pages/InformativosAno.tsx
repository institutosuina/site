import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { ArrowLeft, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import formaInformativo from "@/assets/forma-informativo.svg";

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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {informativos.map((info) => (
                <a
                  key={info.id}
                  href={info.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center"
                >
                  {/* SVG shape as background */}
                  <div className="relative w-full flex items-center justify-center">
                    <img src={formaInformativo} alt="" className="w-full h-auto" />
                    {/* Text overlay on the rounded rectangle part */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="flex-1 flex flex-col items-center justify-center pr-[15%]">
                        <span className="font-display text-sm md:text-base text-primary-foreground uppercase tracking-wider opacity-90">
                          Informativo
                        </span>
                        <span className="font-display text-2xl md:text-3xl font-bold text-primary-foreground leading-tight">
                          {info.numero}/{ano}
                        </span>
                      </div>
                      {/* The "+" circle is already in the SVG */}
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
