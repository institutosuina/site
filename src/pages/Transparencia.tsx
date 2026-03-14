import Layout from "@/components/Layout";
import wheatDecoration from "@/assets/wheat-decoration.png";
import manualLGPD from "@/assets/Manual_LGPD_Suina.pdf";
import estatutoSuina from "@/assets/Estatuto_Suina.pdf";
import { Plus, Download } from "lucide-react";
import { Link } from "react-router-dom";

const cards = [
  { label: "Política e\nManual de\nBoas práticas\n(LGPD)", color: "card-green", href: "#", isDownload: true, file: manualLGPD, fileName: 'Manual_LGPD_Suina.pdf' },
  { label: "Estatuto\nsocial", color: "card-sage", href: "#", isDownload: true, file: estatutoSuina, fileName: 'Estatuto_Suina.pdf' },
  { label: "Relatórios\nde Resultados", color: "card-red", href: "/transparencia" },
  { label: "Demonstrativos\nContábeis", color: "card-brown", href: "/transparencia" },
  { label: "Prestação\nde contas", color: "card-sage", href: "/prestacao-de-contas" },
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
      <section className="py-16 px-4 relative">
        <img src={wheatDecoration} alt="" className="absolute right-0 top-0 w-40 opacity-20 pointer-events-none" />
        <img src={wheatDecoration} alt="" className="absolute left-0 bottom-20 w-40 opacity-20 pointer-events-none rotate-180" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <h1 className="section-title text-center mb-6 uppercase tracking-wide underline underline-offset-4 text-secondary">
            Transparência
          </h1>
          <h2 className="section-subtitle text-center mb-6 italic underline underline-offset-4 text-foreground">
            Resultados e compromissos:
          </h2>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="font-display text-lg italic leading-relaxed text-foreground/80 mb-4">
              O Instituto Suinã é uma organização da sociedade civil, sem fins lucrativos, dedicada à promoção de boas práticas de governança e à gestão transparente de suas ações. Trabalhamos de forma comprometida com nossos valores, acompanhando de perto a execução dos projetos e iniciativas, fortalecendo vínculos com comunidades e parceiros e definindo estratégias que garantem a realização de nossa missão.
            </p>
            <p className="font-display text-lg italic leading-relaxed text-foreground/80">
              Acreditamos que transparência e responsabilidade são essenciais para gerar confiança e impacto positivo. Por isso, disponibilizamos nesta página informações atualizadas sobre nossas atividades, resultados e compromissos, reafirmando nosso compromisso com a vida e com o futuro das próximas gerações.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {cards.slice(0, 3).map((card, i) => (
              <Link 
                key={i} 
                to={card.href} 
                onClick={(e) => handleDownload(e, card)}
                className={`${card.color} min-h-[200px] cursor-pointer hover:scale-[1.02] transition-transform flex flex-col items-center justify-center p-6 text-center shadow-lg rounded-2xl`}
              >
                <span className="font-display text-xl font-bold text-white whitespace-pre-line leading-tight">{card.label}</span>
                <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center mt-4 shrink-0">
                  {card.isDownload ? <Download className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                </div>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
            {cards.slice(3).map((card, i) => (
              <Link 
                key={i} 
                to={card.href} 
                onClick={(e) => handleDownload(e, card)}
                className={`${card.color} min-h-[200px] cursor-pointer hover:scale-[1.02] transition-transform flex flex-col items-center justify-center p-6 shadow-lg rounded-2xl`}
              >
                <span className="font-display text-xl font-bold text-center whitespace-pre-line text-white">{card.label}</span>
                <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center mt-4">
                  {card.isDownload ? <Download className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
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
