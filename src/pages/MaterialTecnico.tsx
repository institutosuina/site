import Layout from "@/components/Layout";
import materialArvores from "@/assets/material-arvores.jpg";
import materialPlano from "@/assets/material-plano.jpg";
import { Download } from "lucide-react";

const materials = [
  {
    image: materialArvores,
    title: "Árvores Raras na Paisagem",
    type: "illustration",
  },
  {
    image: materialPlano,
    title: "Plano de Manejo Guararema/SP",
    subtitle: "Refúgio de Vida Silvestre do Bicudinho",
    type: "download",
  },
];

const MaterialTecnico = () => {
  return (
    <Layout>
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="section-title text-center mb-12 uppercase tracking-wide">Material Técnico</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {materials.map((m, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-lg group cursor-pointer relative">
                <img src={m.image} alt={m.title} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 text-center">
                  <Download className="w-10 h-10 mb-3" />
                  <p className="font-display text-xl font-bold leading-tight">{m.title}</p>
                  {m.subtitle && <p className="font-body text-sm opacity-90 mt-2">{m.subtitle}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default MaterialTecnico;
