import Layout from "@/components/Layout";
import leafDecoration from "@/assets/leaf-decoration.png";
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
          <div className="max-w-xl">
            <div className="flex items-center gap-4 bg-suina-brown rounded-full px-8 py-4 cursor-pointer hover:bg-suina-brown/90 transition-colors">
              <span className="font-display text-xl font-bold text-card flex-1">Viver o Viveiro</span>
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Plus className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrestacaoContas;
