import { useState } from "react";
import Layout from "@/components/Layout";
import folha from "@/assets/folha.svg";

const Contato = () => {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });

  return (
    <Layout>
      <section className="contact-bg py-20 px-4 min-h-[90vh] relative overflow-hidden flex items-center">

        {/* Folha Única - Puxada bem para fora da tela na esquerda */}
        <img
          src={folha}
          alt=""
          // left-[-25%] joga boa parte da folha para fora do navegador
          // scale-125 garante que ela continue grande o suficiente para atravessar parte do fundo
          className="absolute left-[-15%] top-1/2 -translate-y-1/2 w-full max-w-5xl h-auto opacity-[0.04] pointer-events-none rotate-90 scale-125"
        />

        <div className="container mx-auto max-w-2xl relative z-10">



          {/* Cabeçalho do Formulário */}
          <h1 className="font-display text-2xl md:text-3xl font-bold text-card text-center mb-3 uppercase tracking-tighter">
            Entre em contato conosco
          </h1>
          <p className="font-display text-sm md:text-base italic text-card/90 text-center mb-8 leading-relaxed">
            Precisa de alguma informação? Preencha o formulário e entraremos<br className="hidden md:block" /> em contato o mais breve possível.
          </p>

          {/* Formulário */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nome"
                className="input-cream"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
              <input
                type="email"
                placeholder="E-mail"
                className="input-cream"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <textarea
              placeholder="Sua mensagem"
              rows={5}
              className="input-cream w-full resize-none"
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
            />
          </div>

          <div className="text-center pt-8">
            <button className="bg-foreground text-card font-display font-bold text-sm px-12 py-3 rounded-full hover:bg-white hover:text-foreground transition-all uppercase tracking-widest shadow-lg">
              Enviar Mensagem
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contato;