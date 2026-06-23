CREATE TABLE public.contatos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  mensagem text NOT NULL,
  lido boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form" ON public.contatos
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can manage contact submissions" ON public.contatos
FOR ALL TO authenticated USING (true) WITH CHECK (true);
