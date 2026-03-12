import Layout from "@/components/Layout";
import { BookOpen, Users, Leaf, Workflow } from "lucide-react";

const areas = [
  { icon: BookOpen, label: "Educação\nAmbiental", color: "bg-primary" },
  { icon: Users, label: "Fortalecimento e\nMobilização\nsocioambiental", color: "bg-destructive", colorStyle: "hsl(var(--suina-red))" },
  { icon: Leaf, label: "Conservação\ne manejo de\nbiodiversidade", colorStyle: "hsl(var(--suina-brown))" },
  { icon: Workflow, label: "Outras linhas\nde atuação", colorStyle: "hsl(var(--suina-orange))" },
];

const NossoTrabalho = () => {
  return (
    <Layout>
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-md">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-10 italic text-secondary">
            Nosso trabalho
          </h1>
          <div className="grid grid-cols-2 gap-4 auto-rows-fr">
            {areas.map((area, i) => {
              const Icon = area.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform min-h-[180px]"
                  style={{ backgroundColor: area.colorStyle || "hsl(var(--primary))" }}
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <Icon className="w-9 h-9 text-primary-foreground opacity-90" strokeWidth={1.5} />
                  </div>
                  <span className="font-display text-sm md:text-base font-bold text-center whitespace-pre-line leading-tight text-primary-foreground">
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
