import Layout from "@/components/Layout";
import wheatDecoration from "@/assets/wheat-decoration.png";
import manualLGPD from "@/assets/Manual_LGPD_Suina.pdf";
import estatutoSuina from "@/assets/Estatuto_Suina.pdf";
import { Plus, Download, X, FileText } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const cards = [
  { id: 'lgpd', label: "Política e\nManual de\nBoas práticas\n(LGPD)", color: "bg-[#2D5A41]", isDownload: true, file: manualLGPD, fileName: 'Manual_LGPD_Suina.pdf' },
  { id: 'estatuto', label: "Estatuto\nsocial", color: "bg-[#759580]", isDownload: true, file: estatutoSuina, fileName: 'Estatuto_Suina.pdf' },
  { id: 'resultados', label: "Relatórios\nde Resultados", color: "bg-[#B45045]" },
  { id: 'contabeis', label: "Demonstrativos\nContábeis", color: "bg-[#8B5A2B]" },
  { id: 'prestacao', label: "Prestação\nde contas", color: "bg-[#759580]", href: "/prestacao-de-contas" },
];

const Transparencia = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: allRelatorios } = useQuery({
    queryKey: ["relatorios-transparencia"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("relatorios")
        .select("*")
        .order("title", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getFilteredDocs = (categoryId: string) => {
    if (!allRelatorios) return [];
    
    const normalize = (str: string) => 
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

    if (categoryId === 'resultados') {
      return allRelatorios.filter(d => {
        const t = normalize(d.title);
        return t.includes('relat') || t.includes('portf') || t.includes('resultado');
      });
    }
    if (categoryId === 'contabeis') {
      return allRelatorios.filter(d => {
        const t = normalize(d.title);
        return t.includes('balan') || t.includes('demonstrat') || t.includes('cont');
      });
    }
    return [];
  };

  const handleCardClick = async (e: React.MouseEvent, card: typeof cards[0]) => {
    if (card.isDownload && card.file) {
      e.preventDefault();
      try {
        const response = await fetch(card.file);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', card.fileName || 'documento.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Erro ao baixar arquivo:", error);
        window.open(card.file, '_blank');
      }
      return;
    }

    if (card.id === 'resultados' || card.id === 'contabeis') {
      e.preventDefault();
      setSelectedCategory(card.id);
    }
  };

  const handleDocDownload = (e: React.MouseEvent, url: string, title: string) => {
    e.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentDocs = selectedCategory ? getFilteredDocs(selectedCategory) : [];
  const currentCard = cards.find(c => c.id === selectedCategory);

  return (
    <Layout>
      <section className="py-16 md:py-24 px-4 relative overflow-hidden bg-[#FDFBF6]">
        {/* Decorações de Trigo */}
        <img src={wheatDecoration} alt="" className="absolute right-0 top-0 w-40 opacity-10 pointer-events-none" />
        <img src={wheatDecoration} alt="" className="absolute left-0 bottom-20 w-40 opacity-10 pointer-events-none rotate-180" />

        <div className="container mx-auto max-w-5xl relative z-10">
          {/* Cabeçalho */}
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl md:text-6xl font-bold text-[#8B5A2B] uppercase tracking-tighter mb-4"
            >
              Transparência
            </motion.h1>
            <div className="w-24 h-1 bg-[#8B5A2B] mx-auto mb-8"></div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#2D2D2D]">
              Resultados e compromissos:
            </h2>
          </div>

          {/* Grid de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {cards.map((card, i) => {
              const Content = (
                <div className={`${card.color} aspect-square rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-xl hover:scale-[1.03] transition-all duration-300 relative group cursor-pointer`}>
                  <span className="font-display text-2xl md:text-3xl font-bold text-white whitespace-pre-line leading-tight mb-6">
                    {card.label}
                  </span>
                  <div className="absolute -bottom-7 w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center transition-all">
                    <div className={`${card.color} w-full h-full rounded-full flex items-center justify-center`}>
                      {card.isDownload ? (
                        <Download className="w-6 h-6 text-white" />
                      ) : (
                        <Plus className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              );

              if (card.href) {
                return (
                  <motion.a 
                    key={i} 
                    href={card.href}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {Content}
                  </motion.a>
                );
              }

              return (
                <motion.div 
                  key={i} 
                  onClick={(e) => handleCardClick(e, card)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {Content}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal de Documentos */}
      <AnimatePresence>
        {selectedCategory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCategory(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10"
            >
              <div className={`${currentCard?.color} p-8 text-white relative`}>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="absolute right-6 top-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-display text-2xl md:text-3xl font-bold mt-4">
                  {currentCard?.label.replace(/\n/g, ' ')}
                </h3>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {currentDocs.length > 0 ? (
                    currentDocs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={(e) => handleDocDownload(e, doc.file_url, doc.title)}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-secondary hover:bg-secondary/5 transition-all group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                          <FileText className="w-6 h-6 text-muted-foreground group-hover:text-secondary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-display font-bold text-foreground group-hover:text-secondary transition-colors">
                            {doc.title}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1 flex items-center gap-2">
                            Clique para baixar <Download className="w-3 h-3" />
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Nenhum documento encontrado nesta categoria.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Transparencia;
