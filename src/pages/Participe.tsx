import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Heart } from "lucide-react";
import { FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import folhaSvg from "@/assets/folha.svg";
import logoSuina from "@/assets/logo-suina-white.png";

const Participe = () => {
  const location = useLocation();
  const [donationData, setDonationData] = useState({ name: "", email: "" });
  const [agreed, setAgreed] = useState(false);
  const [newsletterData, setNewsletterData] = useState({ name: "", email: "" });

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location.hash]);

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
      <section id="como-apoiar" className="py-16 md:py-24 px-4 bg-background relative overflow-hidden">
        <img src={folhaSvg} alt="" className="absolute -left-16 top-1/4 w-40 md:w-56 opacity-25 pointer-events-none rotate-[30deg]" style={{ filter: "hue-rotate(340deg) saturate(2) brightness(0.7)" }} />
        <img src={folhaSvg} alt="" className="absolute -right-10 -bottom-10 w-40 md:w-56 opacity-25 pointer-events-none -scale-x-100" style={{ filter: "hue-rotate(340deg) saturate(2) brightness(0.7)" }} />

        <div className="container mx-auto max-w-2xl text-center relative z-10">
          <h2 className="section-title mb-8 text-foreground">
            Que tal contribuir com os projetos socioambientais do Suinã?
          </h2>

          <div className="mb-8">
            <p className="body-text italic text-muted-foreground">
              "A presente contribuição constitui-se em uma doação com encargos nos
              termos da Lei 10.406 do artigo 538 do código civil. Os valores doados
              serão destinados aos projetos socioambientais desenvolvidos nas
              regiões do Vale do Paraíba e Alto Tietê, no estado de São Paulo.
            </p>
            <p className="font-body text-base md:text-lg font-medium text-foreground mt-4">
              Ajude a germinar nossas ações"
            </p>
          </div>

          <form onSubmit={handleDonationSubmit} className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <input type="text" placeholder="Nome" required value={donationData.name}
                onChange={(e) => setDonationData({ ...donationData, name: e.target.value })}
                className="flex-1 px-6 py-4 rounded-full bg-input text-foreground placeholder:text-muted-foreground font-body text-base focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all" />
              <input type="email" placeholder="E-mail" required value={donationData.email}
                onChange={(e) => setDonationData({ ...donationData, email: e.target.value })}
                className="flex-1 px-6 py-4 rounded-full bg-input text-foreground placeholder:text-muted-foreground font-body text-base focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all" />
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer font-body text-sm text-muted-foreground">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-5 h-5 rounded border-border accent-accent" />
                Li e concordo com as condições de doação
              </label>

              <button type="submit" disabled={!agreed}
                className="flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground font-display font-bold text-lg rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-wider">
                <Heart className="w-5 h-5 fill-current" />
                DOAR
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Seção 2: Newsletter */}
      <section id="newsletter" className="py-16 md:py-24 px-4 bg-background">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="section-title text-primary mb-6">
            Cadastre-se para receber nossa newsletter:
          </h2>

          <p className="body-text text-muted-foreground mb-8 max-w-xl mx-auto">
            Fique por dentro das ações, projetos e novidades do Instituto Suinã. Ao
            se cadastrar em nossa newsletter, você receberá conteúdos exclusivos
            sobre nossas iniciativas em defesa da vida e da natureza, além de
            convites para participar de eventos, campanhas e atividades.
            Cadastre-se agora e faça parte dessa rede de transformação!
          </p>

          <form onSubmit={handleNewsletterSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input type="text" placeholder="Nome completo" required value={newsletterData.name}
                onChange={(e) => setNewsletterData({ ...newsletterData, name: e.target.value })}
                className="flex-1 px-6 py-4 rounded-full bg-input text-foreground placeholder:text-muted-foreground font-body text-base focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all" />
              <input type="email" placeholder="E-mail" required value={newsletterData.email}
                onChange={(e) => setNewsletterData({ ...newsletterData, email: e.target.value })}
                className="flex-1 px-6 py-4 rounded-full bg-input text-foreground placeholder:text-muted-foreground font-body text-base focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all" />
            </div>

            <button type="submit"
              className="px-10 py-3 bg-primary text-primary-foreground font-display font-bold text-base tracking-[0.2em] uppercase rounded-lg hover:opacity-90 transition-all shadow-md">
              ENVIAR
            </button>
          </form>
        </div>
      </section>

      {/* Seção 3: Conteúdos já compartilhados */}
      <section id="conteudos" className="py-16 md:py-24 px-4 bg-background">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="section-title text-accent mb-6">
            Quer revisitar os conteúdos já compartilhados?
          </h2>

          <p className="body-text text-muted-foreground mb-2 max-w-xl mx-auto">
            Aqui você encontra os informativos anteriores do Instituto Suinã, com
            notícias, conquistas e registros importantes da nossa caminhada.
          </p>
          <p className="font-body text-base md:text-lg font-bold text-foreground mb-8">
            Acesse, relembre e acompanhe nossa trajetória.
          </p>

          <div className="flex items-center justify-center gap-6">
            <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
              ‹
            </button>

            <div className="flex gap-4">
              {[
                { edition: "01/2026", color: "hsl(var(--suina-red))" },
                { edition: "11/2025", color: "hsl(var(--primary))" },
                { edition: "10/2025", color: "hsl(var(--suina-orange))" },
              ].map((item) => (
                <a key={item.edition} href="#"
                  className="w-36 h-36 md:w-44 md:h-44 rounded-2xl flex flex-col items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: item.color }}>
                  <span className="caption-text mb-1">EDIÇÃO</span>
                  <span className="font-display text-2xl md:text-3xl font-bold">{item.edition}</span>
                </a>
              ))}
            </div>

            <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
              ›
            </button>
          </div>
        </div>
      </section>

      {/* Seção 4: Redes Sociais */}
      <section id="redes-sociais" className="py-16 md:py-24 px-4 bg-background relative overflow-hidden">
        <img src={folhaSvg} alt="" className="absolute -left-12 top-10 w-36 md:w-48 opacity-20 pointer-events-none rotate-[20deg]" style={{ filter: "hue-rotate(340deg) saturate(2) brightness(0.7)" }} />
        <img src={folhaSvg} alt="" className="absolute -right-8 bottom-10 w-36 md:w-48 opacity-15 pointer-events-none -scale-x-100 rotate-[-10deg]" style={{ filter: "hue-rotate(340deg) saturate(2) brightness(0.7)" }} />

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            <div className="flex-1">
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.2] text-accent mb-6">
                Suinã<br />nas Redes<br />Sociais:
              </h2>
              <p className="body-text font-bold text-muted-foreground mb-8 max-w-sm">
                Siga o Instituto Suinã no
                Facebook, Instagram,
                LinkedIn e YouTube e
                acompanhe de perto
                nossas ações em defesa da
                vida e da natureza.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: FaWhatsapp, color: "hsl(var(--suina-brown))", href: "#" },
                  { icon: FaFacebookF, color: "hsl(var(--suina-green-sage))", href: "#" },
                  { icon: FaInstagram, color: "hsl(var(--accent))", href: "#" },
                  { icon: FaLinkedinIn, color: "hsl(var(--suina-green-sage))", href: "#" },
                  { icon: FaYoutube, color: "hsl(var(--accent))", href: "#" },
                ].map((social, i) => (
                  <a key={i} href={social.href} target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground text-xl hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: social.color }}>
                    <social.icon />
                  </a>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="w-64 h-[500px] bg-foreground rounded-[40px] p-3 shadow-2xl">
                <div className="w-full h-full bg-primary rounded-[32px] flex flex-col items-center justify-center gap-6">
                  <img src={logoSuina} alt="Instituto Suinã" className="w-32 h-auto" />
                  <div className="flex gap-2">
                    {[FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube].map((Icon, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border border-white/50 flex items-center justify-center">
                        <Icon className="text-primary-foreground text-[10px]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Participe;
