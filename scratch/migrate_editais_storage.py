
import os
import re
import time
import mimetypes
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from supabase import create_client

# ==================================================
# CONFIGURAÇÃO
# ==================================================
SUPABASE_URL = "https://moephwizcfrdupquxpha.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
BUCKET = "editais"

SITE_BASE = "https://www.institutosuina.org"
EDITAIS_URL = SITE_BASE + "/editais"

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==================================================
# UTILITÁRIOS
# ==================================================
def slugify(texto):
    texto = texto.lower()
    texto = re.sub(r'[^a-z0-9]+', '-', texto)
    return texto.strip('-')[:200]

def limpar_texto(txt):
    txt = re.sub(r'\s+', ' ', txt).strip()
    return txt

def baixar_arquivo(url, nome):
    path = os.path.join(DOWNLOAD_DIR, nome)
    try:
        r = requests.get(url, headers=HEADERS, timeout=60)
        r.raise_for_status()
        with open(path, "wb") as f:
            f.write(r.content)
        return path
    except Exception as e:
        print(f"      Erro ao baixar {url}: {e}")
        return None

def upload_storage(local_path, remote_name):
    try:
        mime_type, _ = mimetypes.guess_type(remote_name)
        if not mime_type: mime_type = "application/octet-stream"

        with open(local_path, "rb") as f:
            # Tenta fazer o upload
            supabase.storage.from_(BUCKET).upload(
                path=remote_name,
                file=f,
                file_options={"content-type": mime_type, "x-upsert": "true"}
            )
        return supabase.storage.from_(BUCKET).get_public_url(remote_name)
    except Exception as e:
        print(f"      Erro no upload para o Storage: {e}")
        # Tenta pegar a URL mesmo assim, vai que o arquivo já está lá
        try:
            return supabase.storage.from_(BUCKET).get_public_url(remote_name)
        except:
            return None

def limpar_banco():
    print("Limpando dados antigos...")
    # Deletar todos os editais (cascade apaga anexos)
    supabase.table("editais").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

# ==================================================
# PROCESSAMENTO
# ==================================================
def processar_migracao_agrupada():
    print("Iniciando migracao inteligente de Editais...")
    limpar_banco()

    html = requests.get(EDITAIS_URL, headers=HEADERS, timeout=30).text
    soup = BeautifulSoup(html, "html.parser")

    # No Wix, cada edital costuma estar em uma <section> ou container similar
    # Vamos buscar blocos que contenham "EDITAL DE CONTRATACAO"
    sections = soup.find_all("section")
    
    editais_encontrados = 0

    for sec in sections:
        texto_full = limpar_texto(sec.get_text(" ", strip=True))
        
        # Identificar se é um bloco de edital
        if "EDITAL DE CONTRATAÇÃO" not in texto_full.upper():
            continue

        # 1. Extrair Título (Geralmente a primeira parte até o OBJETO ou quebra de linha)
        # Exemplo: EDITAL DE CONTRATAÇÃO Nº 03/2025
        match_titulo = re.search(r'(EDITAL DE CONTRATAÇÃO Nº? [\d/]+)', texto_full, re.I)
        titulo = match_titulo.group(1) if match_titulo else "Edital sem Titulo"
        
        # 2. Extrair Objeto/Descrição
        objeto = ""
        if "OBJETO:" in texto_full.upper():
            objeto = texto_full.split("OBJETO:")[1].split("Atualizado em:")[0].strip()
            objeto = "OBJETO: " + objeto
        
        # 3. Data de Publicação/Atualização
        data_match = re.search(r'(\d{2})/(\d{2})/(\d{4})', texto_full)
        data_iso = None
        if data_match:
            d, m, y = data_match.groups()
            data_iso = f"{y}-{m}-{d}"

        slug = slugify(titulo)
        
        print(f"Processando: {titulo}")
        
        # Criar Edital
        res = supabase.table("editais").insert({
            "title": titulo,
            "slug": slug,
            "content": objeto,
            "status": "Publicado",
            "published_at": data_iso if data_iso else "now()"
        }).execute()
        
        if not res.data: continue
        edital_id = res.data[0]["id"]

        # 4. Coletar todos os links dentro desta seção
        links = sec.find_all("a", href=True)
        for a in links:
            href = a["href"].strip()
            if not href or not re.search(r'\.(pdf|doc|docx|xls|xlsx|zip)$', href, re.I):
                continue

            # Tentar pegar o texto buscando no elemento pai (container do Wix)
            label = ""
            
            # 1. Tenta achar o texto no próprio link ou filhos
            label = a.get_text(" ", strip=True)
            
            # 2. Se não achou, procura no "mesh-container" ou container pai
            if not label:
                parent = a.parent
                while parent and parent.name != "section":
                    # Procura por elementos de texto do Wix no mesmo container
                    text_elem = parent.find("span", class_="wixui-rich-text__text")
                    if text_elem:
                        label = text_elem.get_text(" ", strip=True)
                        break
                    parent = parent.parent

            label = limpar_texto(label)
            
            # 3. Se ainda não tiver label, usa o fallback de nome de arquivo
            if not label or len(label) < 2:
                import urllib.parse
                filename_part = urllib.parse.unquote(href.split("/")[-1].split("?")[0])
                if "_" in filename_part:
                    filename_part = filename_part.split("_")[-1]
                label = filename_part.replace("-", " ").replace("_", " ")
                label = re.sub(r'\.[a-z0-9]+$', '', label, flags=re.I).strip().title()

            if not label or len(label) < 3: label = "Documento"

            print(f"  Anexo: {label}")
            
            # Baixar e subir
            nome_arquivo = f"{slug}-{slugify(label[:50])}.pdf"
            caminho_local = baixar_arquivo(href, nome_arquivo)
            
            if caminho_local:
                url_publica = upload_storage(caminho_local, nome_arquivo)
                
                # Salvar na tabela de anexos
                supabase.table("edital_anexos").insert({
                    "edital_id": edital_id,
                    "title": label,
                    "file_url": url_publica
                }).execute()
                print(f"    Enviado!")

        editais_encontrados += 1
        time.sleep(1)

    print(f"\nFim! {editais_encontrados} editais migrados com anexos agrupados.")

if __name__ == "__main__":
    processar_migracao_agrupada()
