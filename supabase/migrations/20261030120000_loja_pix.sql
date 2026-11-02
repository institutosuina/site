-- Loja virtual (pagamento somente via Pix, frete calculado manualmente)

CREATE TABLE public.produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text NOT NULL DEFAULT '',
  preco numeric(10,2) NOT NULL CHECK (preco >= 0),
  estoque integer NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  imagem_url text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active produtos" ON public.produtos
  FOR SELECT TO anon, authenticated USING (ativo = true);

CREATE POLICY "Authenticated users can manage produtos" ON public.produtos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- status: aguardando_frete -> aguardando_pagamento -> pago -> enviado | cancelado
CREATE TABLE public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nome text NOT NULL,
  email text NOT NULL,
  telefone text NOT NULL,
  cep text NOT NULL,
  endereco text NOT NULL,
  numero text NOT NULL,
  complemento text,
  bairro text NOT NULL,
  cidade text NOT NULL,
  uf text NOT NULL,
  observacoes text,
  itens jsonb NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  frete numeric(10,2),
  status text NOT NULL DEFAULT 'aguardando_frete'
    CHECK (status IN ('aguardando_frete','aguardando_pagamento','pago','enviado','cancelado')),
  codigo_rastreio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Pedidos só são criados via criar_pedido() e lidos pelo cliente via pedido_publico().
CREATE POLICY "Authenticated users can manage pedidos" ON public.pedidos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Cria o pedido validando preço e estoque no servidor e baixando o estoque.
-- p_itens: [{ "produto_id": "...", "quantidade": 2 }]
CREATE OR REPLACE FUNCTION public.criar_pedido(p_cliente jsonb, p_itens jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_prod public.produtos%ROWTYPE;
  v_qtd integer;
  v_itens jsonb := '[]'::jsonb;
  v_subtotal numeric(10,2) := 0;
  v_codigo text;
BEGIN
  IF jsonb_typeof(p_itens) <> 'array' OR jsonb_array_length(p_itens) = 0 THEN
    RAISE EXCEPTION 'Carrinho vazio';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens) LOOP
    v_qtd := (v_item->>'quantidade')::integer;
    IF v_qtd IS NULL OR v_qtd < 1 THEN
      RAISE EXCEPTION 'Quantidade inválida';
    END IF;

    SELECT * INTO v_prod FROM public.produtos
      WHERE id = (v_item->>'produto_id')::uuid AND ativo = true FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produto indisponível';
    END IF;
    IF v_prod.estoque < v_qtd THEN
      RAISE EXCEPTION 'Estoque insuficiente para %', v_prod.nome;
    END IF;

    UPDATE public.produtos SET estoque = estoque - v_qtd WHERE id = v_prod.id;

    v_itens := v_itens || jsonb_build_object(
      'produto_id', v_prod.id, 'nome', v_prod.nome,
      'preco', v_prod.preco, 'quantidade', v_qtd);
    v_subtotal := v_subtotal + v_prod.preco * v_qtd;
  END LOOP;

  v_codigo := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO public.pedidos (
    codigo, nome, email, telefone, cep, endereco, numero, complemento,
    bairro, cidade, uf, observacoes, itens, subtotal
  ) VALUES (
    v_codigo,
    left(trim(p_cliente->>'nome'), 200), left(trim(p_cliente->>'email'), 200),
    left(trim(p_cliente->>'telefone'), 50), left(trim(p_cliente->>'cep'), 20),
    left(trim(p_cliente->>'endereco'), 300), left(trim(p_cliente->>'numero'), 30),
    left(trim(p_cliente->>'complemento'), 200), left(trim(p_cliente->>'bairro'), 200),
    left(trim(p_cliente->>'cidade'), 200), left(trim(p_cliente->>'uf'), 2),
    left(trim(p_cliente->>'observacoes'), 1000), v_itens, v_subtotal
  );

  RETURN v_codigo;
END;
$$;

-- Consulta pública do pedido pelo código (sem expor dados pessoais).
CREATE OR REPLACE FUNCTION public.pedido_publico(p_codigo text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'codigo', codigo, 'status', status, 'itens', itens,
    'subtotal', subtotal, 'frete', frete, 'codigo_rastreio', codigo_rastreio)
  FROM public.pedidos WHERE codigo = upper(p_codigo);
$$;

GRANT EXECUTE ON FUNCTION public.criar_pedido(jsonb, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pedido_publico(text) TO anon, authenticated;
