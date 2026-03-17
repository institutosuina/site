import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Send, Mail, Clock, Users, Trash2 } from "lucide-react";
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
  const [audience, setAudience] = useState("Comunidade Técnica");
  const queryClient = useQueryClient();

  const { data: emails, isLoading } = useQuery({
    queryKey: ["admin-emails-sent"],
    queryFn: async () => {
      const { data, error } = await supabase.from("emails_enviados").select("*").order("sent_at", { ascending: false });
      if (error) throw error;
      return data as EmailSent[];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!subject.trim() || !body.trim()) throw new Error("Preencha todos os campos");
      const { error } = await supabase.from("emails_enviados").insert({
        subject: subject.trim(),
        body: body.trim(),
        target_audience: audience,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-emails-sent"] });
      toast({ title: "✅ E-mail marketing enviado com sucesso!" });
      setComposeOpen(false);
      setSubject("");
      setBody("");
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

  const stats = {
    total: emails?.length || 0,
    doadores: emails?.filter((e) => e.target_audience === "Doadores").length || 0,
    voluntarios: emails?.filter((e) => e.target_audience === "Voluntários").length || 0,
    comunidade: emails?.filter((e) => e.target_audience === "Comunidade Técnica").length || 0,
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem", color: "#27272a" }}>
            E-mail Marketing
          </h2>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
            Redija e envie campanhas de e-mail para seu público
          </p>
        </div>
        <Button onClick={() => setComposeOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
          <Send className="h-4 w-4 mr-2" /> Nova Campanha
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total enviados", value: stats.total, icon: Mail, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Doadores", value: stats.doadores, icon: Users, color: "text-green-600", bg: "bg-green-50" },
          { label: "Voluntários", value: stats.voluntarios, icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Comunidade Técnica", value: stats.comunidade, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((card) => (
          <div key={card.label} className="bg-white shadow-sm rounded-xl p-4 border border-zinc-100">
            <div className="flex items-center gap-3">
              <div className={`${card.bg} p-2 rounded-lg`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <div>
                <p className="text-zinc-500" style={{ ...s, fontSize: "0.75rem" }}>{card.label}</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-10 mt-0.5" />
                ) : (
                  <p className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.25rem", lineHeight: "1" }}>{card.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* History table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-800" style={{ ...s, fontSize: "0.9375rem" }}>Histórico de envios</h3>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !emails?.length ? (
          <div className="text-center py-16">
            <Mail className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">
              Nenhum e-mail enviado ainda. Crie sua primeira campanha!
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50">
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600">Assunto</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600">Público</TableHead>
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Nova Campanha de E-mail</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>Redija e envie um e-mail para o público selecionado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Público-alvo</label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger className="!text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doadores">Doadores</SelectItem>
                  <SelectItem value="Voluntários">Voluntários</SelectItem>
                  <SelectItem value="Comunidade Técnica">Comunidade Técnica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Assunto</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Assunto do e-mail" className="!text-sm" />
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Conteúdo</label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Corpo do e-mail..." rows={8} className="!text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)} className="!text-sm">Cancelar</Button>
            <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending || !subject.trim() || !body.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              <Send className="h-4 w-4 mr-2" /> {sendMutation.isPending ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEmailMarketing;
