import { useState } from "react";
import Layout from "@/components/Layout";
import leafDecoration from "@/assets/leaf-decoration.png";

const Contato = () => {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });

  return (
    <Layout>
      <section className="contact-bg py-16 md:py-24 px-4 min-h-[80vh] relative overflow-hidden flex items-center">
        <img src={leafDecoration} alt="" className="absolute left-0 top-1/2 -translate-y-1/2 w-64 md:w-80 opacity-20 pointer-events-none -translate-x-1/4" />
        <img src={leafDecoration} alt="" className="absolute right-0 top-1/2 -translate-y-1/2 w-64 md:w-80 opacity-20 pointer-events-none translate-x-1/4 rotate-180" />

        <div className="container mx-auto max-w-xl relative z-10">
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.2] text-card text-center mb-6">
            Entre em contato conosco
          </h1>
          <p className="body-text italic text-card/90 text-center mb-8">
            Precisa de alguma informação? Preencha o formulário e entraremos em contato o mais breve possível.
          </p>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Nome" className="input-cream" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <input type="email" placeholder="E-mail" className="input-cream" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <textarea placeholder="Sua mensagem" rows={5} className="input-cream w-full resize-none" value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} />
          </div>

          <div className="text-center pt-5">
            <button className="bg-foreground text-card font-display font-bold text-sm px-8 py-2.5 rounded hover:bg-foreground/90 transition-colors uppercase tracking-widest">
              Enviar
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contato;
