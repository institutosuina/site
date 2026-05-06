import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import educAmbientalIcon from "@/assets/educ ambiental.svg";
import fortalecimentoIcon from "@/assets/fortalecimento.svg";
import conservacaoIcon from "@/assets/conservacao.svg";

const areas = [
  {
    id: "educacao",
    icon: educAmbientalIcon,
    label: "Educação\nAmbiental",
    colorStyle: "hsl(var(--primary))",
  },
  {
    id: "fortalecimento",
    icon: fortalecimentoIcon,
    label: "Fortalecimento e\nMobilização\nsocioambiental",
    colorStyle: "hsl(var(--suina-red))",
  },
  {
    id: "conservacao",
    icon: conservacaoIcon,
    label: "Conservação\ne manejo de\nbiodiversidade",
    colorStyle: "hsl(var(--suina-brown))",
  },
];

const NossoTrabalho = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24 px-4 font-display min-h-[70vh] flex flex-col justify-center">
        <div className="container mx-auto max-w-5xl">
          <h1 className="section-title mb-12 text-secondary text-center">
            Nosso trabalho
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-fr">
            {areas.map((area, i) => {
              return (
                <Link
                  to={`/nosso-trabalho/${area.id}`}
                  key={i}
                  className="rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-6 cursor-pointer hover:scale-[1.05] transition-transform duration-300 min-h-[260px] shadow-2xl border-4 border-white/10"
                  style={{ backgroundColor: area.colorStyle }}
                >
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img
                      src={area.icon}
                      alt=""
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="font-display text-lg md:text-xl font-bold text-center whitespace-pre-line leading-tight text-white">
                    {area.label}
                  </span>
                  <div className="mt-auto pt-4 opacity-80 text-white/90 text-sm font-medium hover:underline underline-offset-4">
                    Ver projetos
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NossoTrabalho;
