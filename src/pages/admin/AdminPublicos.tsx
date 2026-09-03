import { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Trash2, Upload, Plus, X, Pencil, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { parseRecipientFile, isValidEmail } from "@/lib/email/parseRecipients";

const s = { fontFamily: "'Inter', sans-serif" } as const;

type Publico = { id: string; name: string; emails: string[]; created_at: string };

/**
 * Editor reutilizável de um Público: nome + lista de e-mails com
 * adição manual, importação (csv/txt/xlsx) e remoção individual.
 */
function PublicoEditor({
  name, emails, onNameChange, onEmailsChange,
}: {
  name: string;
  emails: string[];
  onNameChange: (v: string) => void;
  onEmailsChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addEmail = () => {
    const email = input.trim().toLowerCase();
    if (!email) return;
    if (!isValidEmail(email)) {
      toast({ title: "E-mail inválido", variant: "destructive" });
      return;
    }
    if (emails.includes(email)) {
      toast({ title: "E-mail já está na lista" });
      setInput("");
      return;
    }
    onEmailsChange([...emails, email]);
    setInput("");
  };

  const removeEmail = (email: string) => onEmailsChange(emails.filter((e) => e !== email));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const found = await parseRecipientFile(file);
      if (!found.length) {
        toast({ title: "Nenhum e-mail encontrado no arquivo", variant: "destructive" });
      } else {
        const merged = Array.from(new Set([...emails, ...found]));
        const added = merged.length - emails.length;
        onEmailsChange(merged);
        toast({ title: `✅ ${added} novo(s) e-mail(s) importado(s) de ${found.length} encontrado(s)` });
      }
    } catch {
      toast({ title: "Erro ao ler o arquivo", variant: "destructive" });
    }
    e.target.value = "";
  };

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? emails.filter((em) => em.includes(q)) : emails;
  }, [emails, filter]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Nome do público</label>
        <Input value={name} onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ex: Geral - Informativo, Parceiros e apoiadores..." className="!text-sm" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">E-mails</label>
          <span style={{ ...s, fontSize: "0.75rem" }} className="text-zinc-400">{emails.length} destinatário(s)</span>
        </div>

        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
            placeholder="Digite um e-mail e pressione Enter" className="!text-sm flex-1" />
          <Button variant="outline" size="sm" onClick={addEmail} className="!text-sm shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-zinc-300 text-zinc-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
          <Upload className="h-4 w-4" />
          <span style={{ ...s, fontSize: "0.75rem" }}>Importar CSV / XLSX / TXT</span>
          <input ref={fileRef} type="file" accept=".csv,.txt,.xlsx,.xls" className="hidden" onChange={handleFile} />
        </label>

        {emails.length > 8 && (
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input value={filter} onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar e-mails..." className="!text-sm pl-8" />
          </div>
        )}

        {emails.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-2 bg-zinc-50 rounded-lg border border-zinc-100">
            {visible.map((email) => (
              <span key={email} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-zinc-200 rounded-full text-zinc-600"
                style={{ ...s, fontSize: "0.6875rem" }}>
                {email}
                <button onClick={() => removeEmail(email)} className="text-zinc-400 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {!visible.length && (
              <span style={{ ...s, fontSize: "0.75rem" }} className="text-zinc-400 px-1">Nenhum e-mail corresponde ao filtro.</span>
            )}
          </div>
        ) : (
          <p style={{ ...s, fontSize: "0.75rem" }} className="text-zinc-400">
            Adicione e-mails manualmente ou importe um arquivo.
          </p>
        )}
      </div>
    </div>
  );
}

const AdminPublicos = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Publico | null>(null);
  const [deleting, setDeleting] = useState<Publico | null>(null);

  // Form state (compartilhado entre criar e editar)
  const [formName, setFormName] = useState("");
  const [formEmails, setFormEmails] = useState<string[]>([]);

  const { data: publicos, isLoading } = useQuery({
    queryKey: ["admin-recipient-lists"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listas_destinatarios").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Publico[];
    },
  });

  const openCreate = () => {
    setFormName("");
    setFormEmails([]);
    setCreateOpen(true);
  };

  const openEdit = (p: Publico) => {
    setFormName(p.name);
    setFormEmails(p.emails ?? []);
    setEditing(p);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!formName.trim()) throw new Error("Dê um nome ao público");
      if (!formEmails.length) throw new Error("Adicione ao menos um e-mail");
      const { error } = await supabase.from("listas_destinatarios").insert({
        name: formName.trim(),
        emails: formEmails,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-recipient-lists"] });
      toast({ title: "✅ Público criado!" });
      setCreateOpen(false);
    },
    onError: (err: Error) => toast({ title: err.message || "Erro ao criar público", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      if (!formName.trim()) throw new Error("Dê um nome ao público");
      if (!formEmails.length) throw new Error("Adicione ao menos um e-mail");
      const { error } = await supabase.from("listas_destinatarios")
        .update({ name: formName.trim(), emails: formEmails })
        .eq("id", editing.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-recipient-lists"] });
      toast({ title: "✅ Público atualizado!" });
      setEditing(null);
    },
    onError: (err: Error) => toast({ title: err.message || "Erro ao atualizar público", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("listas_destinatarios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-recipient-lists"] });
      toast({ title: "✅ Público excluído." });
      setDeleting(null);
    },
    onError: (err: Error) => toast({ title: err.message || "Erro ao excluir", variant: "destructive" }),
  });

  const totalEmails = publicos?.reduce((acc, p) => acc + (p.emails?.length || 0), 0) ?? 0;

  return (
    <div className="admin-scope space-y-6 font-['Inter',sans-serif] text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>Públicos</h2>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
            Cadastre listas de e-mails para enviar os informativos
          </p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
          <Plus className="h-4 w-4 mr-2" /> Novo Público
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white shadow-sm rounded-xl p-4 border border-zinc-100">
          <p className="text-zinc-500" style={{ ...s, fontSize: "0.75rem" }}>Públicos cadastrados</p>
          {isLoading ? <Skeleton className="h-6 w-10 mt-1" /> : (
            <p className="font-bold text-zinc-800 mt-1" style={{ ...s, fontSize: "1.25rem", lineHeight: "1" }}>{publicos?.length || 0}</p>
          )}
        </div>
        <div className="bg-white shadow-sm rounded-xl p-4 border border-zinc-100">
          <p className="text-zinc-500" style={{ ...s, fontSize: "0.75rem" }}>Total de e-mails</p>
          {isLoading ? <Skeleton className="h-6 w-10 mt-1" /> : (
            <p className="font-bold text-zinc-800 mt-1" style={{ ...s, fontSize: "1.25rem", lineHeight: "1" }}>{totalEmails.toLocaleString("pt-BR")}</p>
          )}
        </div>
      </div>

      {/* Lista de públicos */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h3 className="font-bold text-zinc-800" style={{ ...s, fontSize: "0.9375rem" }}>
            <Users className="h-4 w-4 inline mr-2 text-zinc-400" />
            Meus públicos
          </h3>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !publicos?.length ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">Nenhum público cadastrado ainda.</p>
            <Button onClick={openCreate} variant="outline" className="!text-sm mt-4">
              <Plus className="h-4 w-4 mr-2" /> Criar primeiro público
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {publicos.map((p) => (
              <div key={p.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-zinc-50">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-800 truncate" style={{ ...s, fontSize: "0.875rem" }}>{p.name}</p>
                  <p className="text-zinc-400" style={{ ...s, fontSize: "0.75rem" }}>
                    {(p.emails?.length || 0).toLocaleString("pt-BR")} destinatário(s) · {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 !text-xs gap-1 text-zinc-500 hover:text-emerald-700"
                    onClick={() => openEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600"
                    onClick={() => setDeleting(p)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Criar público */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="admin-scope max-w-lg max-h-[92vh] overflow-y-auto text-sm">
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Novo Público</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>
              Dê um nome e adicione os e-mails (manualmente ou importando um arquivo).
            </DialogDescription>
          </DialogHeader>
          <PublicoEditor name={formName} emails={formEmails} onNameChange={setFormName} onEmailsChange={setFormEmails} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="!text-sm">Cancelar</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !formName.trim() || !formEmails.length}
              className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              {createMutation.isPending ? "Criando..." : "Criar Público"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editar público */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="admin-scope max-w-lg max-h-[92vh] overflow-y-auto text-sm">
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Editar Público</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>
              Renomeie, adicione ou remova e-mails deste público.
            </DialogDescription>
          </DialogHeader>
          <PublicoEditor name={formName} emails={formEmails} onNameChange={setFormName} onEmailsChange={setFormEmails} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} className="!text-sm">Cancelar</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !formName.trim() || !formEmails.length}
              className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="admin-scope max-w-md text-sm">
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Excluir público</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>
              Tem certeza que deseja excluir <strong>{deleting?.name}</strong> ({deleting?.emails?.length || 0} e-mail(s))? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)} className="!text-sm">Cancelar</Button>
            <Button onClick={() => deleting && deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white !text-sm">
              <Trash2 className="h-4 w-4 mr-2" /> {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPublicos;
