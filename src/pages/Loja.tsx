import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle2 } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatBRL } from "@/lib/pix";

// As tabelas da loja ainda não estão em integrations/supabase/types.ts.
const db = supabase as any;

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagem_url: string | null;
}

const emptyForm = {
  nome: "", email: "", telefone: "", cep: "", endereco: "", numero: "",
  complemento: "", bairro: "", cidade: "", uf: "", observacoes: "",
};

const inputClass =
  "w-full px-5 py-3 rounded-full bg-input text-foreground placeholder:text-muted-foreground font-body text-base focus:outline-none focus:ring-2 focus:ring-ring/20";

const Loja = () => {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [pedidoCodigo, setPedidoCodigo] = useState<string | null>(null);

  const { data: produtos, isLoading } = useQuery({
    queryKey: ["loja-produtos"],
    queryFn: async () => {
      const { data, error } = await db
        .from("produtos")
        .select("id, nome, descricao, preco, estoque, imagem_url")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Produto[];
    },
  });

  const items = (produtos || [])
    .filter((p) => cart[p.id] > 0)
    .map((p) => ({ produto: p, quantidade: cart[p.id] }));
  const subtotal = items.reduce((sum, i) => sum + i.produto.preco * i.quantidade, 0);

  const setQty = (p: Produto, qty: number) => {
    const next = Math.max(0, Math.min(qty, p.estoque));
    setCart((c) => ({ ...c, [p.id]: next }));
  };

  const set = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const buscarCep = async () => {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) return;
      setForm((f) => ({
        ...f,
        endereco: f.endereco || data.logradouro || "",
        bairro: f.bairro || data.bairro || "",
        cidade: f.cidade || data.localidade || "",
        uf: f.uf || data.uf || "",
      }));
    } catch {
      // preenchimento manual continua funcionando
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setSubmitting(true);
    try {
      const { data, error } = await db.rpc("criar_pedido", {
        p_cliente: { ...form, uf: form.uf.toUpperCase() },
        p_itens: items.map((i) => ({ produto_id: i.produto.id, quantidade: i.quantidade })),
      });
      if (error) throw error;
      setPedidoCodigo(data as string);
      setCart({});
      queryClient.invalidateQueries({ queryKey: ["loja-produtos"] });
    } catch (err: any) {
      toast({ title: "Não foi possível enviar o pedido", description: err.message, variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["loja-produtos"] });
    } finally {
      setSubmitting(false);
    }
  };

  if (pedidoCodigo) {
    return (
      <Layout>
        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto max-w-xl text-center">
            <CheckCircle2 className="w-14 h-14 text-suina-red mx-auto mb-6" />
            <h1 className="section-title text-primary mb-4">Pedido recebido!</h1>
            <p className="body-text mb-2">
              Seu código é <strong>{pedidoCodigo}</strong>.
            </p>
            <p className="body-text text-muted-foreground mb-8">
              Vamos calcular o frete para o seu endereço e te avisar por e-mail ou WhatsApp com o valor
              total e o Pix para pagamento. Você também pode acompanhar pelo link abaixo.
            </p>
            <Link
              to={`/loja/pedido/${pedidoCodigo}`}
              className="inline-block px-8 py-3 bg-primary text-primary-foreground font-display font-bold rounded-lg"
            >
              Acompanhar pedido
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h1 className="section-title text-primary text-center mb-3">Loja Suinã</h1>
          <p className="body-text text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Cada compra apoia os projetos socioambientais do Instituto. Pagamento via Pix; o frete é
            calculado depois do pedido, com base no seu endereço.
          </p>

          {isLoading ? (
            <p className="text-center text-muted-foreground">Carregando produtos...</p>
          ) : !produtos?.length ? (
            <p className="text-center text-muted-foreground">Nenhum produto disponível no momento.</p>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
              <div className="grid gap-6 sm:grid-cols-2">
                {produtos.map((p) => {
                  const qty = cart[p.id] || 0;
                  const esgotado = p.estoque <= 0;
                  return (
                    <article key={p.id} className="bg-card rounded-2xl border border-suina-cream-dark overflow-hidden flex flex-col">
                      {p.imagem_url ? (
                        <img src={p.imagem_url} alt={p.nome} className="w-full aspect-square object-cover" />
                      ) : (
                        <div className="w-full aspect-square bg-suina-cream/40 flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 opacity-30" />
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <h2 className="font-display text-lg font-bold text-primary">{p.nome}</h2>
                        <p className="font-body text-sm text-muted-foreground mt-1 mb-3 whitespace-pre-line flex-1">
                          {p.descricao}
                        </p>
                        <p className="font-display text-xl font-bold mb-1">{formatBRL(p.preco)}</p>
                        <p className="font-body text-xs text-muted-foreground mb-4">
                          {esgotado ? "Esgotado" : `${p.estoque} disponível(is)`}
                        </p>
                        {qty === 0 ? (
                          <button
                            type="button"
                            disabled={esgotado}
                            onClick={() => setQty(p, 1)}
                            className="w-full py-2.5 bg-suina-red text-primary-foreground rounded-xl font-display font-bold disabled:opacity-40"
                          >
                            Adicionar
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-4">
                            <button type="button" onClick={() => setQty(p, qty - 1)} className="w-9 h-9 rounded-full border flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                            <span className="font-bold w-6 text-center">{qty}</span>
                            <button type="button" onClick={() => setQty(p, qty + 1)} disabled={qty >= p.estoque} className="w-9 h-9 rounded-full border flex items-center justify-center disabled:opacity-40"><Plus className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <aside className="bg-suina-cream/30 rounded-3xl border border-suina-cream-dark p-6 h-fit lg:sticky lg:top-24">
                <h2 className="font-display text-xl font-bold text-primary mb-4">Seu pedido</h2>
                {!items.length ? (
                  <p className="font-body text-sm text-muted-foreground">Nenhum item selecionado.</p>
                ) : (
                  <>
                    <ul className="space-y-3 mb-4">
                      {items.map(({ produto, quantidade }) => (
                        <li key={produto.id} className="flex items-start justify-between gap-2 font-body text-sm">
                          <span>{quantidade}× {produto.nome}</span>
                          <span className="flex items-center gap-2">
                            {formatBRL(produto.preco * quantidade)}
                            <button type="button" onClick={() => setQty(produto, 0)} aria-label="Remover"><Trash2 className="w-4 h-4 opacity-50" /></button>
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between font-display font-bold border-t pt-3 mb-1">
                      <span>Subtotal</span><span>{formatBRL(subtotal)}</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mb-4">Frete calculado após o pedido.</p>
                    {!checkout && (
                      <button type="button" onClick={() => setCheckout(true)} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-display font-bold">
                        Continuar
                      </button>
                    )}
                  </>
                )}
              </aside>
            </div>
          )}

          {checkout && items.length > 0 && (
            <form onSubmit={submit} className="mt-12 max-w-2xl mx-auto space-y-4">
              <h2 className="font-display text-2xl font-bold text-primary text-center mb-2">Contato e entrega</h2>
              <input required className={inputClass} placeholder="Nome completo" value={form.nome} onChange={set("nome")} />
              <div className="grid gap-4 sm:grid-cols-2">
                <input required type="email" className={inputClass} placeholder="E-mail" value={form.email} onChange={set("email")} />
                <input required className={inputClass} placeholder="Telefone / WhatsApp" value={form.telefone} onChange={set("telefone")} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <input required className={inputClass} placeholder="CEP" value={form.cep} onChange={set("cep")} onBlur={buscarCep} />
                <input required className={`${inputClass} sm:col-span-2`} placeholder="Rua / Avenida" value={form.endereco} onChange={set("endereco")} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <input required className={inputClass} placeholder="Número" value={form.numero} onChange={set("numero")} />
                <input className={`${inputClass} sm:col-span-2`} placeholder="Complemento (opcional)" value={form.complemento} onChange={set("complemento")} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <input required className={inputClass} placeholder="Bairro" value={form.bairro} onChange={set("bairro")} />
                <input required className={inputClass} placeholder="Cidade" value={form.cidade} onChange={set("cidade")} />
                <input required maxLength={2} className={inputClass} placeholder="UF" value={form.uf} onChange={set("uf")} />
              </div>
              <textarea
                className="w-full px-5 py-3 rounded-3xl bg-input text-foreground placeholder:text-muted-foreground font-body text-base focus:outline-none focus:ring-2 focus:ring-ring/20"
                rows={3} placeholder="Observações (opcional)" value={form.observacoes} onChange={set("observacoes")}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-suina-red text-primary-foreground rounded-xl font-display font-bold disabled:opacity-50"
              >
                {submitting ? "ENVIANDO..." : "ENVIAR PEDIDO"}
              </button>
              <p className="font-body text-xs text-muted-foreground text-center">
                Depois do pedido, calculamos o frete e enviamos o valor total com o Pix para pagamento.
              </p>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Loja;
