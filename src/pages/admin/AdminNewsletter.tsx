import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Search, Users, Trash2, Send } from "lucide-react";
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

type Subscriber = Tables<"subscribers">;

const s = { fontFamily: "'Inter', sans-serif" } as const;

const AdminNewsletter = () => {
  const [search, setSearch] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("Comunidade Técnica");
  const queryClient = useQueryClient();

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["admin-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Subscriber[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subscribers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscribers"] });
      toast({ title: "✅ Inscrito removido." });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      if (!subject.trim() || !body.trim()) throw new Error("Preencha todos os campos");
      // Log the email for now (Resend Edge Function can be added later)
      const { error } = await supabase.from("emails_enviados").insert({
        subject: subject.trim(),
        body: body.trim(),
        target_audience: audience,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "✅ E-mail marketing registrado com sucesso!" });
      setEmailOpen(false);
      setSubject("");
      setBody("");
    },
    onError: () => toast({ title: "❌ Erro ao enviar e-mail.", variant: "destructive" }),
  });

  const filtered = subscribers?.filter((sub) =>
    sub.name.toLowerCase().includes(search.toLowerCase()) ||
    sub.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem", color: "#27272a" }}>Newsletter</h2>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">Gerencie inscritos e envie e-mail marketing</p>
        </div>
        <Button onClick={() => setEmailOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
          <Mail className="h-4 w-4 mr-2" /> Enviar E-mail Marketing
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input placeholder="Buscar inscritos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 !text-sm" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !filtered?.length ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">
              {search ? "Nenhum resultado encontrado." : "Nenhum inscrito ainda."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50">
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600">Nome</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600">E-mail</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 hidden sm:table-cell">Data de Inscrição</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-zinc-50">
                  <TableCell style={{ ...s, fontSize: "0.875rem" }} className="font-medium text-zinc-800">{sub.name}</TableCell>
                  <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500">{sub.email}</TableCell>
                  <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500 hidden sm:table-cell">
                    {new Date(sub.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => deleteMutation.mutate(sub.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Send Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Enviar E-mail Marketing</DialogTitle>
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
            <Button variant="outline" onClick={() => setEmailOpen(false)} className="!text-sm">Cancelar</Button>
            <Button onClick={() => sendEmailMutation.mutate()} disabled={sendEmailMutation.isPending || !subject.trim() || !body.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              <Send className="h-4 w-4 mr-2" /> {sendEmailMutation.isPending ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNewsletter;
