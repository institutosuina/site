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
    txt = re.sub(r'[^a-z0-9]+', '-', txt)
    return txt.strip("-")

def edital_valido(texto):
    t = texto.upper()
    return any(p in t for p in PALAVRAS)

r = requests.get(URL, headers=HEADERS, timeout=20)
soup = BeautifulSoup(r.text, "html.parser")

dados = []
vistos = set()

for a in soup.find_all("a", href=True):
    titulo = a.get_text(" ", strip=True)
    href = a["href"].strip()

    if not titulo:
        continue

    if edital_valido(titulo):
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

with open("editais_supabase.csv", "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=["tipo", "titulo", "slug", "conteudo", "url"]
    )
    writer.writeheader()
    writer.writerows(dados)

print(f"{len(dados)} editais exportados com sucesso.")
