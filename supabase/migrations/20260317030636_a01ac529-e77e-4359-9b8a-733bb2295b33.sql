
-- Create projetos table
CREATE TABLE public.projetos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  period text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read projetos" ON public.projetos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can manage projetos" ON public.projetos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add project_id to relatorios (nullable for backwards compat)
ALTER TABLE public.relatorios ADD COLUMN project_id uuid REFERENCES public.projetos(id) ON DELETE CASCADE;
