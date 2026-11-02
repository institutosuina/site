import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/pix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

const db = supabase as any;
const s = { fontFamily: "'Inter', sans-serif" } as const;

type Status = "aguardando_frete" | "aguardando_pagamento" | "pago" | "enviado" | "cancelado";

interface Pedido {
  id: string;
  codigo: string;
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  observacoes: string | null;
  itens: { nome: string; preco: number; quantidade: number }[];
  subtotal: number;
  frete: number | null;
  status: Status;
  codigo_rastreio: string | null;
  created_at: string;
}

const statusLabel: Record<Status, string> = {
  aguardando_frete: "Aguardando frete",
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  enviado: "Enviado",
  cancelado: "Cancelado",
};

const AdminPedidos = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [frete, setFrete] = useState("");
  const [rastreio, setRastreio] = useState("");

  const { data: pedidos, isLoading } = useQuery({
    queryKey: ["admin-pedidos"],
    queryFn: async () => {
      const { data, error } = await db.from("pedidos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Pedido[];
    },
  });

  const update = useMutation({
    mutationFn: async (patch: Partial<Pedido>) => {
      const { error } = await db.from("pedidos").update(patch).eq("id", selected!.id);
      if (error) throw error;
      return patch;
    },
    onSuccess: (patch) => {
      queryClient.invalidateQueries({ queryKey: ["admin-pedidos"] });
      setSelected((p) => (p ? { ...p, ...patch } : p));
      toast({ title: "✅ Pedido atualizado." });
    },
    onError: (err: any) => toast({ title: "❌ Erro", description: err.message, variant: "destructive" }),
  });

  const open = (p: Pedido) => {
    setSelected(p);
    setFrete(p.frete != null ? String(p.frete) : "");
    setRastreio(p.codigo_rastreio ?? "");
  };

  const cancelar = async () => {
    if (!selected || !confirm("Cancelar o pedido e devolver os itens ao estoque?")) return;
    try {
      for (const item of selected.itens as any[]) {
        const { data } = await db.from("produtos").select("estoque").eq("id", item.produto_id).maybeSingle();
        if (data) await db.from("produtos").update({ estoque: data.estoque + item.quantidade }).eq("id", item.produto_id);
      }
      update.mutate({ status: "cancelado" });
    } catch (err: any) {
      toast({ title: "❌ Erro ao devolver estoque", description: err.message, variant: "destructive" });
    }
  };

  const link = selected ? `${window.location.origin}/loja/pedido/${selected.codigo}` : "";
  const whatsapp = selected
    ? `https://wa.me/55${selected.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Olá, ${selected.nome}! O frete do seu pedido ${selected.codigo} na Loja Suinã ficou em ${formatBRL(selected.frete ?? 0)} (total ${formatBRL(selected.subtotal + (selected.frete ?? 0))}). Para pagar via Pix, acesse: ${link}`,
      )}`
    : "";

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div>
        <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>Pedidos da Loja</h2>
        <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
          Calcule o frete, envie o link de pagamento Pix e acompanhe o envio
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !pedidos?.length ? (
          <p style={{ ...s, fontSize: "0.875rem" }} className="text-center text-zinc-400 py-16">Nenhum pedido ainda.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {pedidos.map((p) => (
              <button key={p.id} onClick={() => open(p)} className="w-full text-left flex items-center gap-4 px-6 py-4 hover:bg-zinc-50">
                <div className="flex-1 min-w-0">
                  <p style={{ ...s, fontSize: "0.9375rem" }} className="font-semibold text-zinc-800 truncate">{p.codigo} · {p.nome}</p>
                  <p style={{ ...s, fontSize: "0.75rem" }} className="text-zinc-500">
                    {new Date(p.created_at).toLocaleDateString("pt-BR")} · {p.cidade}/{p.uf} · {formatBRL(p.subtotal)}
                  </p>
                </div>
                <span style={{ ...s, fontSize: "0.75rem" }} className={`px-2 py-1 rounded-full ${p.status === "aguardando_frete" ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-700"}`}>
                  {statusLabel[p.status]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle style={{ ...s, fontSize: "1.125rem" }}>Pedido {selected.codigo}</DialogTitle>
                <DialogDescription style={{ ...s, fontSize: "0.8125rem" }}>{statusLabel[selected.status]}</DialogDescription>
              </DialogHeader>

              <div style={{ ...s, fontSize: "0.8125rem" }} className="space-y-4 text-zinc-700">
                <div>
                  <p className="font-semibold">Cliente</p>
                  <p>{selected.nome}</p>
                  <p>{selected.email} · {selected.telefone}</p>
                </div>
                <div>
                  <p className="font-semibold">Entrega</p>
                  <p>{selected.endereco}, {selected.numero}{selected.complemento ? ` - ${selected.complemento}` : ""}</p>
                  <p>{selected.bairro} · {selected.cidade}/{selected.uf} · CEP {selected.cep}</p>
                  {selected.observacoes && <p className="italic mt-1">"{selected.observacoes}"</p>}
                </div>
                <div>
                  <p className="font-semibold">Itens</p>
                  {selected.itens.map((i, idx) => (
                    <p key={idx}>{i.quantidade}× {i.nome} — {formatBRL(i.preco * i.quantidade)}</p>
                  ))}
                  <p className="mt-1">Subtotal: {formatBRL(selected.subtotal)}</p>
                </div>

                {selected.status !== "cancelado" && (
                  <div className="space-y-2 border-t pt-4">
                    <p className="font-semibold">Frete (R$)</p>
                    <div className="flex gap-2">
                      <Input className="!text-sm" inputMode="decimal" placeholder="0,00" value={frete} onChange={(e) => setFrete(e.target.value)} />
                      <Button
                        className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm shrink-0"
                        disabled={update.isPending || selected.status === "pago" || selected.status === "enviado"}
                        onClick={() => {
                          const v = Number(frete.replace(",", "."));
                          if (!(v >= 0)) return toast({ title: "Valor de frete inválido", variant: "destructive" });
                          update.mutate({ frete: v, status: "aguardando_pagamento" });
                        }}
                      >
                        Salvar frete
                      </Button>
                    </div>
                    {selected.frete != null && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <a href={whatsapp} target="_blank" rel="noreferrer" className="text-emerald-600 underline">Enviar por WhatsApp</a>
                        <button className="underline" onClick={() => { navigator.clipboard.writeText(link); toast({ title: "Link copiado" }); }}>Copiar link de pagamento</button>
                      </div>
                    )}
                  </div>
                )}

                {selected.status === "aguardando_pagamento" && (
                  <Button className="w-full !text-sm" variant="outline" onClick={() => update.mutate({ status: "pago" })}>Marcar como pago</Button>
                )}

                {selected.status === "pago" && (
                  <div className="space-y-2">
                    <p className="font-semibold">Código de rastreio</p>
                    <div className="flex gap-2">
                      <Input className="!text-sm" value={rastreio} onChange={(e) => setRastreio(e.target.value)} />
                      <Button className="!text-sm shrink-0" variant="outline" onClick={() => update.mutate({ status: "enviado", codigo_rastreio: rastreio.trim() || null })}>
                        Marcar enviado
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                {selected.status !== "cancelado" && selected.status !== "enviado" && (
                  <Button variant="destructive" className="!text-sm" onClick={cancelar}>Cancelar pedido</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPedidos;
