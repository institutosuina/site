import { useState } from "react";
import Layout from "@/components/Layout";

const Contato = () => {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });

  return (
    <Layout>
      <section className="contact-bg py-16 px-4 min-h-[70vh] relative overflow-hidden">
        {/* Background leaf pattern via CSS */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10 C30 30 20 50 50 90 C80 50 70 30 50 10z' fill='%23355E3B' opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />
        <div className="container mx-auto max-w-3xl relative z-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-card text-center mb-4">
            Entre em contato conosco
          </h1>
          <p className="font-display text-lg md:text-xl italic text-card/90 text-center mb-10">
            Precisa de alguma informação? Preencha o formulário e entraremos em contato o mais breve possível.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              rows={6}
              className="input-cream w-full resize-none"
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
            />
            <div className="text-center">
              <button className="bg-primary text-primary-foreground font-display font-bold text-lg px-10 py-3 rounded-lg hover:bg-primary/90 transition-colors uppercase tracking-wide">
                Enviar
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contato;
