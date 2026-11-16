-- Página própria por produto (/loja/<slug>) e galeria de subfotos.
ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS imagens text[] NOT NULL DEFAULT '{}';

-- Slug dos produtos que já existem: nome sem acento/símbolos + 4 primeiros chars do id.
UPDATE public.produtos
   SET slug = trim(both '-' from regexp_replace(
                lower(translate(nome,
                  'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
                  'aaaaaeeeeiiiiooooouuuucnaaaaaeeeeiiiiooooouuuucn')),
                '[^a-z0-9]+', '-', 'g')) || '-' || left(id::text, 4)
 WHERE slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS produtos_slug_key ON public.produtos (slug);
