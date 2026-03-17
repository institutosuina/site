
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1. posts_blog
CREATE TABLE public.posts_blog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT,
  content TEXT,
  published_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Rascunho',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts_blog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage blog posts" ON public.posts_blog FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read published blog posts" ON public.posts_blog FOR SELECT TO anon USING (status = 'Publicado');
CREATE TRIGGER update_posts_blog_updated_at BEFORE UPDATE ON public.posts_blog FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. noticias
CREATE TABLE public.noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT,
  content TEXT,
  published_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Rascunho',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage noticias" ON public.noticias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read published noticias" ON public.noticias FOR SELECT TO anon USING (status = 'Publicado');
CREATE TRIGGER update_noticias_updated_at BEFORE UPDATE ON public.noticias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. material_tecnico
CREATE TABLE public.material_tecnico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT,
  content TEXT,
  published_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Rascunho',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.material_tecnico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage material_tecnico" ON public.material_tecnico FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read published material_tecnico" ON public.material_tecnico FOR SELECT TO anon USING (status = 'Publicado');
CREATE TRIGGER update_material_tecnico_updated_at BEFORE UPDATE ON public.material_tecnico FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. editais
CREATE TABLE public.editais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image TEXT,
  content TEXT,
  published_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Rascunho',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.editais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage editais" ON public.editais FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read published editais" ON public.editais FOR SELECT TO anon USING (status = 'Publicado');
CREATE TRIGGER update_editais_updated_at BEFORE UPDATE ON public.editais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. relatorios
CREATE TABLE public.relatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage relatorios" ON public.relatorios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can read relatorios" ON public.relatorios FOR SELECT TO anon USING (true);

-- 6. acessos_relatorios
CREATE TABLE public.acessos_relatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  report_id UUID NOT NULL REFERENCES public.relatorios(id) ON DELETE CASCADE,
  access_time TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.acessos_relatorios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert access log" ON public.acessos_relatorios FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can read access logs" ON public.acessos_relatorios FOR SELECT TO authenticated USING (true);

-- 7. subscribers
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can manage subscribers" ON public.subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. emails_enviados
CREATE TABLE public.emails_enviados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.emails_enviados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage sent emails" ON public.emails_enviados FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', true);

CREATE POLICY "Authenticated users can upload covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers');
CREATE POLICY "Anyone can view covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Authenticated users can delete covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can upload reports" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reports');
CREATE POLICY "Anyone can view reports" ON storage.objects FOR SELECT USING (bucket_id = 'reports');
CREATE POLICY "Authenticated users can delete reports" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'reports');
