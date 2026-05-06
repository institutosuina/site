import requests
from bs4 import BeautifulSoup
from supabase import create_client
import re
import time

URL = "https://moephwizcfrdupquxpha.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
sb = create_client(URL, KEY)

BLOG_URLS = [
    "https://www.institutosuina.org/post/projeto-quatro-ribeiras-integrando-sociedade-e-natureza",
    "https://www.institutosuina.org/post/a-importância-das-áreas-verdes-para-a-manutenção-dos-serviços-ecossistêmicos",
    "https://www.institutosuina.org/post/dia-da-educadora-o-ambiental",
    "https://www.institutosuina.org/post/a-tal-da-biologia-da-conservação",
    "https://www.institutosuina.org/post/10-anos-de-suinã-celebrando-a-força-e-liderança-feminina-no-terceiro-setor",
    "https://www.institutosuina.org/post/celebrando-o-dia-do-biólogo-atuação-na-educação-ambiental",
    "https://www.institutosuina.org/post/o-papel-da-sensibilização-ambiental-no-ecoturismo-sustentável",
    "https://www.institutosuina.org/post/participação-social-na-restauração-florestal-uma-importante-contribuição",
    "https://www.institutosuina.org/post/a-importância-das-florestas-na-crise-climática",
    "https://www.institutosuina.org/post/a-democratização-da-ciência-e-a-conservação-da-biodiversidade-o-papel-transformador-da-educomunicaç",
    "https://www.institutosuina.org/post/o-que-é-o-projeto-planos-da-mata",
    "https://www.institutosuina.org/post/como-você-se-sente-em-meio-a-natureza",
    "https://www.institutosuina.org/post/políticas-públicas-ambientais-contribuições-necessárias-para-a-conservação-da-biodiversidade",
    "https://www.institutosuina.org/post/inventário-de-fauna-uma-prosa-rápida",
    "https://www.institutosuina.org/post/avistando-2025-o-que-aprendemos-com-a-campanha-de-financiamento-coletivo-e-os-desafios-da-captação",
    "https://www.institutosuina.org/post/jovens-observadores-educação-ambiental-como-caminho-para-o-pertencimento-e-o-turismo-sustentável",
    "https://www.institutosuina.org/post/dia-nacional-da-conservação-do-solo-precisamos-olhar-para-a-terra-com-mais-carinho-e-ciência",
    "https://www.institutosuina.org/post/floresta-e-água-a-restauração-ecológica-como-caminho-para-a-segurança-hídrica",
    "https://www.institutosuina.org/post/a-força-da-reflexão-estratégica-o-novo-caminho-do-suinã-após-o-btg-soma-meio-ambiente",
    "https://www.institutosuina.org/post/avistando-2025-aprendemos-campanha-financiamento-coletivo"
]

def clean_slug(url):
    s = url.split("/post/")[-1].lower()
    repl = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ã': 'a', 'õ': 'o', 'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u', 'ç': 'c', ' ': '-'}
    for k, v in repl.items(): s = s.replace(k, v)
    s = re.sub(r'[^a-z0-9-]', '', s)
    return s

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

def extract_full_content(url):
    try:
        res = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(res.text, 'html.parser')
        article = soup.find('article')
        if not article: return None
        
        # We want to extract content in a clean way
        # Wix uses a complex structure, let's target the main content divs if possible
        # Usually, it's inside something with data-testid="post-content" or similar
        content_area = article.find('div', {'data-testid': 'post-content'}) or article
        
        html_output = ""
        # Instead of just descendants, let's look at the direct structural elements to preserve order
        for child in content_area.descendants:
            if child.name == 'p' and child.parent == content_area:
                text = child.get_text().strip()
                if text: html_output += f"<p>{text}</p>\n"
            elif child.name in ['h1', 'h2', 'h3', 'h4'] and child.parent == content_area:
                html_output += f"<{child.name}>{child.get_text().strip()}</{child.name}>\n"
            elif child.name == 'img':
                src = child.get('src')
                if src and 'static.wixstatic.com' in src:
                    # Clean wix URL (remove the fill part)
                    clean_src = src.split('/v1/')[0]
                    html_output += f'<img src="{clean_src}" style="width:100%; max-width:800px; margin:30px 0; border-radius:12px; display:block;" />\n'
            elif child.name == 'ul' and child.parent == content_area:
                items = "".join([f"<li>{li.get_text().strip()}</li>" for li in child.find_all('li')])
                html_output += f"<ul>{items}</ul>\n"

        # If html_output is empty, fallback to a more aggressive approach
        if not html_output:
            for p in article.find_all(['p', 'h1', 'h2', 'h3', 'img']):
                if p.name == 'img':
                    src = p.get('src')
                    if src: html_output += f'<img src="{src}" style="width:100%; max-width:800px; margin:30px 0; border-radius:12px;" />\n'
                else:
                    text = p.get_text().strip()
                    if text:
                        tag = p.name if p.name != 'img' else 'p'
                        html_output += f"<{tag}>{text}</{tag}>\n"
        
        return html_output
    except Exception as e:
        print(f"Error extracting {url}: {e}")
        return None

for url in BLOG_URLS:
    slug = clean_slug(url)
    print(f"Processing: {slug}...")
    
    html = extract_full_content(url)
    if not html:
        print(f"  Failed to extract content for {slug}")
        continue
        
    try:
        # Update database
        sb.table('posts_blog').update({'content': html}).eq('slug', slug).execute()
        print(f"  Updated successfully! (Length: {len(html)})")
    except Exception as e:
        print(f"  Database error for {slug}: {e}")
    
    time.sleep(1)

print("\nFull migration completed!")
