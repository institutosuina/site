import Layout from "@/components/Layout";
import educAmbientalIcon from "@/assets/educ ambiental.svg";
import fortalecimentoIcon from "@/assets/fortalecimento.svg";
import conservacaoIcon from "@/assets/conservacao.svg";
import outrasLinhasIcon from "@/assets/outras linhas.svg";

const areas = [
  { icon: educAmbientalIcon, label: "Educação\nAmbiental", colorStyle: "hsl(var(--primary))" },
  { icon: fortalecimentoIcon, label: "Fortalecimento e\nMobilização\nsocioambiental", colorStyle: "hsl(var(--suina-red))" },
  { icon: conservacaoIcon, label: "Conservação\ne manejo de\nbiodiversidade", colorStyle: "hsl(var(--suina-brown))" },
  { icon: outrasLinhasIcon, label: "Outras linhas\nde atuação", colorStyle: "hsl(var(--suina-orange))" },
];

const NossoTrabalho = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24 px-4 font-display">
        <div className="container mx-auto max-w-lg">
          <h1 className="section-title mb-12 text-secondary text-center">
            Nosso trabalho
          </h1>
          <div className="grid grid-cols-2 gap-6 auto-rows-fr">
            {areas.map((area, i) => {
              return (
                <div
                  key={i}
                  className="rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-6 cursor-pointer hover:scale-[1.05] transition-all min-h-[220px] shadow-xl border-4 border-white/10"
                  style={{ backgroundColor: area.colorStyle }}
                >
                  <div className="w-16 h-16 flex items-center justify-center">
                    <img
                      src={area.icon}
                      alt=""
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="font-display text-sm md:text-lg font-bold text-center whitespace-pre-line leading-tight text-white">
                    {area.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NossoTrabalho;
