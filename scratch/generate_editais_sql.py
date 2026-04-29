import pandas as pd
import re

def slugify(text):
    text = str(text).lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def escape_sql(text):
    if text is None:
        return ""
    return str(text).replace("'", "''")

def generate_sql():
    # Carregar o CSV gerado pelo scraper
    df = pd.read_csv('editais_supabase.csv')
    
    sql_lines = []
    seen_slugs = {}
    
    for _, row in df.iterrows():
        titulo = escape_sql(row['titulo'])
        base_slug = row['slug'][:200] # Limitar tamanho do slug
        
        # Garantir slug único
        if base_slug not in seen_slugs:
            seen_slugs[base_slug] = 0
            slug = base_slug
        else:
            seen_slugs[base_slug] += 1
            slug = f"{base_slug}-{seen_slugs[base_slug]}"
        
        # Ajustar a URL para o novo domínio
        original_url = row['url']
        nova_url = original_url.replace("www.institutosuina.org", "novo.institutosuina.org")
        
        # Formatar o conteúdo como HTML
        conteudo_html = f"<p><a href='{nova_url}' target='_blank'>Visualizar Edital (PDF)</a></p>"
        conteudo_html_escaped = escape_sql(conteudo_html)
        
        sql = f"INSERT INTO public.editais (title, slug, content, status, published_at) VALUES ('{titulo}', '{slug}', '{conteudo_html_escaped}', 'Publicado', now());"
        sql_lines.append(sql)
    
    with open('inserts_editais_novos.sql', 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_lines))
    
    print(f"Sucesso! {len(sql_lines)} inserts gerados em inserts_editais_novos.sql")

if __name__ == "__main__":
    generate_sql()
