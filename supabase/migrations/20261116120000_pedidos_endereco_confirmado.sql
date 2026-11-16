-- Confirmação manual do endereço antes de calcular o frete (não há cálculo automático).
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS endereco_confirmado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS endereco_confirmado_em timestamptz;

-- O frete salvo pela equipe é rascunho: só aparece pro cliente (junto com o Pix)
-- depois que a equipe o confirma e o pedido passa para 'aguardando_pagamento'.
CREATE OR REPLACE FUNCTION public.pedido_publico(p_codigo text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'codigo', codigo, 'status', status, 'itens', itens,
    'subtotal', subtotal,
    'frete', CASE WHEN status = 'aguardando_frete' THEN NULL ELSE frete END,
    'codigo_rastreio', codigo_rastreio)
  FROM public.pedidos WHERE codigo = upper(p_codigo);
$$;

GRANT EXECUTE ON FUNCTION public.pedido_publico(text) TO anon, authenticated;
