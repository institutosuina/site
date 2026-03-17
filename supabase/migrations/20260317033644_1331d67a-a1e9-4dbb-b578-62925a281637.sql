
CREATE TABLE public.edital_anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edital_id uuid NOT NULL REFERENCES public.editais(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.edital_anexos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read edital anexos" ON public.edital_anexos
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can manage edital anexos" ON public.edital_anexos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Bucket for edital attachment files
INSERT INTO storage.buckets (id, name, public) VALUES ('editais', 'editais', true);

CREATE POLICY "Public read editais files" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'editais');

CREATE POLICY "Auth upload editais files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'editais');

CREATE POLICY "Auth delete editais files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'editais');
