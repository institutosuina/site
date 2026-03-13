import Layout from "@/components/Layout";
import { Heart, ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react";
import heroForest from "@/assets/hero-forest.jpg";
import paperTexture from "@/assets/paper-texture.png";

const ComoApoiar = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroForest} 
            alt="Floresta Suinã" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#2f4b3c]/60 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Como Apoiar
          </h1>
          <p className="font-body text-lg md:text-xl max-w-2xl mx-auto opacity-90 italic">
            "Sua contribuição é a semente de um futuro mais sustentável e resiliente."
          </p>
        </div>
      </section>

      {/* Donation Explanation */}
      <section className="py-20 px-4 bg-white relative">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
            <div className="flex-1">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#2f4b3c] mb-6">
                Por que apoiar o Instituto Suinã?
              </h2>
              <p className="font-body text-lg text-gray-700 leading-relaxed mb-6">
                Ao apoiar o Suinã, você investe diretamente na conservação e restauração da sociobiodiversidade. Nossas ações conectam ciência, educação e mobilização social para fortalecer territórios e regenerar ecossistemas vitais.
              </p>
              <ul className="space-y-4">
                {[
                  "Restauração de áreas degradadas",
                  "Educação ambiental para comunidades",
                  "Preservação da fauna e flora local",
                  "Fortalecimento da cultura regional"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#7d5127] font-medium">
                    <CheckCircle2 className="w-5 h-5 text-[#ba2c18]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/3 bg-[#e6d5bc]/30 p-8 rounded-3xl border border-[#e6d5bc]">
              <Heart className="w-12 h-12 text-[#ba2c18] mb-4 mx-auto" />
              <h3 className="font-display text-xl font-bold text-center text-[#2f4b3c] mb-4">Como Doar</h3>
              <div className="space-y-4 font-body text-sm text-center text-[#7d5127]">
                <p>Transferência Bancária ou PIX:</p>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-[#2f4b3c]">CNPJ: 00.000.000/0001-00</p>
                  <p className="opacity-70">Banco do Brasil</p>
                </div>
                <button className="w-full py-3 bg-[#ba2c18] text-white rounded-xl font-display font-bold hover:bg-[#a02615] transition-colors shadow-md">
                  Copiar Chave PIX
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Store Placeholder */}
      <section 
        className="py-20 px-4 relative overflow-hidden"
        style={{ backgroundImage: `url(${paperTexture})`, backgroundSize: 'cover' }}
      >
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="bg-[#2f4b3c] text-white p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
            <ShoppingBag className="w-16 h-16 opacity-20 absolute -top-4 -left-4 -rotate-12" />
            <ShoppingBag className="w-16 h-16 opacity-20 absolute -bottom-4 -right-4 rotate-12" />
            
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Loja Virtual Suinã</h2>
            <p className="font-body text-lg italic opacity-90 mb-8 max-w-xl mx-auto">
              Estamos preparando uma curadoria especial de produtos que carregam a alma do nosso território. Em breve você poderá apoiar nossos projetos levando um pedaço da nossa história para casa.
            </p>
            <div className="inline-flex items-center gap-2 px-8 py-3 bg-[#e6d5bc] text-[#2f4b3c] rounded-full font-display font-bold text-lg">
              Em Breve
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ComoApoiar;
