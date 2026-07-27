// Versão web de uma campanha de e-mail ("Não consegue ver? Veja no navegador").
// O HTML enviado fica salvo em emails_enviados.body; aqui ele é exibido dentro
// de um iframe para não conflitar com o CSS do site.

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

const Campanha = () => {
  const { id } = useParams<{ id: string }>();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState(600);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["campanha-publica", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails_enviados")
        .select("id, subject, body, sent_at")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    retry: false,
  });

  useEffect(() => {
    if (data?.subject) document.title = `${data.subject} | Instituto Suinã`;
  }, [data?.subject]);

  // O iframe usa srcDoc (mesma origem), então dá para medir o conteúdo e
  // crescer a altura em vez de deixar barra de rolagem interna.
  const syncHeight = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (doc?.body) setFrameHeight(doc.documentElement.scrollHeight || doc.body.scrollHeight);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", syncHeight);
    return () => window.removeEventListener("resize", syncHeight);
  }, [syncHeight]);

  return (
    <div className="min-h-screen bg-[#f7f4ec]">
      <header className="bg-[#2f5741] text-white">
        <div className="container mx-auto max-w-3xl px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Instituto Suinã
          </Link>
          {data?.sent_at && (
            <span className="text-xs text-white/70">
              Enviado em {new Date(data.sent_at).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : isError || !data ? (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-[#2f5741] mb-2">Campanha não encontrada</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Este e-mail pode ter sido removido ou o link está incorreto.
            </p>
            <Link to="/" className="text-sm font-medium text-[#2f5741] underline">
              Ir para o site do Instituto Suinã
            </Link>
          </div>
        ) : (
          <iframe
            ref={frameRef}
            title={data.subject}
            srcDoc={data.body}
            onLoad={syncHeight}
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
            className="w-full border-0 block"
            style={{ height: frameHeight }}
          />
        )}
      </main>
    </div>
  );
};

export default Campanha;
