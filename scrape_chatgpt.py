import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import csv
import re

BASE = "https://www.institutosuina.org"
HEADERS = {"User-Agent": "Mozilla/5.0"}
dados = []

def slugify(txt):
    txt = txt.lower()
    txt = re.sub(r'[^a-z0-9]+', '-', txt)
    return txt.strip('-')

def pegar(url):
    r = requests.get(url, headers=HEADERS, timeout=15)
    return BeautifulSoup(r.text, "html.parser")

def add(tipo, titulo, conteudo, url):
    if titulo.strip():
        dados.append({
            "tipo": tipo,
            "titulo": titulo.strip(),
            "slug": slugify(titulo),
            "conteudo": conteudo.strip(),
            "url": url
        })

# Exemplo editais
print("Iniciando extração de Editais...")
soup = pegar(BASE + "/editais")
for h in soup.find_all(["h1","h2","h3","a"]):
    txt = h.get_text(" ", strip=True)
    if len(txt) > 5:
        add("edital", txt, txt, BASE + "/editais")

# Exporta CSV
output_file = "posts_supabase.csv"
with open(output_file, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=["tipo","titulo","slug","conteudo","url"]
    )
    writer.writeheader()
    writer.writerows(dados)

print(f"CSV gerado com sucesso: {output_file}")
