import Layout from "@/components/Layout";
import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";
import news4 from "@/assets/news-4.jpg";
import news5 from "@/assets/news-5.jpg";
import news6 from "@/assets/news-6.jpg";
import { ArrowRight } from "lucide-react";

const newsItems = [
  {
    image: news1,
    title: "Junho EcoSustentável realiza palestra sobre compostagem doméstica no Viveiro de Mudas",
    date: "25/06/2025",
  },
  {
    image: news2,
    title: "Encontro no Parque Municipal debate ações conjuntas para unidades de conservação da Serra do Itapeti",
    date: "25/04/2024",
  },
  {
    image: news3,
    title: "'Viver o Viveiro'! Público aprova abertura do Viveiro Municipal aos domingos, em Jacareí.",
    date: "25/09/2023",
  },
  {
    image: news4,
    title: "É neste e em todo domingo, hein! Viveiro de Jacareí agora abre todos os domingos, com trilhas, oficinas, e diversas atrações.",
    date: "22/09/2023",
  },
  {
    image: news5,
    title: "Condemat participa de APL para fortalecer cadeia produtiva do mel na região",
    date: "20/10/2021",
  },
  {
    image: news6,
    title: "Fibria estimula práticas sustentáveis em escolas municipais de Capão Bonito",
    date: "27/07/2018",
  },
];

const Noticias = () => {
  return (
    <Layout>
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="section-title text-center mb-12 uppercase tracking-wide text-secondary">Notícias</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item, i) => (
              <div key={i} className="news-card group cursor-pointer rounded-lg overflow-hidden border border-border bg-card shadow-sm">
                <div className="relative overflow-hidden h-56">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Title overlay on image */}
                  <div className="absolute bottom-0 left-0 right-0 bg-background/85 backdrop-blur-sm px-4 py-3">
                    <h3 className="font-display text-sm font-bold text-foreground leading-snug italic">
                      {item.title}
                    </h3>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="font-body text-xs text-accent italic">Publicação: {item.date}</span>
                  <button className="flex items-center gap-1 bg-secondary text-secondary-foreground px-4 py-1.5 rounded font-body text-xs font-semibold uppercase hover:bg-secondary/90 transition-colors">
                    LEIA MAIS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Noticias;
