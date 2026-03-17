
-- Table for informativo years
CREATE TABLE public.informativo_anos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano integer NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.informativo_anos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read informativo_anos" ON public.informativo_anos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can manage informativo_anos" ON public.informativo_anos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Table for individual informativos within a year
CREATE TABLE public.informativos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano_id uuid REFERENCES public.informativo_anos(id) ON DELETE CASCADE NOT NULL,
  numero integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  file_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.informativos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read informativos" ON public.informativos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can manage informativos" ON public.informativos FOR ALL TO authenticated USING (true) WITH CHECK (true);
