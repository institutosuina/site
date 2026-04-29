import pandas as pd
import uuid
import re
import os

def slugify(text):
    text = text.lower()
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u',
        'ã': 'a', 'õ': 'o', 'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u',
        'ç': 'c'
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text).strip('-')
    return text

def generate_sql():
    excel_path = 'migracao_suina.xlsx'
    if not os.path.exists(excel_path):
        print(f"Error: {excel_path} not found.")
        return

    df = pd.read_excel(excel_path)
    sql_statements = []
    used_slugs = set()

    for _, row in df.iterrows():
        categoria = str(row['Categoria'])
        titulo = str(row['Título']).strip()
        url = str(row['URL']).strip()
        conteudo = str(row['Conteúdo']).strip()
        
        if titulo == "Clique para ler o conteúdo na íntegra" or titulo == "Post" or not titulo:
            if "pdf" in url.lower():
                filename = url.split("/")[-1].split(".")[0]
                filename = re.sub(r'^[a-f0-9]{6,}_', '', filename)
                titulo = filename.replace("_", " ").replace("-", " ").title()
            else:
                titulo = f"{categoria} {uuid.uuid4().hex[:6]}"

        slug = slugify(titulo)
        if not slug or slug in used_slugs:
            slug = f"{slug}-{uuid.uuid4().hex[:5]}"
        used_slugs.add(slug)
        
        # Update URL to the new domain
        url = url.replace("https://www.institutosuina.org", "https://novo.institutosuina.org")
        
        if categoria == 'Blog':
            titulo_esc = titulo.replace("'", "''")
            conteudo_esc = conteudo.replace("'", "''")
            sql = f"INSERT INTO public.posts_blog (title, slug, content, status, published_at) VALUES ('{titulo_esc}', '{slug}', '{conteudo_esc}', 'Publicado', now());"
            sql_statements.append(sql)
        elif categoria == 'Noticias':
            titulo_esc = titulo.replace("'", "''")
            conteudo_esc = conteudo.replace("'", "''")
            sql = f"INSERT INTO public.noticias (title, slug, content, status, published_at) VALUES ('{titulo_esc}', '{slug}', '{conteudo_esc}', 'Publicado', now());"
            sql_statements.append(sql)
        elif categoria == 'Editais':
            if "pdf" in url.lower() and ("PDF Link" in conteudo or not conteudo):
                conteudo = f'<p><a href="{url}" target="_blank">Visualizar Edital (PDF)</a></p>'
            
            titulo_esc = titulo.replace("'", "''")
            conteudo_esc = conteudo.replace("'", "''")
            sql = f"INSERT INTO public.editais (title, slug, content, status, published_at) VALUES ('{titulo_esc}', '{slug}', '{conteudo_esc}', 'Publicado', now());"
            sql_statements.append(sql)
        elif categoria == 'Transparencia':
            titulo_esc = titulo.replace("'", "''")
            url_esc = url.replace("'", "''")
            sql = f"INSERT INTO public.relatorios (title, file_url, description) VALUES ('{titulo_esc}', '{url_esc}', 'Importado do site antigo');"
            sql_statements.append(sql)

    output_file = 'inserts_migracao.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- SQL Migration for Instituto Suína\n")
        f.write("-- Generated from migracao_suina.xlsx\n\n")
        f.write("\n".join(sql_statements))
    
    print(f"Success! Generated {len(sql_statements)} statements in {output_file}")

if __name__ == "__main__":
    generate_sql()
