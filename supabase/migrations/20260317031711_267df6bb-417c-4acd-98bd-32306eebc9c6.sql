
CREATE TABLE public.acessos_pagina (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_email text NOT NULL,
  page text NOT NULL DEFAULT 'prestacao-de-contas',
  access_time timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.acessos_pagina ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page access log" ON public.acessos_pagina FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can read page access logs" ON public.acessos_pagina FOR SELECT TO authenticated USING (true);
