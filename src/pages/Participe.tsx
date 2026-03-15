import { useState } from "react";
import Layout from "@/components/Layout";
import { Heart } from "lucide-react";
import folhaSvg from "@/assets/folha.svg";
import brushTop from "@/assets/brush-top.png";

const Participe = () => {
  const [donationData, setDonationData] = useState({ name: "", email: "" });
  const [agreed, setAgreed] = useState(false);
  const [newsletterData, setNewsletterData] = useState({ name: "", email: "" });

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <Layout>
      {/* Seção 1: Como Apoiar */}
      <section className="py-20 px-4 bg-background relative overflow-hidden">
        <img
          src={folhaSvg}
          alt=""
          className="absolute -left-16 top-1/4 w-40 md:w-56 opacity-25 pointer-events-none rotate-[30deg]"
          style={{ filter: "hue-rotate(340deg) saturate(2) brightness(0.7)" }}
        />
        <img
          src={folhaSvg}
          alt=""
          className="absolute -right-10 -bottom-10 w-40 md:w-56 opacity-25 pointer-events-none -scale-x-100"
          style={{ filter: "hue-rotate(340deg) saturate(2) brightness(0.7)" }}
        />

        <div className="container mx-auto max-w-2xl text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            Que tal contribuir com os projetos socioambientais do Suinã?
          </h2>

          <div className="mb-8 text-muted-foreground font-body text-base leading-relaxed">
            <p className="italic">
              "A presente contribuição constitui-se em uma doação com encargos nos
              termos da Lei 10.406 do artigo 538 do código civil. Os valores doados
              serão destinados aos projetos socioambientais desenvolvidos nas
              regiões do Vale do Paraíba e Alto Tietê, no estado de São Paulo.
            </p>
            <p className="mt-4 font-medium text-foreground">
              Ajude a germinar nossas ações"
            </p>
          </div>

          <form onSubmit={handleDonationSubmit} className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Nome"
                required
                value={donationData.name}
                onChange={(e) => setDonationData({ ...donationData, name: e.target.value })}
                className="flex-1 px-6 py-4 rounded-full bg-input text-foreground placeholder:text-muted-foreground font-body text-base focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
              />
              <input
                type="email"
                placeholder="E-mail"
                required
                value={donationData.email}
                onChange={(e) => setDonationData({ ...donationData, email: e.target.value })}
                className="flex-1 px-6 py-4 rounded-full bg-input text-foreground placeholder:text-muted-foreground font-body text-base focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer text-sm text-muted-foreground font-body">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 rounded border-border accent-accent"
                />
                Li e concordo com as condições de doação
              </label>

              <button
                type="submit"
                disabled={!agreed}
                className="flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground font-display font-bold text-lg rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-wider"
              >
                <Heart className="w-5 h-5 fill-current" />
                DOAR
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Seção 2: Newsletter */}
      <section className="relative py-20 px-4 bg-muted overflow-hidden">
        {/* Brush stroke decorations */}
        <img
          src={brushTop}
          alt=""
          className="absolute top-0 left-0 w-full h-auto pointer-events-none opacity-40"
        />
        <img
          src={brushTop}
          alt=""
          className="absolute bottom-0 left-0 w-full h-auto pointer-events-none opacity-40 rotate-180"
        />

        <div className="container mx-auto max-w-2xl text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
            Cadastre-se para receber nossa newsletter:
          </h2>

          <p className="font-body text-base text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
            Fique por dentro das ações, projetos e novidades do Instituto Suinã. Ao
            se cadastrar em nossa newsletter, você receberá conteúdos exclusivos
            sobre nossas iniciativas em defesa da vida e da natureza, além de
            convites para participar de eventos, campanhas e atividades.
            Cadastre-se agora e faça parte dessa rede de transformação!
          </p>

          <form onSubmit={handleNewsletterSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Nome completo"
                required
                value={newsletterData.name}
                onChange={(e) => setNewsletterData({ ...newsletterData, name: e.target.value })}
                className="flex-1 px-6 py-4 rounded-full bg-background text-foreground placeholder:text-muted-foreground font-body text-base focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all border border-border"
              />
              <input
                type="email"
                placeholder="E-mail"
                required
                value={newsletterData.email}
                onChange={(e) => setNewsletterData({ ...newsletterData, email: e.target.value })}
                className="flex-1 px-6 py-4 rounded-full bg-background text-foreground placeholder:text-muted-foreground font-body text-base focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all border border-border"
              />
            </div>

            <button
              type="submit"
              className="px-10 py-3 bg-primary text-primary-foreground font-display font-bold text-base tracking-[0.2em] uppercase rounded-lg hover:opacity-90 transition-all shadow-md"
            >
              ENVIAR
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Participe;
