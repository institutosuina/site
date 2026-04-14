CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

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
CREATE POLICY "auth_manage_blog" ON public.posts_blog FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_blog" ON public.posts_blog FOR SELECT TO anon USING (status = 'Publicado');
CREATE TRIGGER update_posts_blog_updated_at BEFORE UPDATE ON public.posts_blog FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
CREATE POLICY "auth_manage_noticias" ON public.noticias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_noticias" ON public.noticias FOR SELECT TO anon USING (status = 'Publicado');
CREATE TRIGGER update_noticias_updated_at BEFORE UPDATE ON public.noticias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
CREATE POLICY "auth_manage_material" ON public.material_tecnico FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_material" ON public.material_tecnico FOR SELECT TO anon USING (status = 'Publicado');
CREATE TRIGGER update_material_tecnico_updated_at BEFORE UPDATE ON public.material_tecnico FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
CREATE POLICY "auth_manage_editais" ON public.editais FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_editais" ON public.editais FOR SELECT TO anon USING (status = 'Publicado');
CREATE TRIGGER update_editais_updated_at BEFORE UPDATE ON public.editais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.relatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_manage_relatorios" ON public.relatorios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_relatorios" ON public.relatorios FOR SELECT TO anon USING (true);

CREATE TABLE public.acessos_relatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  report_id UUID NOT NULL REFERENCES public.relatorios(id) ON DELETE CASCADE,
  access_time TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.acessos_relatorios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_access" ON public.acessos_relatorios FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "auth_read_access" ON public.acessos_relatorios FOR SELECT TO authenticated USING (true);

CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_subscribe" ON public.subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "auth_manage_subscribers" ON public.subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.emails_enviados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.emails_enviados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_manage_emails" ON public.emails_enviados FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.listas_destinatarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emails text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.listas_destinatarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_manage_listas" ON public.listas_destinatarios FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.projetos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  period text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_projetos" ON public.projetos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_manage_projetos" ON public.projetos FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.relatorios ADD COLUMN project_id uuid REFERENCES public.projetos(id) ON DELETE CASCADE;

CREATE TABLE public.acessos_pagina (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_email text NOT NULL,
  page text NOT NULL DEFAULT 'prestacao-de-contas',
  access_time timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.acessos_pagina ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_page_access" ON public.acessos_pagina FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "auth_read_page_access" ON public.acessos_pagina FOR SELECT TO authenticated USING (true);

CREATE TABLE public.edital_anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edital_id uuid NOT NULL REFERENCES public.editais(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.edital_anexos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_edital_anexos" ON public.edital_anexos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_manage_edital_anexos" ON public.edital_anexos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.informativo_anos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano integer NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.informativo_anos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_info_anos" ON public.informativo_anos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_manage_info_anos" ON public.informativo_anos FOR ALL TO authenticated USING (true) WITH CHECK (true);

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
CREATE POLICY "public_read_informativos" ON public.informativos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_manage_informativos" ON public.informativos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.material_tecnico_anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.material_tecnico(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.material_tecnico_anexos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_manage_mat_anexos" ON public.material_tecnico_anexos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_read_mat_anexos" ON public.material_tecnico_anexos FOR SELECT TO anon, authenticated USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('editais', 'editais', true);

CREATE POLICY "auth_upload_covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'covers');
CREATE POLICY "public_view_covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "auth_delete_covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'covers');
CREATE POLICY "auth_upload_reports" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reports');
CREATE POLICY "public_view_reports" ON storage.objects FOR SELECT USING (bucket_id = 'reports');
CREATE POLICY "auth_delete_reports" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'reports');
CREATE POLICY "public_read_editais_files" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'editais');
CREATE POLICY "auth_upload_editais_files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'editais');
CREATE POLICY "auth_delete_editais_files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'editais');
