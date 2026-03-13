import Layout from "@/components/Layout";
import leafDecoration from "@/assets/leaf-decoration.png";
import paperTexture from "@/assets/paper-texture.png";
import { Plus } from "lucide-react";

const PrestacaoContas = () => {
  return (
    <Layout>
      <section className="py-16 px-4 min-h-[50vh] relative">
        <img src={leafDecoration} alt="" className="absolute right-0 bottom-0 w-48 opacity-10 pointer-events-none" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <h1 className="section-title text-center mb-12 uppercase tracking-wide underline underline-offset-4 text-secondary">
            Prestação de Contas
          </h1>
          <div className="max-w-xs">
            <div 
              className="flex items-center gap-3 bg-suina-brown rounded-full px-6 py-3 cursor-pointer hover:bg-suina-brown/90 transition-colors shadow-md"
              style={{ 
                backgroundImage: `url(${paperTexture})`,
                backgroundSize: 'cover',
                backgroundBlendMode: 'multiply'
              }}
            >
              <span className="font-display text-base font-bold text-white flex-1">Viver o Viveiro</span>
              <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrestacaoContas;
