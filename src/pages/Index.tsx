import Layout from "@/components/Layout";
import heroForest from "@/assets/hero-forest.jpg";
import folhaSvg from "@/assets/folha.svg";
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
import brushTop from "@/assets/brush-top.png";
import leafDecoration from "@/assets/leaf-decoration.png";

import { Plus, Eye, Target, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";

const timelineData = [
  { year: "2013", text: "Concepção do Instituto Suinã e início da estruturação institucional." },
  { year: "2014", text: "Formalização da instituição e primeiras ações públicas de educação ambiental." },
  { year: "2015", text: "Primeira parceria com poder público (Prefeitura de Mogi das Cruzes) e ingresso no Conselho Municipal de Meio Ambiente de Guararema-SP." },
  { year: "2016", text: "Primeiro contrato socioambiental com empresa do setor florestal, em mobilização social e educação ambiental." },
  { year: "2017", text: "Cooperação com o Centro Paula Souza para formação de educadores da rede pública." },
  { year: "2018", text: "Reconhecimento público com o prêmio “Escola Amiga do Verde” (Câmara de Jacareí)." },
  { year: "2019", text: "Expansão das parcerias institucionais e primeiros projetos estruturantes em diagnóstico socioambiental e tecnologias sociais." },
  { year: "2020", text: "Participação em programa nacional de aceleração (Instituto EDP/Phomenta), premiação Capital Semente, certificação internacional de transparência e ingresso no Comitê de Bacias do Paraíba do Sul." },
  { year: "2021", text: "Consolidação de parcerias com o setor florestal em projetos de caracterização e diagnóstico social." },
  { year: "2022", text: "Aprovação do primeiro projeto FEHIDRO em restauração ecológica, reestruturação da governança e instalação da nova sede em Jacareí-SP." },
  { year: "2023", text: "Parcerias com SOS Mata Atlântica e Suzano para Planos Municipais, SAVE Brasil para Plano de Manejo em Guararema e início do projeto Viver o Viveiro." },
  { year: "2024", text: "Ampliação de contratos e lançamento do programa Jovens Observadores, voltado ao emprego verde e turismo sustentável." },
  { year: "2025", text: "Nova identidade visual, participação no programa BTG Soma Meio Ambiente e expansão de projetos de restauração ecológica e mobilização social." },
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
  const [openModal, setOpenModal] = useState<string | null>(null);

  const modalContent = {
    Mission: "Conectar e mobilizar pessoas, ideias e ações para conservar e restaurar a sociobiodiversidade.",
    Vision: "Consolidar-se como uma organização de referência em conservação e transformação territorial, contribuindo para o desenvolvimento sustentável e a valorização dos territórios.",
    Values: "Em breve."
  };

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
              { icon: iconeMissao, label: "Missão", color: "card-red", id: "Mission" },
              { icon: iconeVisao, label: "Visão", color: "card-sage", id: "Vision" },
              { icon: iconeValores, label: "Valores", color: "card-orange", id: "Values" },
            ].map(({ icon, label, color, id }) => (
              <div 
                key={label} 
                className={`${color} min-h-[220px] cursor-pointer hover:scale-[1.02] transition-transform pb-16`}
                onClick={() => setOpenModal(id)}
              >
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
            <div className="flex items-center gap-4 max-w-7xl mx-auto px-4">
              {/* Navigation arrows - Left */}
              <button
                onClick={() => scroll("left")}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[#2f4b3c] hover:bg-black/10 transition-colors z-20"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              {/* Scrollable timeline container */}
              <div
                ref={scrollRef}
                className="overflow-hidden flex-1"
                style={{ scrollSnapType: "x mandatory" }}
              >
                <div className="relative min-w-max py-8">
                  {/* Timeline line */}
                  <div className="h-1 w-full rounded-full absolute top-8 left-0" style={{ backgroundColor: "#2f4b3c" }} />
                  
                  {/* Items container */}
                  <div className="flex">
                    {timelineData.map((item) => (
                      <div 
                        key={item.year} 
                        className="text-center w-[300px] md:w-[500px] lg:w-[550px] flex-shrink-0 pt-12 relative px-16"
                        style={{ scrollSnapAlign: "start" }}
                      >
                        {/* Dot on line */}
                        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white z-10" style={{ backgroundColor: "#2f4b3c" }} />
                        <span className="font-display text-2xl font-bold block mb-2" style={{ color: "#ba2c18" }}>{item.year}</span>
                        <p className="font-body text-xs leading-relaxed max-w-[280px] mx-auto" style={{ color: "#7d5127" }}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation arrows - Right */}
              <button
                onClick={() => scroll("right")}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[#2f4b3c] hover:bg-black/10 transition-colors z-20"
                aria-label="Próximo"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 relative overflow-hidden" style={{ backgroundColor: "#2f4b3c" }}>

        {/* Brush decorations */}

        <div className="container mx-auto max-w-4xl relative z-10">

          {/* Bloco Superior: 82% e Texto */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
            <span className="font-display text-7xl md:text-[100px] font-bold text-white leading-none">
              82%
            </span>
            <p className="font-display text-xl md:text-3xl font-normal text-white leading-tight md:text-left text-center">
              da equipe do Suinã<br />é composta por mulheres
            </p>
          </div>

          {/* Bloco Inferior: Parágrafos padronizados */}
          <div className="space-y-6 text-center max-w-3xl mx-auto">
            <p className="font-display text-base md:text-lg text-white font-normal leading-relaxed">
              Nos orgulhamos de ter um time diverso, forte e atuante, contribuindo diariamente para a transformação que buscamos.
            </p>
            <p className="font-display text-base md:text-lg text-white font-normal leading-relaxed">
              O Instituto Suinã conta com uma rede de parceiros, prestadores de serviço, empresas e instituições que caminham conosco para fortalecer nossas ações e ampliar nosso impacto.
            </p>
            <p className="font-display text-base md:text-lg text-white font-normal leading-relaxed">
              Aqui você conhece as pessoas que fazem parte dessa jornada.
            </p>
          </div>



          {/* Team grid */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-12 mb-12">
            {teamMembers.map((m) => (
              <div key={m.name} className="text-center w-[calc(50%-1rem)] md:w-[calc(25%-2rem)] min-w-[140px] max-w-[200px]">
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

      {/* Modals */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setOpenModal(null)}>
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl animate-in fade-in zoom-in duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setOpenModal(null)}
            >
              <Plus className="w-6 h-6 rotate-45" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                openModal === 'Mission' ? 'bg-[#ba2c18]/10' : 
                openModal === 'Vision' ? 'bg-[#2f4b3c]/10' : 'bg-[#e67e22]/10'
              }`}>
                <img 
                  src={openModal === 'Mission' ? iconeMissao : openModal === 'Vision' ? iconeVisao : iconeValores} 
                  className="w-12 h-12"
                  alt=""
                />
              </div>
              
              <h3 className="font-display text-3xl font-bold mb-4 text-[#2f4b3c]">
                {openModal === 'Mission' ? 'Nossa Missão' : openModal === 'Vision' ? 'Nossa Visão' : 'Nossos Valores'}
              </h3>
              
              <p className="font-body text-lg text-gray-700 leading-relaxed italic">
                "{modalContent[openModal as keyof typeof modalContent]}"
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Index;
