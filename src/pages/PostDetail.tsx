import Layout from "@/components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

type ContentType = "posts_blog" | "noticias" | "editais" | "material_tecnico";

const labelMap: Record<ContentType, { singular: string; backPath: string }> = {
  posts_blog: { singular: "Blog", backPath: "/blog" },
  noticias: { singular: "Notícias", backPath: "/noticias" },
  editais: { singular: "Editais", backPath: "/editais" },
  material_tecnico: { singular: "Material Técnico", backPath: "/material-tecnico" },
};

const PostDetail = ({ table }: { table: ContentType }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const config = labelMap[table];

  const { data: post, isLoading } = useQuery({
    queryKey: ["post-detail", table, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("slug", slug!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  return (
    <Layout>
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <button
            onClick={() => navigate(config.backPath)}
            className="flex items-center gap-2 text-secondary font-display font-bold mb-8 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para {config.singular}
          </button>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : !post ? (
            <p className="text-center text-muted-foreground font-body py-16">Conteúdo não encontrado.</p>
          ) : (
            <article>
              <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground leading-tight mb-4">
                {post.title}
              </h1>
              {post.published_at && (
                <p className="caption-text italic text-secondary mb-6">
                  Publicação: {new Date(post.published_at).toLocaleDateString("pt-BR")}
                </p>
              )}
              {post.cover_image && (
                <div className="rounded-2xl overflow-hidden mb-8">
                  <img src={post.cover_image} alt={post.title} className="w-full h-auto object-cover" />
                </div>
              )}
              <div 
                className="prose prose-lg max-w-none font-body text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
              />
            </article>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default PostDetail;
