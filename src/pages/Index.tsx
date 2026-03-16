import Layout from "@/components/Layout";
import heroForest from "@/assets/hero-forest.jpg";
import folhaSvg from "@/assets/folha.svg";
import logoSuinaWhite from "@/assets/logo-suina-white.png";
import teamPhoto from "@/assets/team-photo.jpg";
import equipeCompleta from "@/assets/equipe-completa.jpg";
import wheatDecoration from "@/assets/wheat-decoration.png";
import fundoVerdeBrush from "@/assets/fundo-verde-brush.png";
import logosParceiros from "@/assets/logos-parceiros.png";
import folhaContraste from "@/assets/folha-contraste1.svg";

import sketchCircle from "@/assets/sketch-circle.png";
import paperTexture from "@/assets/paper-texture.png";
import backgroundFlores from "@/assets/backgroundflores.svg";
import iconeMissao from "@/assets/missão.svg";
import iconeVisao from "@/assets/visão.svg";
import iconeValores from "@/assets/valores.svg";
import brushTop from "@/assets/brush-top.png";
import leafDecoration from "@/assets/leaf-decoration.png";
import photoAriane from "@/assets/Ariane.png";
import photoFernanda from "@/assets/Fernanda.png";
import photoFatima from "@/assets/Fátima.png";
import photoJhennifer from "@/assets/Jhennifer.png";
import photoLeilane from "@/assets/Leilane.png";
import photoMateus from "@/assets/Mateus.png";
import photoTatiane from "@/assets/Tatiane.png";

import { Plus, Eye, Target, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";

const timelineData = [
  { year: "2013", text: "Concepção do Instituto Suinã e início da estruturação institucional." },
  { year: "2014", text: "Formalização da instituição e primeiras ações públicas de educação ambiental." },
  { year: "2015", text: "Primeira parceria com poder público (Prefeitura de Mogi das Cruzes) e ingresso no Conselho Municipal de Meio Ambiente de Guararema-SP." },
  { year: "2016", text: "Primeiro contrato socioambiental com empresa do setor florestal, em mobilização social e educação ambiental." },
  { year: "2017", text: "Cooperação com o Centro Paula Souza para formação de educadores da rede pública." },
  { year: "2018", text: "Reconhecimento público com o prêmio \"Escola Amiga do Verde\" (Câmara de Jacareí)." },
  { year: "2019", text: "Expansão das parcerias institucionais e primeiros projetos estruturantes em diagnóstico socioambiental e tecnologias sociais." },
  { year: "2020", text: "Participação em programa nacional de aceleração (Instituto EDP/Phomenta), premiação Capital Semente, certificação internacional de transparência e ingresso no Comitê de Bacias do Paraíba do Sul." },
  { year: "2021", text: "Consolidação de parcerias com o setor florestal em projetos de caracterização e diagnóstico social." },
  { year: "2022", text: "Aprovação do primeiro projeto FEHIDRO em restauração ecológica, reestruturação da governança e instalação da nova sede em Jacareí-SP." },
  { year: "2023", text: "Parcerias com SOS Mata Atlântica e Suzano para Planos Municipais, SAVE Brasil para Plano de Manejo em Guararema e início do projeto Viver o Viveiro." },
  { year: "2024", text: "Ampliação de contratos e lançamento do programa Jovens Observadores, voltado ao emprego verde e turismo sustentável." },
  { year: "2025", text: "Nova identidade visual, participação no programa BTG Soma Meio Ambiente e expansão de projetos de restauração ecológica e mobilização social." },
];

const teamMembers = [
  { name: "Fernanda", role: "DIRETORA INSTITUCIONAL", image: photoFernanda },
  { name: "Fátima", role: "DIRETORA TÉCNICA", image: photoFatima },
  { name: "Jhennifer", role: "TÉCNICA EM COMUNICAÇÃO", image: photoJhennifer },
  { name: "Leilane", role: "ANALISTA DE RECURSOS", image: photoLeilane },
  { name: "Mateus", role: "ESTAGIÁRIO ADMINISTRATIVO", image: photoMateus },
  { name: "Ariane", role: "ANALISTA SOCIOAMBIENTAL JÚNIOR", image: photoAriane },
  { name: "Tatiane", role: "ANALISTA SOCIOAMBIENTAL PLENO", image: photoTatiane },
];

const conselho = [
  { role: "PRESIDENTE", name: "Maria José de Brito Zákia" },
  { role: "VICE-PRESIDENTE", name: "Maria Santini de Castro Morini" },
  { role: "CONSELHO FISCAL", name: "Lucila Manzatti" },
  { role: "CONSELHO FISCAL", name: "Paulo Valadares Soares" },
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
      const firstItem = scrollRef.current.querySelector('.timeline-item');
      if (firstItem) {
        const itemWidth = firstItem.clientWidth;
        const amount = itemWidth * 2;
        scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
      } else {
        const amount = 300;
        scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
      }
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
      <section id="quem-somos" className="py-16 md:py-24 px-4 relative overflow-hidden">
        <img src={folhaContraste} alt="" className="absolute -left-16 -top-12 w-48 md:w-80 opacity-20 pointer-events-none -rotate-12" />
        <img src={folhaContraste} alt="" className="absolute -right-24 -bottom-50 w-64 md:w-96 opacity-20 pointer-events-none rotate-180" />

        <div className="container mx-auto max-w-4xl text-center relative z-10 px-8">
          <h2 className="section-title mb-8">Quem somos</h2>
          <p className="body-text font-medium">
            O Instituto Suinã é uma organização da sociedade civil fundada em 2014, fruto do sonho de cinco biólogas comprometidas em transformar a relação entre pessoas, fauna, flora e território. Inspiradas pelo Suinã, árvore que simboliza força e resiliência, atuamos na conservação e restauração da sociobiodiversidade nas bacias hidrográficas de Alto e Médio Tietê e do Rio Paraíba do Sul. Desde a nossa origem, desenvolvemos projetos que articulam ciência, educação, mobilização social e políticas públicas, porque acreditamos que a conservação só é eficaz quando é feita coletivamente. Hoje somos uma rede de profissionais que fortalece territórios, restaura ecossistemas e valoriza saberes e culturas locais, contribuindo para a transição a uma sociedade mais justa e sustentável.
          </p>
        </div>
      </section>

      {/* Missão, Visão e Valores - CORRIGIDO */}
      <section className="py-20 px-4 bg-[#FDFBF6]">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { id: "Mission", label: "Missão", icon: iconeMissao, bgColor: "bg-[#D16B5D]" },
              { id: "Vision", label: "Visão", icon: iconeVisao, bgColor: "bg-[#718E7B]" },
              { id: "Values", label: "Valores", icon: iconeValores, bgColor: "bg-[#CD7D32]" }
            ].map((item) => (
              <div
                key={item.id}
                className={`${item.bgColor} min-h-[250px] cursor-pointer hover:scale-[1.05] transition-all relative shadow-xl rounded-[2rem] flex flex-col items-center justify-center text-center p-8`}
                onClick={() => setOpenModal(item.id)}
              >
                <div className="w-20 h-20 flex items-center justify-center mb-4">
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-full h-full object-contain brightness-0 invert"
                  />
                </div>
                <span className="font-display text-3xl font-bold text-white block">
                  {item.label}
                </span>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className={`${item.bgColor} w-[85%] h-[85%] rounded-full flex items-center justify-center`}>
                    <Plus className="w-8 h-8 text-white font-bold" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Linha do tempo (Ajustada para a linha não vazar) */}
      <section id="timeline" className="py-24 px-4 bg-[#FDFBF6] relative overflow-hidden">
        <div className="container mx-auto max-w-5xl">
          <h2 className="section-title text-center mb-16 italic text-secondary">Linha do tempo do Suinã</h2>

          <div className="relative mx-auto max-w-4xl"> {/* Container que limita as setas e a linha */}

            {/* LINHA VERDE - Agora com limites laterais para não ultrapassar as setas */}
            <div className="absolute top-[48px] left-8 right-8 h-[2px] bg-[#2f4b3c] z-0 opacity-80" />

            {/* Seta Esquerda */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-[-20px] top-[30px] z-30 bg-white w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-black/5"
            >
              <ChevronLeft className="w-4 h-4 text-[#2f4b3c]" />
            </button>

            {/* Seta Direita */}
            <button
              onClick={() => scroll("right")}
              className="absolute right-[-20px] top-[30px] z-30 bg-white w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-black/5"
            >
              <ChevronRight className="w-4 h-4 text-[#2f4b3c]" />
            </button>

            {/* Container do Scroll */}
            <div
              ref={scrollRef}
              className="overflow-hidden flex scroll-smooth snap-x snap-mandatory"
            >
              <div className="flex py-10 w-full">
                {timelineData.map((item) => (
                  <div
                    key={item.year}
                    className="timeline-item flex-shrink-0 w-full md:w-1/3 snap-start flex flex-col items-center px-2 relative"
                  >
                    {/* Ponto na linha */}
                    <div className="w-5 h-5 rounded-full border-[3px] border-[#FDFBF6] z-10 mb-8 bg-[#2f4b3c]" />

                    <span className="font-display text-2xl font-bold text-[#ba2c18] mb-2">
                      {item.year}
                    </span>
                    <p className="font-body text-xs md:text-[13px] text-[#7d5127] text-center leading-relaxed max-w-[200px]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Equipe */}
      <section id="equipe" className="relative w-full overflow-hidden">

        {/* 1. O ARCO DA PINCELADA */}
        <div className="w-full bg-[#FDFBF6] overflow-hidden relative" style={{ height: '300px' }}> {/* Aumentei a altura da janela */}
          <img
            src={fundoVerdeBrush}
            alt=""
            className="absolute pointer-events-none"
            style={{
              width: '100vw',    // Ocupa a largura total da tela
              height: '100%',    // Ocupa a altura total da div de 300px
              left: '0',
              top: '0',
              // O SEGREDO: object-fit: fill força o estiramento horizontal 
              // mas permite que o arco apareça inteiro na vertical
              objectFit: 'fill',
            }}
          />
        </div>

        {/* 2. ÁREA VERDE (CONTEÚDO) */}
        <div className="bg-primary relative z-10 -mt-1 pb-20">
          <div className="container mx-auto px-4">
            {/* Bloco do 82% */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-10">
              <span className="font-display text-7xl md:text-[110px] font-bold text-primary-foreground leading-none">
                82%
              </span>
              <p className="font-display text-xl md:text-3xl font-normal text-primary-foreground leading-tight md:text-left text-center">
                da equipe do Suinã<br />é composta por mulheres
              </p>
            </div>
          </div>
          {/* O resto do seu código (texto de apoio e fotos) continua aqui igual */}

          <div className="py-16 md:py-24 px-4">
            <div className="container mx-auto max-w-4xl relative z-10">

              <div className="space-y-6 text-center max-w-3xl mx-auto mb-16">
                <p className="body-text text-primary-foreground text-lg italic opacity-90">
                  Nos orgulhamos de ter um time diverso, forte e atuante, contribuindo diariamente para a transformação que buscamos.
                </p>
                <p className="body-text text-primary-foreground opacity-80">
                  O Instituto Suinã conta com uma rede de parceiros, prestadores de serviço, empresas e instituições que caminham conosco para fortalecer nossas ações e ampliar nosso impacto.
                </p>
              </div>

              {/* Grid de Membros */}
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-16 mb-20">
                {teamMembers.map((m) => (
                  <div key={m.name} className="text-center w-[calc(50%-1rem)] md:w-[calc(25%-2rem)] min-w-[140px] max-w-[200px]">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <img src={sketchCircle} alt="" className="absolute inset-[-15%] w-[130%] h-[130%] opacity-40 pointer-events-none" />
                      <div className="relative w-full h-full rounded-full bg-[#FDFBF6] overflow-hidden border-4 border-white/10 shadow-xl">
                        {m.image ? (
                          <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-200" />
                        )}
                      </div>
                    </div>
                    <p className="font-display text-lg font-bold text-white">{m.name}</p>
                    <p className="font-body text-[10px] text-white/60 uppercase tracking-widest mt-1">{m.role}</p>
                  </div>
                ))}
              </div>

              {/* Foto da Equipe Completa */}
              <div className="rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white/5">
                <img src={equipeCompleta} alt="Equipe completa" className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conselho */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden bg-suina-orange">
        <div
          className="absolute z-0 pointer-events-none"
          style={{
            backgroundImage: `url(${folhaContraste})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'left center',
            opacity: 0.4,
            // Tamanho da div (aumente ou diminua se precisar)
            width: '600px',
            height: '600px',
            // Posicionamento: Colada na esquerda
            left: '-20px',  // Ajuste esse valor para o caule "entrar" mais ou menos na tela
            top: '50%',    // Ajuste aqui para a altura que você quer que ela brote
            // A MÁGICA: Centraliza verticalmente e gira para cima (-90) a partir da base esquerda
            transform: 'translateY(-30%) rotate(-40deg)',
            transformOrigin: 'left bottom',
          }}
          aria-hidden="true"
        />

        <div className="container mx-auto max-w-2xl text-center relative z-10">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.2] text-card mb-8">Conselho</h2>
          <div className="space-y-8">
            {conselho.map((c, i) => (
              <div key={i}>
                {c.role && <p className="caption-text text-card/70 mb-1">{c.role}</p>}
                <p className="font-display text-xl md:text-2xl font-semibold text-card">{c.name}</p>
              </div>
            ))}
          </div>
          <p className="caption-text text-card/60 mt-10">
            MANDATO: 08/03/2023 A 08/03/2026
          </p>
        </div>
      </section>

      {/* Parceiros */}
      <section id="parceiros" className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.2] italic text-secondary mb-8">Parceiros e apoiadores</h2>
          <img src={logosParceiros} alt="Logos dos parceiros e apoiadores do Instituto Suinã" className="w-full" />
        </div>
      </section>

      {/* Modals */}
      {
        openModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setOpenModal(null)}>
            <div
              className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl animate-in fade-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setOpenModal(null)}
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${openModal === 'Mission' ? 'bg-suina-red/10' :
                  openModal === 'Vision' ? 'bg-primary/10' : 'bg-suina-orange/10'
                  }`}>
                  <img
                    src={openModal === 'Mission' ? iconeMissao : openModal === 'Vision' ? iconeVisao : iconeValores}
                    className="w-12 h-12"
                    alt=""
                  />
                </div>
                <h3 className="font-display text-xl md:text-2xl font-semibold leading-snug mb-6">
                  {openModal === 'Mission' ? 'Missão' : openModal === 'Vision' ? 'Visão' : 'Valores'}
                </h3>
                <p className="body-text">
                  {modalContent[openModal as keyof typeof modalContent]}
                </p>
              </div>
            </div>
          </div>
        )
      }
    </Layout >
  );
};

export default Index;
