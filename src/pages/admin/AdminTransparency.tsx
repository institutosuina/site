import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Trash2, Eye, Download, FolderOpen, Plus, ArrowLeft, Pencil } from "lucide-react";
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

const s = { fontFamily: "'Inter', sans-serif" } as const;

/* ───── Project list component ───── */
const ProjectList = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [period, setPeriod] = useState("");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projetos")
        .select("*, relatorios(id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (any & { relatorios: { id: string }[] })[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Nome obrigatório");
      const { error } = await supabase.from("projetos").insert({
        name: name.trim(),
        period: period.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: "✅ Projeto criado!" });
      setCreateOpen(false);
      setName("");
      setPeriod("");
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projetos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: "✅ Projeto excluído." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingProjectId) throw new Error("Projeto não selecionado");
      if (!name.trim()) throw new Error("Nome obrigatório");
      const { error } = await supabase
        .from("projetos")
        .update({ name: name.trim(), period: period.trim() || null })
        .eq("id", editingProjectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: "✅ Projeto atualizado!" });
      setEditOpen(false);
      setEditingProjectId(null);
      setName("");
      setPeriod("");
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const openEdit = (project: any) => {
    setEditingProjectId(project.id);
    setName(project.name || "");
    setPeriod(project.period || "");
    setEditOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>Projetos</h2>
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">Gerencie projetos e seus relatórios de prestação de contas</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
          <Plus className="h-4 w-4 mr-2" /> Novo Projeto
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : !projects?.length ? (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <FolderOpen className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">Nenhum projeto criado ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-zinc-200 p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
              <button onClick={() => onSelect(p.id)} className="flex-1 text-left">
                <h3 style={{ ...s, fontSize: "1rem" }} className="font-bold text-zinc-800">{p.name}</h3>
                <p style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-400 mt-0.5">
                  {p.period || "Sem período"} · {p.relatorios?.length || 0} relatório(s)
                </p>
              </button>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-600" onClick={() => onSelect(p.id)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => deleteMutation.mutate(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Novo Projeto</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>Crie um projeto para agrupar relatórios.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Nome do Projeto</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Viver o Viveiro" className="!text-sm" />
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Período (opcional)</label>
              <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Ex: 2023-2024" className="!text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="!text-sm">Cancelar</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name.trim()} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Editar Projeto</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>Atualize os dados do projeto.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Nome do Projeto</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="!text-sm" />
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Período (opcional)</label>
              <Input value={period} onChange={(e) => setPeriod(e.target.value)} className="!text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="!text-sm">Cancelar</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={!name.trim() || updateMutation.isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ───── Project detail (reports + logs) ───── */
const ProjectDetail = ({ projectId, onBack }: { projectId: string; onBack: () => void }) => {
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<"reports" | "logs">("reports");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editReportOpen, setEditReportOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: project } = useQuery({
    queryKey: ["admin-project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("projetos").select("*").eq("id", projectId).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: reports, isLoading: loadingReports } = useQuery({
    queryKey: ["admin-project-reports", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("relatorios").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ["admin-project-logs", projectId],
    queryFn: async () => {
      const reportIds = reports?.map(r => r.id) || [];
      if (!reportIds.length) return [];
      const { data, error } = await supabase
        .from("acessos_relatorios")
        .select("*, relatorios(title)")
        .in("report_id", reportIds)
        .order("access_time", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: activeView === "logs" && !!reports,
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
        project_id: projectId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-project-reports", projectId] });
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: "✅ Relatório enviado!" });
      setUploadOpen(false);
      setTitle("");
      setDescription("");
      setFile(null);
      setUploading(false);
    },
    onError: (e: any) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("relatorios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-project-reports", projectId] });
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      toast({ title: "✅ Relatório excluído." });
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async () => {
      if (!editingReportId) throw new Error("Relatório não selecionado");
      if (!title.trim()) throw new Error("Título obrigatório");
      const { error } = await supabase
        .from("relatorios")
        .update({ title: title.trim(), description: description.trim() || null })
        .eq("id", editingReportId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-project-reports", projectId] });
      toast({ title: "✅ Relatório atualizado!" });
      setEditReportOpen(false);
      setEditingReportId(null);
      setTitle("");
      setDescription("");
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const openEditReport = (report: any) => {
    setEditingReportId(report.id);
    setTitle(report.title || "");
    setDescription(report.description || "");
    setEditReportOpen(true);
  };

  const exportCSV = () => {
    if (!logs?.length) return;
    const header = "Nome,E-mail,Documento,Data e Hora\n";
    const rows = logs.map((l: any) =>
      `"${l.user_name}","${l.user_email}","${l.relatorios?.title || ""}","${new Date(l.access_time).toLocaleString("pt-BR")}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `acessos_${project?.name || "projeto"}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>{project?.name || "Projeto"}</h2>
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500">{project?.period || ""}</p>
          </div>
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
            <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !reports?.length ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
              <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">Nenhum relatório neste projeto.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50">
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600">Título</TableHead>
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600 hidden sm:table-cell">Descrição</TableHead>
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600 hidden md:table-cell">Data</TableHead>
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600 text-right">Ações</TableHead>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-600" onClick={() => openEditReport(r)}>
                          <Pencil className="h-4 w-4" />
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
            <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !logs?.length ? (
            <div className="text-center py-16">
              <Eye className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
              <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">Nenhum acesso registrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50">
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600">Nome</TableHead>
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600">E-mail</TableHead>
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600 hidden md:table-cell">Documento</TableHead>
                  <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600 hidden sm:table-cell">Data e Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l: any) => (
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
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>Envie um PDF para o projeto {project?.name}.</DialogDescription>
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

      <Dialog open={editReportOpen} onOpenChange={setEditReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Editar Relatório</DialogTitle>
            <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>Atualize os dados do material na transparência.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Título</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="!text-sm" />
            </div>
            <div className="space-y-2">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Descrição (opcional)</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="!text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditReportOpen(false)} className="!text-sm">Cancelar</Button>
            <Button onClick={() => updateReportMutation.mutate()} disabled={!title.trim() || updateReportMutation.isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
              {updateReportMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ───── Page access logs component ───── */
const PageAccessLogs = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-page-access-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acessos_pagina")
        .select("*")
        .eq("page", "prestacao-de-contas")
        .order("access_time", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const exportCSV = () => {
    if (!logs?.length) return;
    const header = "Nome,E-mail,Página,Data e Hora\n";
    const rows = logs.map((l) =>
      `"${l.user_name}","${l.user_email}","${l.page}","${new Date(l.access_time).toLocaleString("pt-BR")}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `acessos_pagina_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.125rem" }}>Logs de Acesso — Prestação de Contas</h3>
          <p style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500 mt-0.5">
            Registros de quem preencheu o formulário LGPD para acessar a página
          </p>
        </div>
        {logs?.length ? (
          <Button onClick={exportCSV} variant="outline" className="!text-sm">
            <Download className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
        ) : null}
      </div>
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !logs?.length ? (
          <div className="text-center py-12">
            <Eye className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">Nenhum acesso registrado ainda.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50">
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600">Nome</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600">E-mail</TableHead>
                <TableHead style={{ ...s, fontSize: "0.75rem" }} className="font-bold text-zinc-600 hidden sm:table-cell">Data e Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id} className="hover:bg-zinc-50">
                  <TableCell style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-800">{l.user_name}</TableCell>
                  <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500">{l.user_email}</TableCell>
                  <TableCell style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500 hidden sm:table-cell">
                    {new Date(l.access_time).toLocaleString("pt-BR")}
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

/* ───── Main component ───── */
const AdminTransparency = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  if (selectedProject) {
    return (
      <div className="font-['Inter',sans-serif]">
        <ProjectDetail projectId={selectedProject} onBack={() => setSelectedProject(null)} />
      </div>
    );
  }

  return (
    <div className="font-['Inter',sans-serif] space-y-10">
      <ProjectList onSelect={setSelectedProject} />
      <PageAccessLogs />
    </div>
  );
};

export default AdminTransparency;
