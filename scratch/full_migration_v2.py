import requests
from bs4 import BeautifulSoup
from supabase import create_client
import re
import time
import json

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

def extract_full_content_v2(url):
    try:
        res = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(res.text, 'html.parser')
        article = soup.find('article')
        if not article: return None
        
        # Target the Ricos Content Viewer (Wix's editor)
        content_viewer = article.find('div', {'data-id': 'content-viewer'})
        if not content_viewer:
            content_viewer = article.find('section', {'data-hook': 'post-description'}) or article
            
        html_output = ""
        
        # Iterate through all interesting tags in order
        for elem in content_viewer.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'wow-image', 'blockquote', 'figure']):
            if elem.name in ['p', 'h1', 'h2', 'h3', 'h4', 'blockquote']:
                # Skip if nested inside another interesting tag to avoid duplicates
                if elem.find_parent(['p', 'h1', 'h2', 'h3', 'h4', 'blockquote']): continue
                
                text = elem.get_text().strip()
                if not text: continue
                
                # Check for bold text (strong or bold styles)
                if elem.find(['strong', 'b']) or 'font-weight:700' in str(elem):
                    html_output += f"<{elem.name}><strong>{text}</strong></{elem.name}>\n"
                else:
                    html_output += f"<{elem.name}>{text}</{elem.name}>\n"
                    
            elif elem.name in ['ul', 'ol']:
                items = "".join([f"<li>{li.get_text().strip()}</li>" for li in elem.find_all('li')])
                html_output += f"<{elem.name}>{items}</{elem.name}>\n"
                
            elif elem.name == 'wow-image' or elem.name == 'figure':
                # Extract image info from data-image-info attribute
                img_info = elem.get('data-image-info')
                if img_info:
                    try:
                        data = json.loads(img_info)
                        uri = data.get('imageData', {}).get('uri')
                        if uri:
                            full_url = f"https://static.wixstatic.com/media/{uri}"
                            html_output += f'<img src="{full_url}" style="width:100%; max-width:800px; margin:40px auto; border-radius:16px; display:block; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />\n'
                    except: pass
                else:
                    # Fallback to standard img tag
                    img = elem.find('img')
                    if img:
                        src = img.get('src')
                        if src and 'static.wixstatic.com' in src:
                            clean_src = src.split('/v1/')[0]
                            html_output += f'<img src="{clean_src}" style="width:100%; max-width:800px; margin:40px auto; border-radius:16px; display:block; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />\n'

        return html_output
    except Exception as e:
        print(f"Error extracting {url}: {e}")
        return None

for url in BLOG_URLS:
    slug = clean_slug(url)
    print(f"Processing: {slug}...")
    
    html = extract_full_content_v2(url)
    if not html:
        print(f"  Failed to extract content for {slug}")
        continue
        
    try:
        # Update database
        sb.table('posts_blog').update({'content': html}).eq('slug', slug).execute()
        print(f"  Updated successfully! (Length: {len(html)})")
    except Exception as e:
        print(f"  Database error for {slug}: {e}")
    
    time.sleep(0.5)

print("\nFull migration completed!")
