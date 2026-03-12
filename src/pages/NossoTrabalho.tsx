import Layout from "@/components/Layout";
import { BookOpen, Users, Leaf, Workflow } from "lucide-react";

const areas = [
  { icon: BookOpen, label: "Educação\nAmbiental", color: "card-green" },
  { icon: Users, label: "Fortalecimento e\nMobilização\nsocioambiental", color: "card-red" },
  { icon: Leaf, label: "Conservação\ne manejo de\nbiodiversidade", color: "card-brown" },
  { icon: Workflow, label: "Outras linhas\nde atuação", color: "card-orange" },
];

const NossoTrabalho = () => {
  return (
    <Layout>
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-12 italic text-secondary">
            Nosso trabalho
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {areas.map((area, i) => {
              const Icon = area.icon;
              return (
                <div
                  key={i}
                  className={`${area.color} min-h-[220px] cursor-pointer hover:scale-[1.02] transition-transform`}
                >
                  <div className="w-16 h-16 flex items-center justify-center">
                    <Icon className="w-12 h-12 opacity-80" strokeWidth={1.5} />
                  </div>
                  <span className="font-display text-xl font-bold text-center whitespace-pre-line leading-tight">
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
