import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import csv
import re

BASE = "https://www.institutosuina.org"
URL = BASE + "/editais"
HEADERS = {"User-Agent": "Mozilla/5.0"}

PALAVRAS = [
    "EDITAL",
    "CONTRATAÇÃO",
    "CHAMAMENTO",
    "PROCESSO SELETIVO",
    "TOMADA DE PREÇOS"
]

def slugify(txt):
    txt = txt.lower()
    # Replace accented chars
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'ã': 'a', 'õ': 'o', 'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u',
        'ç': 'c'
    }
    for char, replacement in replacements.items():
        txt = txt.replace(char, replacement)
    txt = re.sub(r'[^a-z0-9]+', '-', txt)
    return txt.strip("-")

def edital_valido(texto):
    t = texto.upper()
    return any(p in t for p in PALAVRAS)

print(f"Lendo página: {URL}")
r = requests.get(URL, headers=HEADERS, timeout=20)
soup = BeautifulSoup(r.text, "html.parser")

dados = []
vistos = set()

# Procura por todos os links
for a in soup.find_all("a", href=True):
    href = a["href"].strip()
    
    # Pula links que não parecem ser documentos (PDFs ou arquivos do Wix)
    if not (href.endswith(".pdf") or "ugd" in href):
        continue

    # Tenta pegar o texto do link primeiro
    titulo = a.get_text(" ", strip=True)
    
    # Se o link está vazio ou não tem as palavras-chave, busca no container pai
    if not titulo or not edital_valido(titulo):
        # Sobe até 3 níveis para encontrar um título próximo
        current = a
        for _ in range(3):
            parent = current.parent
            if not parent: break
            
            p_text = parent.get_text(" ", strip=True)
            # Remove o próprio texto do link se houver
            p_text = p_text.replace(titulo, "").strip()
            
            # Limpa textos muito longos ou com excesso de quebras de linha
            p_text = " ".join(p_text.split())
            
            if edital_valido(p_text):
                # Tenta extrair apenas a linha que contém o termo EDITAL
                linhas = [l.strip() for l in p_text.split("\n") if edital_valido(l)]
                if linhas:
                    titulo = linhas[0]
                else:
                    # Fallback para o texto limpo mas limitado a 100 caracteres
                    titulo = p_text[:100]
                break
            current = parent

    if edital_valido(titulo):
        # Limpeza final do título (pega apenas a primeira parte se houver muito lixo)
        titulo = titulo.split("  ")[0].strip()
        
        link = urljoin(BASE, href)
        chave = (titulo, link)
        if chave in vistos:
            continue
        vistos.add(chave)

        dados.append({
            "tipo": "edital",
            "titulo": titulo,
            "slug": slugify(titulo),
            "conteudo": titulo,
            "url": link
        })

output_file = "editais_supabase.csv"
with open(output_file, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=["tipo", "titulo", "slug", "conteudo", "url"]
    )
    writer.writeheader()
    writer.writerows(dados)

print(f"Sucesso! {len(dados)} editais exportados para {output_file}.")
