import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Trash2, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

type Report = Tables<"relatorios">;
type AccessLog = Tables<"acessos_relatorios">;

const s = { fontFamily: "'Inter', sans-serif" } as const;

const AdminTransparency = () => {
  const [activeView, setActiveView] = useState<"reports" | "logs">("reports");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: reports, isLoading: loadingReports } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("relatorios").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Report[];
    },
  });

  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ["admin-access-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acessos_relatorios")
        .select("*, relatorios(title)")
        .order("access_time", { ascending: false });
      if (error) throw error;
      return data as (AccessLog & { relatorios: { title: string } | null })[];
    },
    enabled: activeView === "logs",
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !title.trim()) throw new Error("Preencha todos os campos");
      setUploading(true);
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("reports").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("reports").getPublicUrl(fileName);
      const { error } = await supabase.from("relatorios").insert({
        title: title.trim(),
        file_url: urlData.publicUrl,
        description: description.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast({ title: "✅ Relatório enviado com sucesso!" });
      setUploadOpen(false);
      setTitle("");
      setDescription("");
      setFile(null);
      setUploading(false);
    },
    onError: (e) => {
      toast({ title: "❌ Erro ao enviar relatório.", description: e.message, variant: "destructive" });
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("relatorios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast({ title: "✅ Relatório excluído." });
    },
  });

  const exportCSV = () => {
    if (!logs?.length) return;
    const header = "Nome,E-mail,Documento Acessado,Data e Hora\n";
    const rows = logs.map((l) =>
      `"${l.user_name}","${l.user_email}","${l.relatorios?.title || ""}","${new Date(l.access_time).toLocaleString("pt-BR")}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `acessos_relatorios_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem", color: "#27272a" }}>
            Transparência e Prestação de Contas
          </h2>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
            Gerencie relatórios e acompanhe acessos
          </p>
        </div>
        <div className="flex gap-2">
          {activeView === "logs" && (
            <Button onClick={exportCSV} variant="outline" className="!text-sm">
              <Download className="h-4 w-4 mr-2" /> Exportar CSV
            </Button>
          )}
          <Button onClick={() => setUploadOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
            <Upload className="h-4 w-4 mr-2" /> Upload de Relatório
          </Button>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveView("reports")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === "reports" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}
          style={{ ...s, fontSize: "0.8125rem" }}>
          Relatórios
        </button>
        <button onClick={() => setActiveView("logs")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === "logs" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}
          style={{ ...s, fontSize: "0.8125rem" }}>
          Logs de Acesso
        </button>
      </div>

      {activeView === "reports" ? (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {loadingReports ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !reports?.length ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
              <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">Nenhum relatório enviado ainda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50">
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600">Título</TableHead>
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 hidden sm:table-cell">Descrição</TableHead>
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 hidden md:table-cell">Data</TableHead>
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id} className="hover:bg-zinc-50">
                    <TableCell style={{ ...s, fontSize: "0.875rem" }} className="font-medium text-zinc-800">{r.title}</TableCell>
                    <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500 hidden sm:table-cell">{r.description || "—"}</TableCell>
                    <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500 hidden md:table-cell">
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600" asChild>
                          <a href={r.file_url} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /></a>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => deleteMutation.mutate(r.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {loadingLogs ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !logs?.length ? (
            <div className="text-center py-16">
              <Eye className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
              <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">Nenhum acesso registrado ainda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50">
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600">Nome</TableHead>
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600">E-mail</TableHead>
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 hidden md:table-cell">Documento</TableHead>
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-semibold text-zinc-600 hidden sm:table-cell">Data e Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id} className="hover:bg-zinc-50">
                    <TableCell style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-800">{l.user_name}</TableCell>
                    <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500">{l.user_email}</TableCell>
                    <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500 hidden md:table-cell">{l.relatorios?.title || "—"}</TableCell>
                    <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500 hidden sm:table-cell">
                      {new Date(l.access_time).toLocaleString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Upload de Relatório</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>Envie um PDF para a área de transparência.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Título</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do relatório" className="!text-sm" />
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Descrição (opcional)</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição" rows={3} className="!text-sm" />
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Arquivo PDF</label>
              <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)} className="!text-sm">Cancelar</Button>
            <Button onClick={() => uploadMutation.mutate()} disabled={uploading || !file || !title.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              {uploading ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTransparency;
