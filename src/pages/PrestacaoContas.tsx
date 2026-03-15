import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import leafDecoration from "@/assets/leaf-decoration.png";
import paperTexture from "@/assets/paper-texture.png";
import { Plus, ShieldCheck, Mail, User, ArrowRight, X } from "lucide-react";

const PrestacaoContas = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    const authorized = localStorage.getItem("suina_accountability_auth");
    if (authorized) {
      setIsAuthorized(true);
    } else {
      setShowModal(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      localStorage.setItem("suina_accountability_auth", "true");
      setIsAuthorized(true);
      setShowModal(false);
    }
  };

  return (
    <Layout>
      <section className={`py-16 md:py-24 px-4 min-h-[70vh] relative transition-all duration-500 ${!isAuthorized ? 'blur-md pointer-events-none grayscale-[0.5]' : ''}`}>
        <img src={leafDecoration} alt="" className="absolute right-0 bottom-0 w-48 opacity-10 pointer-events-none" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <h1 className="section-title mb-8 uppercase underline underline-offset-4 text-secondary">
            Prestação de Contas
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: "Viver o Viveiro", date: "2023-2024" },
              { title: "Restauração Rio Paraíba", date: "2022-2023" },
            ].map((projeto, i) => (
              <div 
                key={i}
                className="flex items-center gap-4 bg-suina-brown rounded-[24px] px-8 py-5 cursor-pointer hover:scale-[1.02] transition-all shadow-xl group paper-texture"
              >
                <div className="flex-1">
                  <h3 className="font-display text-xl md:text-2xl font-semibold leading-snug text-primary-foreground mb-1">{projeto.title}</h3>
                  <p className="caption-text text-primary-foreground/70">{projeto.date}</p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center shrink-0 group-hover:border-white transition-colors">
                  <Plus className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            ))}
          </div>
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
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="email" placeholder="Seu melhor e-mail" required
                  className="w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
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
