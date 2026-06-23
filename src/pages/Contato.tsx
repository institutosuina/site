import { useState } from "react";
import Layout from "@/components/Layout";
import folha from "@/assets/folha.svg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Contato = () => {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || !form.mensagem.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("contatos").insert({
        nome: form.nome.trim(),
        email: form.email.trim(),
        mensagem: form.mensagem.trim(),
      });
      if (error) throw error;

      supabase.functions.invoke("notify-contact", {
        body: { nome: form.nome.trim(), email: form.email.trim(), mensagem: form.mensagem.trim() },
      }).catch((err) => console.error("Falha ao notificar contato:", err));

      toast({ title: "✅ Mensagem enviada!", description: "Entraremos em contato em breve." });
      setForm({ nome: "", email: "", mensagem: "" });
    } catch (err: any) {
      toast({ title: "Erro ao enviar mensagem", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

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
          <p className="body-text italic text-card/90 text-center mb-8">
            Precisa de alguma informação? Preencha o formulário e entraremos em contato o mais breve possível.
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Nome" required className="input-cream" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <input type="email" placeholder="E-mail" required className="input-cream" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <textarea placeholder="Sua mensagem" rows={5} required className="input-cream w-full resize-none" value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} />

            <div className="text-center pt-8">
              <button type="submit" disabled={submitting}
                className="bg-foreground text-card font-display font-bold text-sm px-12 py-3 rounded-full hover:bg-white hover:text-foreground transition-all uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? "Enviando..." : "Enviar Mensagem"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Contato;
