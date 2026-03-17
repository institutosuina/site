import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Send, Mail, Trash2, Upload, Plus, X, Save, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";

type EmailSent = Tables<"emails_enviados">;
const s = { fontFamily: "'Inter', sans-serif" } as const;

const AdminEmailMarketing = () => {
  const [composeOpen, setComposeOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("");
  const [customAudience, setCustomAudience] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [saveListName, setSaveListName] = useState("");
  const [saveListOpen, setSaveListOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: emails, isLoading } = useQuery({
    queryKey: ["admin-emails-sent"],
    queryFn: async () => {
      const { data, error } = await supabase.from("emails_enviados").select("*").order("sent_at", { ascending: false });
      if (error) throw error;
      return data as EmailSent[];
    },
  });

  // Saved recipient lists
  const { data: savedLists, isLoading: listsLoading } = useQuery({
    queryKey: ["admin-recipient-lists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listas_destinatarios").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as { id: string; name: string; emails: string[]; created_at: string }[];
    },
  });

  const audiences = Array.from(new Set(emails?.map((e) => e.target_audience) || []));

  const sendMutation = useMutation({
    mutationFn: async () => {
      const finalAudience = audience === "__custom" ? customAudience.trim() : audience;
      if (!subject.trim() || !body.trim() || !finalAudience) throw new Error("Preencha todos os campos");
      const { error } = await supabase.from("emails_enviados").insert({
        subject: subject.trim(),
        body: body.trim(),
        target_audience: finalAudience,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-emails-sent"] });
      toast({ title: "✅ E-mail marketing enviado com sucesso!" });
      closeCompose();
    },
    onError: () => toast({ title: "❌ Erro ao enviar e-mail.", variant: "destructive" }),
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

  const saveListMutation = useMutation({
    mutationFn: async () => {
      if (!saveListName.trim()) throw new Error("Nome obrigatório");
      if (!recipients.length) throw new Error("Lista vazia");
      const { error } = await supabase.from("listas_destinatarios").insert({
        name: saveListName.trim(),
        emails: recipients,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-recipient-lists"] });
      toast({ title: "✅ Lista salva com sucesso!" });
      setSaveListOpen(false);
      setSaveListName("");
    },
    onError: (err: Error) => toast({ title: err.message || "Erro ao salvar lista", variant: "destructive" }),
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("listas_destinatarios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-recipient-lists"] });
      toast({ title: "✅ Lista excluída." });
    },
  });

  const closeCompose = () => {
    setComposeOpen(false);
    setSubject("");
    setBody("");
    setAudience("");
    setCustomAudience("");
    setRecipients([]);
    setRecipientInput("");
  };

  const addRecipient = () => {
    const email = recipientInput.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "E-mail inválido", variant: "destructive" });
      return;
    }
    if (recipients.includes(email)) return;
    setRecipients([...recipients, email]);
    setRecipientInput("");
  };

  const loadSavedList = (listId: string) => {
    const list = savedLists?.find((l) => l.id === listId);
    if (!list) return;
    const merged = Array.from(new Set([...recipients, ...list.emails]));
    setRecipients(merged);
    toast({ title: `✅ Lista "${list.name}" carregada (${list.emails.length} e-mails)` });
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const emailRegex = /[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+/g;
      const found = text.match(emailRegex) || [];
      const unique = Array.from(new Set([...recipients, ...found.map((em) => em.toLowerCase())]));
      setRecipients(unique);
      toast({ title: `✅ ${found.length} e-mail(s) importado(s)` });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const finalAudience = audience === "__custom" ? customAudience.trim() : audience;
  const canSend = subject.trim() && body.trim() && finalAudience;

  return (
    <div className="admin-scope space-y-6 font-['Inter',sans-serif] text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>E-mail Marketing</h2>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">Crie campanhas, defina nichos e importe listas</p>
        </div>
        <Button onClick={() => setComposeOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
          <Send className="h-4 w-4 mr-2" /> Nova Campanha
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total enviados", value: emails?.length || 0 },
          { label: "Listas salvas", value: savedLists?.length || 0 },
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

      {/* Saved Lists */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-800" style={{ ...s, fontSize: "0.9375rem" }}>
            <FolderOpen className="h-4 w-4 inline mr-2 text-zinc-400" />
            Listas de Destinatários Salvas
          </h3>
        </div>
        {listsLoading ? (
          <div className="p-6 space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !savedLists?.length ? (
          <div className="text-center py-10">
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">Nenhuma lista salva ainda. Crie uma campanha e salve a lista de destinatários.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {savedLists.map((list) => (
              <div key={list.id} className="px-6 py-3 flex items-center justify-between hover:bg-zinc-50">
                <div>
                  <p className="font-medium text-zinc-800" style={{ ...s, fontSize: "0.875rem" }}>{list.name}</p>
                  <p className="text-zinc-400" style={{ ...s, fontSize: "0.75rem" }}>
                    {list.emails.length} destinatário(s) · {new Date(list.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600"
                  onClick={() => deleteListMutation.mutate(list.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-800" style={{ ...s, fontSize: "0.9375rem" }}>Histórico de envios</h3>
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
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600">Assunto</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600">Nicho / Público</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 hidden sm:table-cell">Data</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 text-right">Ações</TableHead>
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

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="admin-scope max-w-2xl max-h-[90vh] overflow-y-auto text-sm">
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Nova Campanha</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>
              Defina o nicho, importe destinatários e redija seu e-mail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Audience */}
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Nicho / Público-alvo</label>
              <div className="flex flex-wrap gap-2">
                {audiences.map((a) => (
                  <button key={a} onClick={() => { setAudience(a); setCustomAudience(""); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${audience === a ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-zinc-600 border-zinc-200 hover:border-emerald-300"}`} style={s}>
                    {a}
                  </button>
                ))}
                <button onClick={() => setAudience("__custom")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${audience === "__custom" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-zinc-600 border-zinc-200 hover:border-emerald-300"}`} style={s}>
                  <Plus className="h-3 w-3 inline mr-1" />Criar novo nicho
                </button>
              </div>
              {audience === "__custom" && (
                <Input value={customAudience} onChange={(e) => setCustomAudience(e.target.value)}
                  placeholder="Ex: Parceiros Institucionais, Educadores..." className="!text-sm mt-2" autoFocus />
              )}
            </div>

            {/* Recipients */}
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Lista de destinatários</label>

              {/* Load saved list */}
              {savedLists && savedLists.length > 0 && (
                <div className="flex items-center gap-2">
                  <Select onValueChange={loadSavedList}>
                    <SelectTrigger className="!text-sm flex-1">
                      <SelectValue placeholder="Carregar lista salva..." />
                    </SelectTrigger>
                    <SelectContent>
                      {savedLists.map((list) => (
                        <SelectItem key={list.id} value={list.id}>
                          {list.name} ({list.emails.length} e-mails)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2">
                <Input value={recipientInput} onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRecipient())}
                  placeholder="Digite um e-mail e pressione Enter" className="!text-sm flex-1" />
                <Button variant="outline" size="sm" onClick={addRecipient} className="!text-sm shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-zinc-300 text-zinc-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span style={{ ...s, fontSize: "0.75rem" }}>Importar CSV / TXT</span>
                  <input type="file" accept=".csv,.txt" className="hidden" onChange={handleImportCSV} />
                </label>
                {recipients.length > 0 && (
                  <>
                    <span style={{ ...s, fontSize: "0.75rem" }} className="text-zinc-400">
                      {recipients.length} destinatário(s)
                    </span>
                    <Button variant="outline" size="sm" className="!text-xs gap-1" onClick={() => setSaveListOpen(true)}>
                      <Save className="h-3 w-3" /> Salvar lista
                    </Button>
                  </>
                )}
              </div>
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-zinc-50 rounded-lg">
                  {recipients.map((email) => (
                    <span key={email} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-zinc-200 rounded-full text-zinc-600"
                      style={{ ...s, fontSize: "0.6875rem" }}>
                      {email}
                      <button onClick={() => setRecipients(recipients.filter((r) => r !== email))} className="text-zinc-400 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Assunto</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Assunto do e-mail" className="!text-sm" />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Conteúdo</label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Corpo do e-mail..." rows={8} className="!text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCompose} className="!text-sm">Cancelar</Button>
            <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending || !canSend}
              className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              <Send className="h-4 w-4 mr-2" /> {sendMutation.isPending ? "Enviando..." : "Enviar Campanha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save List Dialog */}
      <Dialog open={saveListOpen} onOpenChange={setSaveListOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Salvar Lista de Destinatários</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>
              Dê um nome para esta lista com {recipients.length} e-mail(s) para reutilizá-la em futuras campanhas.
            </DialogDescription>
          </DialogHeader>
          <Input value={saveListName} onChange={(e) => setSaveListName(e.target.value)}
            placeholder="Ex: Doadores 2026, Educadores SP..." className="!text-sm"
            onKeyDown={(e) => e.key === "Enter" && saveListMutation.mutate()} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveListOpen(false)} className="!text-sm">Cancelar</Button>
            <Button onClick={() => saveListMutation.mutate()} disabled={saveListMutation.isPending || !saveListName.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              <Save className="h-4 w-4 mr-2" /> {saveListMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEmailMarketing;
