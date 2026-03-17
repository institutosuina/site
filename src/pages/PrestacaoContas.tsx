import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import leafDecoration from "@/assets/leaf-decoration.png";
import { Plus, ShieldCheck, Mail, User, ArrowRight, X, Download, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ProjectPillCard = ({ name, onClick }: { name: string; onClick: () => void }) => (
  <button onClick={onClick} className="group relative flex items-center hover:scale-[1.02] transition-transform" style={{ width: 'min(420px, 85vw)' }}>
    {/* Pill body */}
    <div className="flex-1 bg-suina-brown border-[3px] border-white/80 rounded-full h-[56px] md:h-[64px] flex items-center pl-6 md:pl-8 pr-14 md:pr-16 shadow-lg">
      <span className="font-display text-sm md:text-base font-bold text-primary-foreground leading-tight whitespace-nowrap">{name}</span>
    </div>
    {/* Circle + icon overlapping right edge */}
    <div className="absolute right-0 w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full bg-suina-brown border-[3px] border-white/80 flex items-center justify-center shadow-lg">
      <span className="font-display text-3xl md:text-4xl font-normal text-primary-foreground leading-none select-none" style={{ marginTop: '-2px' }}>+</span>
    </div>
  </button>
);

const PrestacaoContas = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    const authorized = localStorage.getItem("suina_accountability_auth");
    if (authorized) {
      setIsAuthorized(true);
    } else {
      setShowModal(true);
    }
  }, []);

  const { data: projects } = useQuery({
    queryKey: ["public-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projetos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAuthorized,
  });

  const { data: reports } = useQuery({
    queryKey: ["public-project-reports", selectedProject],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("relatorios")
        .select("*")
        .eq("project_id", selectedProject!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProject && isAuthorized,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      localStorage.setItem("suina_accountability_auth", "true");
      localStorage.setItem("suina_user_name", formData.name);
      localStorage.setItem("suina_user_email", formData.email);

      // Log page access
      await supabase.from("acessos_pagina").insert({
        user_name: formData.name,
        user_email: formData.email,
        page: "prestacao-de-contas",
      });

      setIsAuthorized(true);
      setShowModal(false);
    }
  };

  const handleAccessReport = async (report: any) => {
    const userName = localStorage.getItem("suina_user_name") || formData.name;
    const userEmail = localStorage.getItem("suina_user_email") || formData.email;

    // Log access
    await supabase.from("acessos_relatorios").insert({
      report_id: report.id,
      user_name: userName,
      user_email: userEmail,
    });

    window.open(report.file_url, "_blank");
  };

  return (
    <Layout>
      <section className={`py-16 md:py-24 px-4 min-h-[70vh] relative transition-all duration-500 ${!isAuthorized ? 'blur-md pointer-events-none grayscale-[0.5]' : ''}`}>
        <img src={leafDecoration} alt="" className="absolute right-0 bottom-0 w-48 opacity-10 pointer-events-none" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <h1 className="section-title mb-8 uppercase underline underline-offset-4 text-secondary">
            Prestação de Contas
          </h1>

          {selectedProject ? (
            <>
              <button
                onClick={() => setSelectedProject(null)}
                className="flex items-center gap-2 mb-8 font-body text-secondary hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar aos projetos
              </button>
              <div className="grid grid-cols-1 gap-4">
                {reports?.length ? reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => handleAccessReport(report)}
                    className="flex items-center gap-4 bg-suina-brown rounded-[24px] px-8 py-5 cursor-pointer hover:scale-[1.02] transition-all shadow-xl group paper-texture text-left w-full"
                  >
                    <div className="flex-1">
                      <h3 className="font-display text-lg md:text-xl font-semibold leading-snug text-primary-foreground">{report.title}</h3>
                      {report.description && (
                        <p className="caption-text text-primary-foreground/70 mt-1">{report.description}</p>
                      )}
                      <p className="caption-text text-primary-foreground/50 mt-1">
                        {new Date(report.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center shrink-0 group-hover:border-white transition-colors">
                      <Download className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </button>
                )) : (
                  <p className="body-text text-center text-muted-foreground py-8">Nenhum relatório disponível para este projeto.</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-6">
              {projects?.length ? projects.map((projeto) => (
                <ProjectPillCard
                  key={projeto.id}
                  name={projeto.name}
                  onClick={() => setSelectedProject(projeto.id)}
                />
              )) : (
                <p className="body-text text-muted-foreground text-center py-8">Nenhum projeto disponível ainda.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Restricted Access Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-card rounded-[40px] max-w-md w-full p-10 relative shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => navigate("/transparencia")}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-suina-red transition-colors"
              title="Fechar e voltar"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.2] text-primary mb-6">Acesso Restrito</h2>
              <p className="body-text">
                Para visualizar nossa prestação de contas, por favor identifique-se. Esse procedimento é realizado apenas para controle interno de acesso aos documentos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text" placeholder="Seu nome completo" required
                  className="w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email" placeholder="Seu melhor e-mail" required
                  className="w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="bg-suina-cream/20 p-4 rounded-2xl border border-suina-cream-dark/30 flex gap-3 items-start mb-6">
                <ShieldCheck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <p className="font-body text-xs opacity-90 leading-tight">
                  Seus dados estão protegidos. O Instituto Suinã respeita as diretrizes da <strong>LGPD</strong> (Lei Geral de Proteção de Dados) e utiliza essas informações estritamente para segurança e controle de acesso territorial.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-display font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
              >
                Acessar Documentos
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PrestacaoContas;
