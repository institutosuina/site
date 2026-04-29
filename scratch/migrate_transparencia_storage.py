
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
BUCKET = "reports"

SITE_BASE = "https://www.institutosuina.org"
TRANSPARENCIA_URL = SITE_BASE + "/transparência"

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

DOWNLOAD_DIR = "downloads_transparencia"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==================================================
# UTILITÁRIOS
# ==================================================
def limpar_texto(txt):
    txt = re.sub(r'\s+', ' ', txt).strip()
    return txt

def slugify(texto):
    texto = texto.lower()
    texto = re.sub(r'[^a-z0-9]+', '-', texto)
    return texto.strip('-')[:100]

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
            supabase.storage.from_(BUCKET).upload(
                path=remote_name,
                file=f,
                file_options={"content-type": mime_type, "x-upsert": "true"}
            )
        return supabase.storage.from_(BUCKET).get_public_url(remote_name)
    except Exception as e:
        # Tenta pegar a URL pública caso já exista
        return supabase.storage.from_(BUCKET).get_public_url(remote_name)

# ==================================================
# BANCO DE DADOS
# ==================================================
def get_or_create_ano(ano_valor):
    r = supabase.table("informativo_anos").select("id").eq("ano", ano_valor).execute()
    if r.data:
        return r.data[0]["id"]
    
    r = supabase.table("informativo_anos").insert({"ano": ano_valor}).execute()
    return r.data[0]["id"]

def salvar_relatorio(titulo, url):
    supabase.table("relatorios").insert({
        "title": titulo,
        "file_url": url,
        "description": "Documento migrado do Wix"
    }).execute()

def salvar_informativo(titulo, url):
    # Tenta extrair MM/AAAA do título "Edição MM/AAAA"
    match = re.search(r'(\d{2})/(\d{4})', titulo)
    if match:
        mes, ano = match.groups()
        ano_id = get_or_create_ano(int(ano))
        supabase.table("informativos").insert({
            "ano_id": ano_id,
            "numero": mes,
            "title": f"Informativo {mes}/{ano}",
            "file_url": url
        }).execute()
    else:
        print(f"  Aviso: Não foi possível extrair data do informativo: {titulo}")

# ==================================================
# CORE
# ==================================================
def processar_transparencia():
    print("Iniciando migração de Transparência e Informativos...")
    
    # Limpar dados antigos para evitar duplicidade
    supabase.table("relatorios").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    supabase.table("informativos").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    supabase.table("informativo_anos").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

    html = requests.get(TRANSPARENCIA_URL, headers=HEADERS, timeout=30).text
    soup = BeautifulSoup(html, "html.parser")

    # Encontrar todos os containers que podem ter um link e um texto
    # No Wix, geralmente estão dentro de divs que são irmãos ou estão próximos
    all_links = soup.find_all("a", href=True)
    
    migrados = 0

    for a in all_links:
        href = a["href"].strip()
        if not href or not re.search(r'\.(pdf|doc|docx|xls|xlsx)$', href, re.I):
            continue

        # Tentar pegar o texto buscando no elemento irmão ou container próximo
        label = ""
        
        # 1. Tenta o texto direto no link
        label = a.get_text(" ", strip=True)
        
        # 2. Se não achou, procura no elemento de texto do Wix mais próximo
        if not label:
            # Sobe até o container comum e procura o texto lá dentro
            curr = a
            for _ in range(3):
                if not curr: break
                # Procura por spans de texto do Wix no mesmo container ou no próximo
                text_node = curr.find_next("span", class_="wixui-rich-text__text")
                if text_node:
                    # Verifica se o texto está perto o suficiente (não é de outra seção)
                    label = text_node.get_text(" ", strip=True)
                    if label and len(label) > 3: break
                curr = curr.parent

        label = limpar_texto(label)
        
        # Se o label for genérico (apenas "Informativos" ou "Relatórios"), tenta ser mais específico
        if label.lower() in ["informativos", "relatórios", "transparência", "clique aqui"]:
            # Tenta pegar o texto do elemento anterior ou próximo
            sibling = a.find_next("div", class_="wixui-rich-text")
            if sibling:
                label = sibling.get_text(" ", strip=True)

        if not label or len(label) < 3:
            import urllib.parse
            label = urllib.parse.unquote(href.split("/")[-1].split("?")[0])
            label = label.replace("-", " ").replace("_", " ").split(".")[0].title()

        print(f"Processando: {label}")
        
        # Nome único para o storage
        ext = os.path.splitext(href.split("?")[0])[1]
        remote_name = f"{slugify(label)}{ext}"
        
        # Baixar e Subir
        local_path = baixar_arquivo(href, remote_name)
        if not local_path: continue
        
        public_url = upload_storage(local_path, remote_name)
        
        # Categorizar e Salvar
        if "Edição" in label or re.search(r'\d{2}/\d{4}', label):
            salvar_informativo(label, public_url)
            print("  -> Salvo como Informativo")
        else:
            salvar_relatorio(label, public_url)
            print("  -> Salvo como Relatório de Transparência")
            
        migrados += 1
        time.sleep(0.5)

    print(f"\nConcluído! {migrados} documentos migrados.")

if __name__ == "__main__":
    processar_transparencia()
