import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { WORK_AREAS_DATA } from "@/data/nossoTrabalho";

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

  if (!slug || !(slug in WORK_AREAS_DATA)) {
    return <Navigate to="/nosso-trabalho" replace />;
  }

  const areaId = slug as keyof typeof WORK_AREAS_DATA;
  const projects = WORK_AREAS_DATA[areaId];
  const meta = areaMeta[areaId];

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
        <div className="container mx-auto max-w-4xl px-4 space-y-12">
          {projects.map((project, idx) => (
            <div 
              key={idx} 
              className="group flex flex-col md:flex-row gap-8 items-start bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {project.images && project.images.length > 0 && project.images[0] !== "" && (
                <div className={`w-full md:w-2/5 flex-shrink-0 grid gap-4 ${project.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {project.images.map((imgUrl, imgIdx) => (
                    imgUrl ? (
                      <div key={imgIdx} className={`aspect-video md:aspect-[4/3] overflow-hidden rounded-2xl relative bg-muted ${project.images.length === 3 && imgIdx === 2 ? 'col-span-2' : ''}`}>
                        <img 
                          src={imgUrl} 
                          alt={`${project.title} - Imagem ${imgIdx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 group-hover:scale-110 transition-transform duration-700" 
                        />
                        <img 
                          src={imgUrl} 
                          alt={`${project.title} - Imagem ${imgIdx + 1}`}
                          className="relative z-10 w-full h-full object-contain p-2 drop-shadow-md group-hover:scale-105 transition-transform duration-500 cursor-pointer hover:object-cover"
                        />
                      </div>
                    ) : null
                  ))}
                </div>
              )}
              <div className="flex-1 space-y-4">
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
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default NossoTrabalhoDetail;
