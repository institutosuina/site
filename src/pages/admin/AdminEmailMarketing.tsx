import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Send, Mail, Trash2, Users, ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";
import EmailBuilder from "@/components/admin/email-builder/EmailBuilder";
import { campaignUrl, renderEmailHtml } from "@/lib/email/render";
import type { EmailDoc } from "@/lib/email/types";

type EmailSent = Tables<"emails_enviados">;
type Publico = { id: string; name: string; emails: string[]; created_at: string };
const s = { fontFamily: "'Inter', sans-serif" } as const;

const DOX_DEFAULTS_KEY = "dox-email-defaults";

// Configurações do molde DOX que valem a pena reaproveitar entre campanhas
// (rodapé fixo, link de descadastro, "ver no navegador").
const loadDoxDefaults = (): Partial<EmailDoc> => {
  try {
    return JSON.parse(localStorage.getItem(DOX_DEFAULTS_KEY) || "{}");
  } catch {
    return {};
  }
};

const emptyDoc = (): EmailDoc => ({ blocks: [], showViewInBrowser: false, ...loadDoxDefaults() });

const AdminEmailMarketing = () => {
  const [composeOpen, setComposeOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [subject, setSubject] = useState("");
  const [doc, setDoc] = useState<EmailDoc>(emptyDoc);
  const [selectedPublicoId, setSelectedPublicoId] = useState("");
  const queryClient = useQueryClient();

  const { data: emails, isLoading } = useQuery({
    queryKey: ["admin-emails-sent"],
    queryFn: async () => {
      const { data, error } = await supabase.from("emails_enviados").select("*").order("sent_at", { ascending: false });
      if (error) throw error;
      return data as EmailSent[];
    },
  });

  // Públicos cadastrados (listas de destinatários) — geridos em /admin/email-marketing/publicos.
  const { data: publicos, isLoading: publicosLoading } = useQuery({
    queryKey: ["admin-recipient-lists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listas_destinatarios").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Publico[];
    },
  });

  const audiences = Array.from(new Set(emails?.map((e) => e.target_audience) || []));

  const selectedPublico = publicos?.find((p) => p.id === selectedPublicoId);
  const recipients = selectedPublico?.emails ?? [];
  const finalAudience = selectedPublico?.name ?? "";

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!subject.trim() || !doc.blocks.length || !finalAudience) throw new Error("Preencha todos os campos");
      if (!recipients.length) throw new Error("O público selecionado não tem destinatários");

      // O id é gerado aqui (e não no banco) porque o link "Veja no navegador"
      // precisa estar dentro do HTML antes do envio — ver /campanha/:id.
      const campaignId = crypto.randomUUID();
      const html = renderEmailHtml(doc, { campaignId });

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          id: campaignId,
          subject: subject.trim(),
          body: html,
          emails: recipients,
          target_audience: finalAudience,
        },
      });
      if (error) {
        // Quando a função retorna 4xx/5xx, o supabase-js entrega um
        // FunctionsHttpError com .message genérico ("non-2xx status code").
        // A mensagem real está no corpo da resposta (error.context).
        let realMessage = error.message;
        try {
          const ctx = (error as any)?.context;
          if (ctx && typeof ctx.json === "function") {
            const parsed = await ctx.json();
            if (parsed?.error) realMessage = parsed.error;
          }
        } catch {
          // corpo não era JSON — mantém a mensagem original
        }
        throw new Error(realMessage);
      }
      if (data?.error) throw new Error(data.error);
      return data as { ok: boolean; count: number; ses_message_id?: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-emails-sent"] });
      const count = data?.count ?? recipients.length;
      toast({ title: `✅ Campanha enviada para ${count} destinatário(s)!` });
      closeCompose(true);
    },
    onError: (err: any) => toast({
      title: "❌ Erro ao enviar e-mail.",
      description: err?.message || JSON.stringify(err),
      variant: "destructive",
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("emails_enviados").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-emails-sent"] });
      toast({ title: "✅ Registro excluído." });
    },
  });

  const closeCompose = (force: boolean | any = false) => {
    const isForced = force === true;
    if (!isForced && (doc.blocks.length > 0 || subject)) {
      if (!window.confirm("Deseja realmente sair? Todo o progresso do e-mail será perdido.")) {
        return;
      }
    }
    setComposeOpen(false);
    setStep(1);
    setSubject("");
    setDoc(emptyDoc());
    setSelectedPublicoId("");
  };

  const step1Valid = Boolean(subject.trim() && selectedPublicoId && recipients.length > 0);
  const canSend = step1Valid && doc.blocks.length > 0;

  // Reaproveita as configurações do molde DOX (rodapé, descadastro, "ver no
  // navegador") na próxima campanha, sem precisar reconfigurar tudo.
  useEffect(() => {
    const { footerImageUrl, footerImageHref, unsubscribeUrl, showViewInBrowser } = doc;
    localStorage.setItem(
      DOX_DEFAULTS_KEY,
      JSON.stringify({ footerImageUrl, footerImageHref, unsubscribeUrl, showViewInBrowser }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.footerImageUrl, doc.footerImageHref, doc.unsubscribeUrl, doc.showViewInBrowser]);

  if (composeOpen) {
    return (
      <div className="admin-scope space-y-6 font-['Inter',sans-serif] text-sm">
        <div className="flex flex-col gap-1 border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={closeCompose} className="h-8 w-8 text-zinc-500 hover:text-zinc-800">
               <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>Nova Campanha</h2>
          </div>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 ml-10">
            {step === 1 ? "Etapa 1 de 2 · Nome e público" : "Etapa 2 de 2 · Monte o e-mail e envie"}
          </p>
        </div>

        {/* Indicador de etapas */}
        <div className="flex items-center gap-2 pb-1">
          {[1, 2].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= n ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-500"
              }`}>{step > n ? <Check className="h-3.5 w-3.5" /> : n}</span>
              <span style={{ ...s, fontSize: "0.75rem" }} className={step >= n ? "text-zinc-800 font-medium" : "text-zinc-400"}>
                {n === 1 ? "Nome e público" : "Construtor"}
              </span>
              {n === 1 && <span className="w-8 h-px bg-zinc-200 mx-1" />}
            </div>
          ))}
        </div>

        {/* ETAPA 1 — Nome + Público */}
        {step === 1 && (
          <div className="space-y-5 py-2 max-w-4xl">
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Nome da campanha (assunto do e-mail)</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Informativo de Julho — Instituto Suinã" className="!text-sm" autoFocus />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Público (para quem enviar)</label>
                <Link to="/admin/email-marketing/publicos" className="text-emerald-600 hover:text-emerald-700 font-medium" style={{ ...s, fontSize: "0.75rem" }}>
                  Gerenciar públicos →
                </Link>
              </div>

              {publicosLoading ? (
                <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : !publicos?.length ? (
                <div className="text-center py-8 border border-dashed border-zinc-200 rounded-lg">
                  <Users className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                  <p style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-400">Nenhum público cadastrado.</p>
                  <Link to="/admin/email-marketing/publicos">
                    <Button variant="outline" className="!text-sm mt-3">Cadastrar um público</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {publicos.map((p) => {
                    const active = selectedPublicoId === p.id;
                    return (
                      <button key={p.id} onClick={() => setSelectedPublicoId(p.id)}
                        className={`text-left px-4 py-3 rounded-lg border transition-colors ${
                          active ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" : "border-zinc-200 bg-white hover:border-emerald-300"
                        }`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-zinc-800 truncate" style={{ ...s, fontSize: "0.875rem" }}>{p.name}</span>
                          {active && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                        </div>
                        <span className="text-zinc-400" style={{ ...s, fontSize: "0.75rem" }}>
                          {(p.emails?.length || 0).toLocaleString("pt-BR")} destinatário(s)
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
              <Button variant="outline" onClick={closeCompose} className="!text-sm">Cancelar</Button>
              <Button onClick={() => setStep(2)} disabled={!step1Valid}
                className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
                Continuar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ETAPA 2 — Construtor (molde DOX) */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            {/* Barra de ação no topo: finalizar e enviar */}
            <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-white/95 backdrop-blur border-b border-zinc-100 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(1)} className="!text-sm text-zinc-600">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <div className="flex items-center gap-3">
                <span style={{ ...s, fontSize: "0.75rem" }} className="text-zinc-400 hidden sm:inline">
                  {finalAudience} · {recipients.length.toLocaleString("pt-BR")} destinatário(s)
                </span>
                <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending || !canSend}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
                  <Send className="h-4 w-4 mr-2" /> {sendMutation.isPending ? "Enviando..." : "Finalizar e enviar campanha"}
                </Button>
              </div>
            </div>

            <EmailBuilder doc={doc} onChange={setDoc} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-scope space-y-6 font-['Inter',sans-serif] text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>E-mail Marketing</h2>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">Crie campanhas e envie para seus públicos</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/email-marketing/publicos">
            <Button variant="outline" className="!text-sm">
              <Users className="h-4 w-4 mr-2" /> Públicos
            </Button>
          </Link>
          <Button onClick={() => { setStep(1); setComposeOpen(true); }} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
            <Send className="h-4 w-4 mr-2" /> Nova Campanha
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total enviados", value: emails?.length || 0 },
          { label: "Públicos", value: publicos?.length || 0 },
          ...audiences.slice(0, 2).map((a) => ({
            label: a,
            value: emails?.filter((e) => e.target_audience === a).length || 0,
          })),
        ].map((card) => (
          <div key={card.label} className="bg-white shadow-sm rounded-xl p-4 border border-zinc-100">
            <p className="text-zinc-500" style={{ ...s, fontSize: "0.75rem" }}>{card.label}</p>
            {isLoading ? (
              <Skeleton className="h-6 w-10 mt-1" />
            ) : (
              <p className="font-bold text-zinc-800 mt-1" style={{ ...s, fontSize: "1.25rem", lineHeight: "1" }}>{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h3 className="font-bold text-zinc-800" style={{ ...s, fontSize: "0.9375rem" }}>Histórico de envios</h3>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !emails?.length ? (
          <div className="text-center py-16">
            <Mail className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">Nenhum e-mail enviado ainda.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50">
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600">Assunto</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600">Público</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600 hidden sm:table-cell">Data</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((email) => (
                <TableRow key={email.id} className="hover:bg-zinc-50">
                  <TableCell style={{ ...s, fontSize: "0.875rem" }} className="font-medium text-zinc-800">{email.subject}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700" style={s}>
                      {email.target_audience}
                    </span>
                  </TableCell>
                  <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500 hidden sm:table-cell">
                    {new Date(email.sent_at).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <a href={campaignUrl(email.id)} target="_blank" rel="noreferrer" title="Abrir versão web da campanha">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-600">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => deleteMutation.mutate(email.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdminEmailMarketing;
