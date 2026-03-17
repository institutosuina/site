
CREATE TABLE public.material_tecnico_anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.material_tecnico(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.material_tecnico_anexos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage material_tecnico_anexos"
  ON public.material_tecnico_anexos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Public can read material_tecnico_anexos"
  ON public.material_tecnico_anexos FOR SELECT TO anon, authenticated
  USING (true);
