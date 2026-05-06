import os, requests, re, mimetypes
from bs4 import BeautifulSoup
from supabase import create_client

URL = "https://moephwizcfrdupquxpha.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
sb = create_client(URL, KEY)
BUCKET = "covers"
DIR = "downloads_noticias_covers"
os.makedirs(DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def extract_youtube_id(url):
    match = re.search(r'(?:v=|youtu\.be/|/v/|/embed/|/live/)([^&?]+)', url)
    return match.group(1) if match else None

def get_og_image(url):
    try:
        if "youtu.be" in url or "youtube.com" in url:
            yt_id = extract_youtube_id(url)
            if yt_id:
                return f"https://img.youtube.com/vi/{yt_id}/maxresdefault.jpg"
                
        r = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(r.text, 'html.parser')
        og_img = soup.find('meta', property='og:image')
        if og_img and og_img.get('content'):
            return og_img['content']
            
        twitter_img = soup.find('meta', name='twitter:image')
        if twitter_img and twitter_img.get('content'):
            return twitter_img['content']
            
    except Exception as e:
        print(f"  Erro ao acessar {url}: {e}")
    return None

def baixar_e_subir(image_url, slug):
    try:
        r = requests.get(image_url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        
        # Determina a extensao
        ext = ".jpg"
        if "png" in image_url.lower(): ext = ".png"
        elif "jpeg" in image_url.lower(): ext = ".jpeg"
        
        filename = f"noticia_{slug}{ext}"
        local_path = os.path.join(DIR, filename)
        
        with open(local_path, "wb") as f:
            f.write(r.content)
            
        remote_path = f"noticias/{filename}"
        mime, _ = mimetypes.guess_type(remote_path)
        if not mime: mime = "image/jpeg"
        
        with open(local_path, "rb") as f:
            sb.storage.from_(BUCKET).upload(remote_path, f, {"content-type": mime, "x-upsert": "true"})
            
        return sb.storage.from_(BUCKET).get_public_url(remote_path)
    except Exception as e:
        print(f"  Erro no download/upload da img {image_url}: {e}")
        return None

def processar():
    noticias = sb.table("noticias").select("*").execute().data
    print(f"Processando {len(noticias)} notícias...")
    
    ok_count = 0
    for n in noticias:
        print(f"\\nNotícia: {n['title'][:50]}")
        
        # Se ja tiver imagem, pula
        if n.get("cover_image"):
            print("  Ja tem capa, pulando.")
            ok_count += 1
            continue
            
        # Extrai URL externa do HTML
        match = re.search(r'href="([^"]+)"', n["content"])
        if not match:
            print("  Sem link externo encontrado no conteudo.")
            continue
            
        external_url = match.group(1)
        print(f"  Buscando em: {external_url}")
        
        image_url = get_og_image(external_url)
        if not image_url:
            print("  Nenhuma imagem OG encontrada.")
            continue
            
        print(f"  Imagem encontrada: {image_url}")
        
        # Faz o download e upload
        public_url = baixar_e_subir(image_url, n["slug"])
        
        if public_url:
            sb.table("noticias").update({"cover_image": public_url}).eq("id", n["id"]).execute()
            print("  OK! Capa atualizada.")
            ok_count += 1
            
    print(f"\\nFinalizado! {ok_count}/{len(noticias)} noticias com capa.")

if __name__ == "__main__":
    processar()
