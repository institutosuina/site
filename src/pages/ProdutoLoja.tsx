import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Plus, Minus, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/pix";
import { useCart, cartStore } from "@/lib/cart";
import { toast } from "@/hooks/use-toast";

const db = supabase as any;

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem_url: string | null;
  imagens: string[] | null;
  slug: string;
}

const ProdutoLoja = () => {
  const { slug } = useParams();
  const cart = useCart();
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const { data: produto, isLoading } = useQuery({
    queryKey: ["loja-produto", slug],
    queryFn: async () => {
      const { data, error } = await db
        .from("produtos")
        .select("id, nome, descricao, preco, estoque, imagem_url, imagens, slug")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as Produto | null;
    },
  });

  const fotos = produto ? [produto.imagem_url, ...(produto.imagens ?? [])].filter((x): x is string => !!x) : [];
  const principal = selecionada && fotos.includes(selecionada) ? selecionada : fotos[0];
  const qty = produto ? cart[produto.id] || 0 : 0;
  const esgotado = !!produto && produto.estoque <= 0;

  const setQty = (n: number) => {
    if (!produto) return;
    const next = Math.max(0, Math.min(n, produto.estoque));
    cartStore.set(produto.id, next);
    if (qty === 0 && next > 0) toast({ title: "Adicionado ao carrinho" });
  };

  return (
    <Layout>
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <Link to="/loja" className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" /> Voltar para a loja
          </Link>

          {isLoading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : !produto ? (
            <p className="text-center body-text">Produto não encontrado.</p>
          ) : (
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                {principal ? (
                  <img src={principal} alt={produto.nome} className="w-full aspect-square object-cover rounded-2xl border border-suina-cream-dark" />
                ) : (
                  <div className="w-full aspect-square bg-suina-cream/40 rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 opacity-30" />
                  </div>
                )}
                {fotos.length > 1 && (
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {fotos.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setSelecionada(f)}
                        className={`rounded-lg overflow-hidden border-2 ${f === principal ? "border-suina-red" : "border-transparent"}`}
                      >
                        <img src={f} alt="" className="w-full aspect-square object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <h1 className="section-title text-primary mb-3">{produto.nome}</h1>
                <p className="font-display text-3xl font-bold mb-6">{formatBRL(produto.preco)}</p>
                {produto.descricao && (
                  <p className="body-text text-muted-foreground whitespace-pre-line mb-8">{produto.descricao}</p>
                )}

                <div className="mt-auto space-y-3">
                  {qty === 0 ? (
                    <button
                      type="button"
                      disabled={esgotado}
                      onClick={() => setQty(1)}
                      className="w-full py-3 bg-suina-red text-primary-foreground rounded-xl font-display font-bold disabled:opacity-40"
                    >
                      {esgotado ? "Esgotado" : "Adicionar ao carrinho"}
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-4">
                        <button type="button" onClick={() => setQty(qty - 1)} className="w-10 h-10 rounded-full border flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                        <span className="font-bold w-8 text-center">{qty}</span>
                        <button type="button" onClick={() => setQty(qty + 1)} disabled={qty >= produto.estoque} className="w-10 h-10 rounded-full border flex items-center justify-center disabled:opacity-40"><Plus className="w-4 h-4" /></button>
                      </div>
                      <Link to="/loja" className="block w-full py-3 text-center bg-primary text-primary-foreground rounded-xl font-display font-bold">
                        Ver carrinho e finalizar
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ProdutoLoja;
