import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Trash2, Eye, Download, FolderOpen, Plus, ArrowLeft, Pencil, Check, X } from "lucide-react";
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

/* ───── Institutional documents (LGPD, Estatuto, Portfólio) ───── */
type InstitutionalDocKey = "lgpd" | "estatuto" | "portfolio";

const INSTITUTIONAL_DOCS: { key: InstitutionalDocKey; label: string; color: string; defaultName: string }[] = [
  { key: "lgpd", label: "Política e Manual de Boas práticas (LGPD)", color: "bg-[#2D5A41]", defaultName: "Manual_LGPD_Suina.pdf" },
  { key: "estatuto", label: "Estatuto social", color: "bg-[#759580]", defaultName: "Estatuto_Suina.pdf" },
  { key: "portfolio", label: "Portfólio de Atividades", color: "bg-[#8B5A2B]", defaultName: "Portfolio_Suina.pdf" },
];

const InstitutionalDocs = () => {
  const queryClient = useQueryClient();
  const [uploadingKey, setUploadingKey] = useState<InstitutionalDocKey | null>(null);

  const { data: overrides, isLoading } = useQuery({
    queryKey: ["admin-transparencia-docs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_page_content")
        .select("content")
        .eq("page_key", "transparencia_docs")
        .maybeSingle();
      if (error) throw error;
      return (data?.content as Partial<Record<InstitutionalDocKey, string>> | null) ?? {};
    },
  });

  const handleReplace = async (key: InstitutionalDocKey, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: "❌ Envie um arquivo PDF", variant: "destructive" });
      return;
    }
    setUploadingKey(key);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `transparencia/${key}-${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("reports").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("reports").getPublicUrl(path);

      const nextContent = { ...(overrides ?? {}), [key]: urlData.publicUrl };
      const { error } = await supabase.from("site_page_content").upsert(
        { page_key: "transparencia_docs", content: nextContent, updated_at: new Date().toISOString() },
        { onConflict: "page_key" },
      );
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["admin-transparencia-docs"] });
      queryClient.invalidateQueries({ queryKey: ["transparencia-docs"] });
      toast({ title: "✅ PDF atualizado!" });
    } catch (err: any) {
      toast({ title: "❌ Erro ao substituir PDF", description: err.message, variant: "destructive" });
    } finally {
      setUploadingKey(null);
    }
  };

  const fileNameFromUrl = (url?: string, fallback?: string) => {
    if (!url) return fallback || "—";
    try {
      const path = new URL(url).pathname;
      return decodeURIComponent(path.split("/").pop() || fallback || "—");
    } catch {
      return fallback || "—";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.125rem" }}>Documentos institucionais</h3>
        <p style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500 mt-0.5">
          Substitua os PDFs que aparecem nos 3 cards da página Transparência.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {INSTITUTIONAL_DOCS.map((doc) => {
              const currentUrl = overrides?.[doc.key];
              const isUploading = uploadingKey === doc.key;
              return (
                <div key={doc.key} className="flex items-center gap-4 px-6 py-4">
                  <div className={`${doc.color} w-12 h-12 rounded-lg flex items-center justify-center shrink-0`}>
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ ...s, fontSize: "0.9375rem" }} className="font-semibold text-zinc-800 truncate">{doc.label}</p>
                    <p style={{ ...s, fontSize: "0.75rem" }} className="text-zinc-400 truncate">
                      {currentUrl ? fileNameFromUrl(currentUrl, doc.defaultName) : `${doc.defaultName} (padrão)`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {currentUrl && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600" asChild>
                        <a href={currentUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver PDF atual">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <label className={`inline-flex items-center justify-center h-8 w-8 rounded-md cursor-pointer transition-colors ${isUploading ? "text-zinc-300 cursor-wait" : "text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100"}`}>
                      <Pencil className="h-4 w-4" />
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(event) => handleReplace(doc.key, event)}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ───── Transparency category lists (Contábeis, Resultados) ───── */
type ListCategoryKey = "contabeis" | "resultados";
type ListDoc = { id: string; title: string; file_url: string; created_at: string };

const LIST_CATEGORIES: { key: ListCategoryKey; label: string; color: string }[] = [
  { key: "contabeis", label: "Demonstrativos Contábeis", color: "bg-[#B45045]" },
  { key: "resultados", label: "Relatórios de Resultados", color: "bg-[#2D5A41]" },
];

const TransparenciaListas = () => {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<ListCategoryKey>("contabeis");
  const [newTitle, setNewTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const { data: listas, isLoading } = useQuery({
    queryKey: ["admin-transparencia-listas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_page_content")
        .select("content")
        .eq("page_key", "transparencia_listas")
        .maybeSingle();
      if (error) throw error;
      return (data?.content as Partial<Record<ListCategoryKey, ListDoc[]>> | null) ?? {};
    },
  });

  const currentList: ListDoc[] = listas?.[activeCategory] ?? [];

  const persistListas = async (next: Partial<Record<ListCategoryKey, ListDoc[]>>) => {
    const { error } = await supabase.from("site_page_content").upsert(
      { page_key: "transparencia_listas", content: next, updated_at: new Date().toISOString() },
      { onConflict: "page_key" },
    );
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["admin-transparencia-listas"] });
    queryClient.invalidateQueries({ queryKey: ["transparencia-listas"] });
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!newTitle.trim()) {
      toast({ title: "Preencha o título antes de enviar o PDF.", variant: "destructive" });
      return;
    }
    if (file.type !== "application/pdf") {
      toast({ title: "❌ Envie um arquivo PDF", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `transparencia-listas/${activeCategory}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("reports").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("reports").getPublicUrl(path);

      const newDoc: ListDoc = {
        id: crypto.randomUUID(),
        title: newTitle.trim(),
        file_url: urlData.publicUrl,
        created_at: new Date().toISOString(),
      };
      const nextList = [newDoc, ...currentList];
      await persistListas({ ...(listas ?? {}), [activeCategory]: nextList });
      toast({ title: "✅ Documento adicionado!" });
      setNewTitle("");
    } catch (err: any) {
      toast({ title: "❌ Erro ao enviar PDF", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const nextList = currentList.filter((d) => d.id !== id);
      await persistListas({ ...(listas ?? {}), [activeCategory]: nextList });
      toast({ title: "✅ Documento removido." });
    } catch (err: any) {
      toast({ title: "❌ Erro ao remover", description: err.message, variant: "destructive" });
    }
  };

  const startEdit = (doc: ListDoc) => {
    setEditingId(doc.id);
    setEditingTitle(doc.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = async () => {
    if (!editingId || !editingTitle.trim()) return;
    try {
      const nextList = currentList.map((d) =>
        d.id === editingId ? { ...d, title: editingTitle.trim() } : d,
      );
      await persistListas({ ...(listas ?? {}), [activeCategory]: nextList });
      toast({ title: "✅ Título atualizado." });
      setEditingId(null);
      setEditingTitle("");
    } catch (err: any) {
      toast({ title: "❌ Erro ao atualizar", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.125rem" }}>Listas de documentos</h3>
        <p style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-500 mt-0.5">
          Gerencie os PDFs que aparecem ao clicar em Demonstrativos Contábeis e Relatórios de Resultados na página Transparência.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {LIST_CATEGORIES.map((cat) => (
          <Button
            key={cat.key}
            variant={activeCategory === cat.key ? "default" : "outline"}
            onClick={() => { setActiveCategory(cat.key); cancelEdit(); }}
            className={activeCategory === cat.key ? "bg-emerald-500 hover:bg-emerald-600 text-white !text-sm" : "!text-sm"}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : (
          <>
            <div className="divide-y divide-zinc-100">
              {currentList.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                  <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-400">
                    Nenhum documento nesta categoria. Adicione abaixo.
                  </p>
                </div>
              ) : (
                currentList.map((doc) => {
                  const isEditing = editingId === doc.id;
                  const cat = LIST_CATEGORIES.find((c) => c.key === activeCategory)!;
                  return (
                    <div key={doc.id} className="flex items-center gap-3 px-6 py-3">
                      <div className={`${cat.color} w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}>
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      {isEditing ? (
                        <>
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { e.preventDefault(); saveEdit(); }
                              if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
                            }}
                            className="!text-sm flex-1"
                            autoFocus
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-600" onClick={saveEdit} disabled={!editingTitle.trim()} aria-label="Salvar">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-700" onClick={cancelEdit} aria-label="Cancelar">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <p style={{ ...s, fontSize: "0.9375rem" }} className="font-semibold text-zinc-800 truncate">{doc.title}</p>
                            <p style={{ ...s, fontSize: "0.75rem" }} className="text-zinc-400 truncate">
                              Adicionado em {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" aria-label="Ver PDF">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-600" onClick={() => startEdit(doc)} aria-label="Editar título">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => handleDelete(doc.id)} aria-label="Remover">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-zinc-100 p-4 bg-zinc-50/50 space-y-3">
              <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700 block">
                Adicionar documento nesta categoria
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título do documento (ex: Balanço Patrimonial 2024)"
                className="!text-sm"
                disabled={uploading}
              />
              <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-zinc-300 cursor-pointer hover:border-emerald-400 transition-colors">
                <Upload className="h-4 w-4 text-zinc-500" />
                <span style={{ ...s, fontSize: "0.8125rem" }} className="text-zinc-600">
                  {uploading ? "Enviando..." : "Selecionar PDF"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </>
        )}
      </div>
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
      <InstitutionalDocs />
      <TransparenciaListas />
      <ProjectList onSelect={setSelectedProject} />
      <PageAccessLogs />
    </div>
  );
};

export default AdminTransparency;
