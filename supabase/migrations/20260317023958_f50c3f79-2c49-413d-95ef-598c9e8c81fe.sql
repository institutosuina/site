
CREATE TABLE public.listas_destinatarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emails text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.listas_destinatarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage recipient lists"
ON public.listas_destinatarios
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
