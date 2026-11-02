import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import PixDonation from "@/components/PixDonation";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/pix";

const db = supabase as any;

interface PedidoPublico {
  codigo: string;
  status: "aguardando_frete" | "aguardando_pagamento" | "pago" | "enviado" | "cancelado";
  itens: { nome: string; preco: number; quantidade: number }[];
  subtotal: number;
  frete: number | null;
  codigo_rastreio: string | null;
}

const mensagens: Record<PedidoPublico["status"], string> = {
  aguardando_frete: "Estamos calculando o frete. Assim que estiver pronto, o valor total e o Pix aparecem aqui e chegam no seu contato.",
  aguardando_pagamento: "Frete calculado! Faça o pagamento via Pix abaixo para confirmarmos o envio.",
  pago: "Pagamento confirmado. Estamos preparando o seu envio.",
  enviado: "Pedido enviado!",
  cancelado: "Este pedido foi cancelado.",
};

const PedidoLoja = () => {
  const { codigo } = useParams();

  const { data: pedido, isLoading } = useQuery({
    queryKey: ["pedido-publico", codigo],
    queryFn: async () => {
      const { data, error } = await db.rpc("pedido_publico", { p_codigo: codigo });
      if (error) throw error;
      return data as PedidoPublico | null;
    },
    refetchInterval: 30000,
  });

  const total = pedido ? pedido.subtotal + (pedido.frete ?? 0) : 0;

  return (
    <Layout>
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-xl">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : !pedido ? (
            <div className="text-center">
              <p className="body-text mb-6">Pedido não encontrado.</p>
              <Link to="/loja" className="underline">Voltar para a loja</Link>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <p className="font-body text-sm text-muted-foreground">Pedido</p>
                <h1 className="section-title text-primary">{pedido.codigo}</h1>
                <p className="body-text mt-4">{mensagens[pedido.status]}</p>
                {pedido.status === "enviado" && pedido.codigo_rastreio && (
                  <p className="font-body mt-2">Código de rastreio: <strong>{pedido.codigo_rastreio}</strong></p>
                )}
              </div>

              <div className="bg-card rounded-2xl border border-suina-cream-dark p-6 font-body text-sm space-y-2">
                {pedido.itens.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{i.quantidade}× {i.nome}</span>
                    <span>{formatBRL(i.preco * i.quantidade)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2">
                  <span>Subtotal</span><span>{formatBRL(pedido.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>{pedido.frete == null ? "a calcular" : formatBRL(pedido.frete)}</span>
                </div>
                {pedido.frete != null && (
                  <div className="flex justify-between font-display font-bold text-base border-t pt-2">
                    <span>Total</span><span>{formatBRL(total)}</span>
                  </div>
                )}
              </div>

              {pedido.status === "aguardando_pagamento" && (
                <div className="bg-suina-cream/30 p-8 rounded-3xl border border-suina-cream-dark">
                  <PixDonation amount={total} reference={pedido.codigo} />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default PedidoLoja;
