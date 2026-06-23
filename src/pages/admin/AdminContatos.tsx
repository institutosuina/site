import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Mail, Trash2, MailOpen, Reply } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

type Contato = Tables<"contatos">;
const s = { fontFamily: "'Inter', sans-serif" } as const;

const AdminContatos = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Contato | null>(null);
  const queryClient = useQueryClient();

  const { data: contatos, isLoading } = useQuery({
    queryKey: ["admin-contatos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contatos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Contato[];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async ({ id, lido }: { id: string; lido: boolean }) => {
      const { error } = await supabase.from("contatos").update({ lido }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-contatos"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contatos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contatos"] });
      toast({ title: "✅ Mensagem excluída." });
    },
  });

  const openMessage = (contato: Contato) => {
    setSelected(contato);
    if (!contato.lido) markReadMutation.mutate({ id: contato.id, lido: true });
  };

  const replyMailto = (contato: Contato) => {
    const subject = `Re: Sua mensagem para o Instituto Suinã`;
    const quoted = contato.mensagem.split("\n").map((l) => `> ${l}`).join("\n");
    const body = `Olá, ${contato.nome}!\n\n\n\n---\nEm ${new Date(contato.created_at).toLocaleString("pt-BR")}, você escreveu:\n${quoted}`;
    window.location.href = `mailto:${contato.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const filtered = contatos?.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.mensagem.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = contatos?.filter((c) => !c.lido).length || 0;

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div>
        <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem", color: "#27272a" }}>Contatos</h2>
        <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
          Mensagens recebidas pelo formulário de contato do site
          {unreadCount > 0 && ` · ${unreadCount} não lida(s)`}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input placeholder="Buscar mensagens..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 !text-sm" />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !filtered?.length ? (
          <div className="text-center py-16">
            <Mail className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">
              {search ? "Nenhum resultado encontrado." : "Nenhuma mensagem recebida ainda."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50">
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600">Nome</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600">E-mail</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 hidden md:table-cell">Mensagem</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 hidden sm:table-cell">Data</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className={`hover:bg-zinc-50 cursor-pointer ${!c.lido ? "bg-emerald-50/40" : ""}`} onClick={() => openMessage(c)}>
                  <TableCell style={{ ...s, fontSize: "0.875rem" }} className={`text-zinc-800 ${!c.lido ? "font-bold" : "font-medium"}`}>{c.nome}</TableCell>
                  <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500">{c.email}</TableCell>
                  <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500 hidden md:table-cell max-w-xs truncate">{c.mensagem}</TableCell>
                  <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500 hidden sm:table-cell">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600"
                      onClick={() => replyMailto(c)} title="Responder por e-mail">
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-600"
                      onClick={() => markReadMutation.mutate({ id: c.id, lido: !c.lido })} title={c.lido ? "Marcar como não lida" : "Marcar como lida"}>
                      <MailOpen className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => deleteMutation.mutate(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="admin-scope max-w-lg text-sm">
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>{selected?.nome}</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>
              {selected?.email} · {selected && new Date(selected.created_at).toLocaleString("pt-BR")}
            </DialogDescription>
          </DialogHeader>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-700 whitespace-pre-wrap">{selected?.mensagem}</p>
          <DialogFooter>
            <Button onClick={() => selected && replyMailto(selected)} className="bg-blue-600 hover:bg-blue-700 text-white !text-sm">
              <Reply className="h-4 w-4 mr-2" /> Responder por e-mail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContatos;
