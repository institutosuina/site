-- 1. Create parceiros table
CREATE TABLE public.parceiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for parceiros
CREATE POLICY "Public can read parceiros" 
  ON public.parceiros FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Authenticated users can manage parceiros" 
  ON public.parceiros FOR ALL 
  TO authenticated 
  USING (true) WITH CHECK (true);

-- 4. Create trigger for updated_at
CREATE TRIGGER update_parceiros_updated_at 
  BEFORE UPDATE ON public.parceiros 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Create storage bucket for partners
INSERT INTO storage.buckets (id, name, public) 
  VALUES ('parceiros', 'parceiros', true);

-- 6. Storage policies for partner logos
CREATE POLICY "Public read partner logos" 
  ON storage.objects FOR SELECT 
  TO anon, authenticated 
  USING (bucket_id = 'parceiros');

CREATE POLICY "Authenticated upload partner logos" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'parceiros');

CREATE POLICY "Authenticated update partner logos" 
  ON storage.objects FOR UPDATE 
  TO authenticated 
  USING (bucket_id = 'parceiros');

CREATE POLICY "Authenticated delete partner logos" 
  ON storage.objects FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'parceiros');
