import Layout from "@/components/Layout";
import heroForest from "@/assets/hero-forest.jpg";
import logoSuinaWhite from "@/assets/logo-suina-white.png";
import teamPhoto from "@/assets/team-photo.jpg";
import equipeCompleta from "@/assets/equipe-completa.jpg";
import wheatDecoration from "@/assets/wheat-decoration.png";
import logosParceiros from "@/assets/logos-parceiros.png";

import sketchCircle from "@/assets/sketch-circle.png";
import paperTexture from "@/assets/paper-texture.png";
import backgroundFlores from "@/assets/backgroundflores.svg";
import iconeMissao from "@/assets/missão.svg";
import iconeVisao from "@/assets/visão.svg";
import iconeValores from "@/assets/valores.svg";

import { Plus, Eye, Target, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";

const timelineData = [
  { year: "2013", text: "Concepção do Instituto Suinã e início da estruturação institucional." },
  { year: "2014", text: "Formalização da instituição e primeiras ações públicas de educação ambiental." },
  { year: "2015", text: "Primeira parceria com poder público (Prefeitura de Mogi das Cruzes) e ingresso no Conselho Municipal de Meio Ambiente de Guararema-SP." },
  { year: "2016", text: "Conteúdo a definir." },
  { year: "2017", text: "Conteúdo a definir." },
  { year: "2018", text: "Conteúdo a definir." },
  { year: "2019", text: "Conteúdo a definir." },
  { year: "2020", text: "Conteúdo a definir." },
  { year: "2021", text: "Conteúdo a definir." },
  { year: "2022", text: "Conteúdo a definir." },
  { year: "2023", text: "Conteúdo a definir." },
  { year: "2024", text: "Conteúdo a definir." },
  { year: "2025", text: "Conteúdo a definir." },
  { year: "2026", text: "Conteúdo a definir." },
];

const teamMembers = [
  { name: "Fernanda", role: "DIRETORA INSTITUCIONAL" },
  { name: "Fátima", role: "DIRETORA TÉCNICA" },
  { name: "Jhennifer", role: "TÉCNICA EM COMUNICAÇÃO" },
  { name: "Leilane", role: "ANALISTA DE RECURSOS" },
  { name: "Mateus", role: "ESTAGIÁRIO ADMINISTRATIVO" },
  { name: "Ariane", role: "ANALISTA SOCIOAMBIENTAL JÚNIOR" },
  { name: "Tatiane", role: "ANALISTA SOCIOAMBIENTAL PLENO" },
];

const conselho = [
  { role: "PRESIDENTE", name: "Maria José de Brito Zákia" },
  { role: "VICE-PRESIDENTE", name: "Maria Santini de Castro Morini" },
  { role: "CONSELHO FISCAL", name: "Lucila Manzatti" },
  { role: "", name: "Paulo Valadares Soares" },
];

const Index = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 300;
      scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-black">
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <iframe
            src="https://streamable.com/e/kdzkhl?autoplay=1&muted=1&nocontrols=1"
            frameBorder="0"
            width="100%"
            height="100%"
            allow="autoplay; fullscreen"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[100%] min-h-[100%] w-[177.77vh] h-[56.25vw] scale-[1.5]"
            style={{ pointerEvents: 'none' }}
          ></iframe>
        </div>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <img src={logoSuinaWhite} alt="Suinã - Instituto Socioambiental" className="h-32 md:h-48 w-auto" />
        </div>
      </section>

      {/* Quem somos */}
      <section
        className="py-16 px-4 relative overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundFlores}), url(${paperTexture})`,
          backgroundSize: 'cover, cover',
          backgroundPosition: 'center, center'
        }}
      >
        <img src={wheatDecoration} alt="" className="absolute -left-12 top-0 w-48 md:w-72 opacity-20 pointer-events-none -rotate-12" />
        <img src={wheatDecoration} alt="" className="absolute -right-12 bottom-0 w-48 md:w-72 opacity-20 pointer-events-none rotate-165" />
        <div className="container mx-auto max-w-4xl text-center relative z-10 px-8">
          <h2 className="section-title mb-8">Quem somos</h2>
          <p className="font-body text-lg md:text-xl leading-relaxed font-medium">
            O Instituto Suinã é uma organização da sociedade civil fundada em 2014, fruto do sonho de cinco biólogas comprometidas em transformar a relação entre pessoas, fauna, flora e território. Inspiradas pelo Suinã, árvore que simboliza força e resiliência, atuamos na conservação e restauração da sociobiodiversidade nas bacias hidrográficas de Alto e Médio Tietê e do Rio Paraíba do Sul. Desde a nossa origem, desenvolvemos projetos que articulam ciência, educação, mobilização social e políticas públicas, porque acreditamos que a conservação só é eficaz quando é feita coletivamente. Hoje somos uma rede de profissionais que fortalece territórios, restaura ecossistemas e valoriza saberes e culturas locais, contribuindo para a transição a uma sociedade mais justa e sustentável.
          </p>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: iconeMissao, label: "Missão", color: "card-red" },
              { icon: iconeVisao, label: "Visão", color: "card-sage" },
              { icon: iconeValores, label: "Valores", color: "card-orange" },
            ].map(({ icon, label, color }) => (
              <div key={label} className={`${color} min-h-[220px] cursor-pointer hover:scale-[1.02] transition-transform pb-16`}>
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src={icon} alt={label} className="w-full h-full object-contain" />
                </div>
                <span className="font-display text-2xl font-bold text-white mt-2">{label}</span>
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full border-2 border-white flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Linha do tempo */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="section-title text-center mb-10 italic text-secondary">Linha do tempo do Suinã</h2>
          <div className="relative">
            {/* Navigation arrows */}
            <button
              onClick={() => scroll("left")}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Scrollable timeline */}
            <div
              ref={scrollRef}
              className="overflow-x-auto scrollbar-hide px-8"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="relative min-w-max py-8">
                {/* Timeline line */}
                <div className="timeline-line h-1 w-full rounded-full absolute top-8 left-0" />
                {/* Items */}
                <div className="flex gap-12">
                  {timelineData.map((item) => (
                    <div key={item.year} className="text-center w-40 flex-shrink-0 pt-12 relative">
                      {/* Dot on line */}
                      <div className="absolute top-[26px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent border-2 border-card" />
                      <span className="font-display text-2xl font-bold text-accent">{item.year}</span>
                      <p className="font-body text-sm text-foreground/70 mt-3 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 82% mulheres */}
      <section className="py-16 px-4" style={{ backgroundColor: "hsl(var(--suina-green-sage))" }}>
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10 text-center">
            <span className="font-display text-7xl md:text-8xl font-bold text-card">82%</span>
            <p className="font-display text-2xl md:text-3xl font-bold italic text-card">
              da equipe do Suinã<br />é composta por mulheres
            </p>
          </div>
          <p className="font-body text-base text-card/90 mb-4 text-center">
            Nos orgulhamos de ter um time diverso, forte e atuante, contribuindo diariamente para a transformação que buscamos.
          </p>
          <p className="font-body text-base text-card/90 mb-6 text-center">
            O Instituto Suinã conta com uma rede de parceiros, prestadores de serviço, empresas e instituições que caminham conosco para fortalecer nossas ações e ampliar nosso impacto.
          </p>
          <p className="font-display text-xl font-semibold italic text-card text-center mb-12">
            Aqui você conhece as pessoas que fazem parte dessa jornada.
          </p>

          {/* Team grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {teamMembers.map((m) => (
              <div key={m.name} className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-3">
                  <img src={sketchCircle} alt="" className="absolute inset-[-8%] w-[116%] h-[116%] pointer-events-none" />
                  <div className="absolute inset-[6%] rounded-full bg-card" />
                </div>
                <p className="font-display text-base font-semibold text-card">{m.name}</p>
                <p className="font-body text-[11px] text-card/70 uppercase tracking-widest">{m.role}</p>
              </div>
            ))}
          </div>

          {/* Foto da equipe completa */}
          <div className="rounded-2xl overflow-hidden">
            <img src={equipeCompleta} alt="Equipe completa do Instituto Suinã" className="w-full h-64 md:h-96 object-cover" />
          </div>
        </div>
      </section>

      {/* Conselho */}
      <section className="py-16 px-4 relative overflow-hidden" style={{ backgroundColor: "hsl(var(--suina-orange))" }}>
        <img src={wheatDecoration} alt="" className="absolute left-4 top-8 w-36 md:w-48 opacity-40 pointer-events-none" />
        <img src={wheatDecoration} alt="" className="absolute right-4 bottom-8 w-36 md:w-48 opacity-40 pointer-events-none rotate-180" />
        <div className="container mx-auto max-w-2xl text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-card mb-10">Conselho</h2>
          <div className="space-y-8">
            {conselho.map((c, i) => (
              <div key={i}>
                {c.role && <p className="font-body text-xs uppercase tracking-[0.2em] text-card/70 mb-1">{c.role}</p>}
                <p className="font-display text-lg font-semibold text-card">{c.name}</p>
              </div>
            ))}
          </div>
          <p className="font-body text-xs text-card/60 mt-10 uppercase tracking-wider">
            MANDATO: 08/03/2023 A 08/03/2026
          </p>
        </div>
      </section>

      {/* Parceiros */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold italic text-secondary mb-12">Parceiros e apoiadores</h2>
          <img src={logosParceiros} alt="Logos dos parceiros e apoiadores do Instituto Suinã" className="w-full" />
        </div>
      </section>
    </Layout>
  );
};

export default Index;
