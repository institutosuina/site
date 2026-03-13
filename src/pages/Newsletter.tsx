import { useState } from "react";
import Layout from "@/components/Layout";
import { Mail, User, Send, CheckCircle2 } from "lucide-react";
import heroForest from "@/assets/hero-forest.jpg";
import paperTexture from "@/assets/paper-texture.png";

const Newsletter = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
    }, 800);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroForest} 
            alt="Instituto Suinã" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#3e2723]/50 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Nossa Newsletter
          </h1>
          <p className="font-body text-lg md:text-xl max-w-2xl mx-auto opacity-90 italic">
            "Conectando você às raízes da nossa transformação."
          </p>
        </div>
      </section>

      {/* Signup Form Section */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#204030]">
                Fique por dentro de tudo o que acontece no Suinã
              </h2>
              <p className="font-body text-lg text-gray-700 leading-relaxed">
                Assine nossa newsletter e receba mensalmente atualizações sobre nossos projetos de restauração, eventos na comunidade, novos materiais técnicos e oportunidades de voluntariado.
              </p>
              <div className="space-y-4">
                {[
                  "Resultados de impacto socioambiental",
                  "Convites para oficinas e eventos",
                  "Lançamentos de materiais educativos",
                  "Histórias inspiradoras do território"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[#7d5127] font-medium">
                    <CheckCircle2 className="w-5 h-5 text-[#ba2c18]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-[450px] relative">
              <div 
                className="bg-[#e6d5bc]/30 p-10 rounded-[40px] border border-[#e6d5bc] shadow-xl relative z-10"
                style={{ backgroundImage: `url(${paperTexture})`, backgroundSize: 'cover', backgroundBlendMode: 'soft-light' }}
              >
                {!submitted ? (
                  <>
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Mail className="w-8 h-8 text-[#ba2c18]" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-[#204030]">Inscreva-se</h3>
                      <p className="text-sm text-gray-600">Receba conteúdo exclusivo por e-mail.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Seu nome" 
                          required
                          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#204030]/10 transition-all font-body"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="email" 
                          placeholder="Seu melhor e-mail" 
                          required
                          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#204030]/10 transition-all font-body"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-5 bg-[#204030] text-white rounded-2xl font-display font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#1a3326] transition-all shadow-lg group"
                      >
                        Enviar Cadastro
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <p className="text-[10px] text-center text-gray-500 pt-2">
                        Ao se cadastrar, você concorda com nossa política de privacidade e LGPD.
                      </p>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="font-display text-3xl font-bold text-[#204030] mb-4">Bem-vindo(a)!</h3>
                    <p className="font-body text-gray-600 mb-8 leading-relaxed">
                      Obrigado por se juntar à nossa rede, <strong>{formData.name}</strong>. Em breve você receberá nossas novidades.
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="text-sm font-bold text-[#ba2c18] hover:underline"
                    >
                      Cadastrar outro e-mail
                    </button>
                  </div>
                )}
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#ba2c18]/10 rounded-full blur-2xl -z-10" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#204030]/10 rounded-full blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Newsletter;
