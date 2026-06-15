import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { WORK_AREAS_DATA } from "@/data/nossoTrabalho";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Icons and style definitions (same as NossoTrabalho.tsx)
import educAmbientalIcon from "@/assets/educ ambiental.svg";
import fortalecimentoIcon from "@/assets/fortalecimento.svg";
import conservacaoIcon from "@/assets/conservacao.svg";

const areaMeta = {
  educacao: {
    icon: educAmbientalIcon,
    label: "Educação Ambiental",
    colorStyle: "hsl(var(--primary))",
  },
  fortalecimento: {
    icon: fortalecimentoIcon,
    label: "Fortalecimento e Mobilização",
    colorStyle: "hsl(var(--suina-red))",
  },
  conservacao: {
    icon: conservacaoIcon,
    label: "Conservação e Manejo de Biodiversidade",
    colorStyle: "hsl(var(--suina-brown))",
  },
};

const NossoTrabalhoDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number; title: string } | null>(null);

  const { data: dynamicContent } = useQuery({
    queryKey: ["work-projects-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_page_content")
        .select("content")
        .eq("page_key", "nosso_trabalho")
        .maybeSingle();
      if (error) throw error;
      return data?.content as typeof WORK_AREAS_DATA | null;
    },
  });

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") setLightbox((prev) => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : prev);
      if (e.key === "ArrowRight") setLightbox((prev) => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : prev);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  if (!slug || !(slug in WORK_AREAS_DATA)) {
    return <Navigate to="/nosso-trabalho" replace />;
  }

  const areaId = slug as keyof typeof WORK_AREAS_DATA;
  const projects = (dynamicContent?.[areaId] && Array.isArray(dynamicContent[areaId]) ? dynamicContent[areaId] : WORK_AREAS_DATA[areaId]);
  const meta = areaMeta[areaId];

  const openLightbox = (images: string[], index: number, title: string) => {
    setLightbox({ images, index, title });
  };
  const closeLightbox = () => setLightbox(null);
  const goPrev = () => setLightbox((prev) => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : prev);
  const goNext = () => setLightbox((prev) => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : prev);

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="pt-32 pb-16 px-4 relative overflow-hidden"
        style={{ backgroundColor: meta.colorStyle }}
      >
        <div className="absolute inset-0 opacity-10 pattern-dots" />
        <div className="container mx-auto max-w-5xl relative z-10">
          <Link 
            to="/nosso-trabalho"
            className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar para Nosso Trabalho
          </Link>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-white/10 rounded-3xl p-6 shadow-inner backdrop-blur-sm">
              <img
                src={meta.icon}
                alt=""
                className="w-full h-full object-contain brightness-0 invert"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                {meta.label}
              </h1>
              <p className="text-white/90 text-lg md:text-xl font-body max-w-2xl">
                Conheça os projetos e materiais relacionados a esta linha de atuação do Instituto Suinã.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects List */}
      <section className="py-16 bg-background">
        <div className="container mx-auto max-w-5xl px-4 space-y-12">
          {projects.map((project, idx) => {
            const validImages = (project.images || []).filter((u) => typeof u === "string" && u.trim() !== "");
            const hasImages = validImages.length > 0;
            const multiImages = validImages.length > 1;
            return (
              <div
                key={idx}
                className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-primary leading-tight">
                    {project.title}
                  </h3>
                  {project.text && project.text !== "Projeto em andamento." ? (
                    <div className="font-body text-muted-foreground leading-relaxed whitespace-pre-line text-lg">
                      {project.text.split('**').map((part, i) => (
                        i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
                      ))}
                    </div>
                  ) : (
                    <p className="font-body text-muted-foreground/60 italic">
                      Projeto em andamento ou mais informações em breve.
                    </p>
                  )}
                </div>

                {hasImages && (
                  <div
                    className={
                      multiImages
                        ? "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid gap-4 grid-cols-1"
                    }
                  >
                    {validImages.map((imgUrl, imgIdx) => (
                      <button
                        key={imgIdx}
                        type="button"
                        onClick={() => openLightbox(validImages, imgIdx, project.title)}
                        className={
                          (multiImages ? "aspect-[4/3]" : "aspect-video md:aspect-[16/9] max-h-[60vh]") +
                          " group relative overflow-hidden rounded-2xl bg-muted cursor-zoom-in"
                        }
                        aria-label={`Ampliar ${project.title} — imagem ${imgIdx + 1}`}
                      >
                        <img
                          src={imgUrl}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40"
                        />
                        <img
                          src={imgUrl}
                          alt={`${project.title} - Imagem ${imgIdx + 1}`}
                          className="relative z-10 w-full h-full object-cover drop-shadow-md group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-8"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>

          {lightbox.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={lightbox.images[lightbox.index]}
            alt={`${lightbox.title} - Imagem ${lightbox.index + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain select-none"
          />

          {lightbox.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-body">
              {lightbox.index + 1} / {lightbox.images.length}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default NossoTrabalhoDetail;
