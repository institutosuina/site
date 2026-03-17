import Layout from "@/components/Layout";
import wheatDecoration from "@/assets/wheat-decoration.png";
import manualLGPD from "@/assets/Manual_LGPD_Suina.pdf";
import estatutoSuina from "@/assets/Estatuto_Suina.pdf";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const cards = [
  { label: "Política e\nManual de\nBoas práticas\n(LGPD)", color: "bg-[#2D5A41]", href: "#", isDownload: true, file: manualLGPD, fileName: 'Manual_LGPD_Suina.pdf' },
  { label: "Estatuto\nsocial", color: "bg-[#759580]", href: "#", isDownload: true, file: estatutoSuina, fileName: 'Estatuto_Suina.pdf' },
  { label: "Relatórios\nde Resultados", color: "bg-[#B45045]", href: "/transparencia" },
  { label: "Demonstrativos\nContábeis", color: "bg-[#8B5A2B]", href: "/transparencia" },
  { label: "Prestação\nde contas", color: "bg-[#759580]", href: "/prestacao-de-contas" },
];

const Transparencia = () => {
  const handleDownload = (e: React.MouseEvent, card: typeof cards[0]) => {
    if (card.isDownload && card.file) {
      e.preventDefault();
      const link = document.createElement('a');
      link.href = card.file;
      link.download = card.fileName || 'documento.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Layout>
      <section className="py-16 md:py-24 px-4 relative overflow-hidden bg-[#FDFBF6]">
        {/* Decorações de Trigo */}
        <img src={wheatDecoration} alt="" className="absolute right-0 top-0 w-40 opacity-10 pointer-events-none" />
        <img src={wheatDecoration} alt="" className="absolute left-0 bottom-20 w-40 opacity-10 pointer-events-none rotate-180" />

        <div className="container mx-auto max-w-5xl relative z-10">

          {/* Cabeçalho */}
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-[#8B5A2B] uppercase tracking-tighter mb-4">
              Transparência
            </h1>
            <div className="w-24 h-1 bg-[#8B5A2B] mx-auto mb-8"></div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#2D2D2D]">
              Resultados e compromissos:
            </h2>
          </div>

          {/* Texto Institucional */}
          <div className="max-w-4xl mx-auto text-center mb-20 space-y-6">
            <p className="body-text text-lg text-gray-700 leading-relaxed">
              O Instituto Suinã é uma organização da sociedade civil, sem fins lucrativos, dedicada à promoção de boas práticas de governança e à gestão transparente de suas ações. Trabalhamos de forma comprometida com nossos valores, acompanhando de perto a execução dos projetos e iniciativas, fortalecendo vínculos com comunidades e parceiros e definindo estratégias que garantem a realização de nossa missão.
            </p>
            <p className="body-text text-lg text-gray-700 leading-relaxed">
              Acreditamos que transparência e responsabilidade são essenciais para gerar confiança e impacto positivo. Por isso, disponibilizamos nesta página informações atualizadas sobre nossas atividades, resultados e compromissos, reafirmando nosso compromisso com a vida e com o futuro das próximas gerações.
            </p>
          </div>

          {/* Grid Principal (Primeiros 3 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {cards.slice(0, 3).map((card, i) => (
              <Link
                key={i}
                to={card.href}
                onClick={(e) => handleDownload(e, card)}
                className={`${card.color} aspect-square rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-xl hover:scale-[1.03] transition-all duration-300 relative group`}
              >
                <span className="font-display text-2xl md:text-3xl font-bold text-white whitespace-pre-line leading-tight mb-6">
                  {card.label}
                </span>

                {/* Botão circular vazado com ícone Plus (+) */}
                <div className="absolute -bottom-7 w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center transition-all">
                  <div className={`${card.color} w-full h-full rounded-full flex items-center justify-center`}>
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Grid Inferior (Últimos 2 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-2xl mx-auto mt-20">
            {cards.slice(3).map((card, i) => (
              <Link
                key={i}
                to={card.href}
                onClick={(e) => handleDownload(e, card)}
                className={`${card.color} aspect-square rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-xl hover:scale-[1.03] transition-all duration-300 relative group`}
              >
                <span className="font-display text-2xl md:text-3xl font-bold text-white whitespace-pre-line leading-tight mb-6">
                  {card.label}
                </span>

                <div className="absolute -bottom-7 w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center transition-all">
                  <div className={`${card.color} w-full h-full rounded-full flex items-center justify-center`}>
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Transparencia;