import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

# Cabeçalho para fingir ser um navegador real
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

SECOES = {
    "Noticias": "https://www.institutosuina.org/not%C3%ADcias",
    "Blog": "https://www.institutosuina.org/blog-1",
    "Editais": "https://www.institutosuina.org/editais",
    "Transparencia": "https://www.institutosuina.org/transpar%C3%AAncia"
}

def extrair_conteudo_completo(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        paragraphs = soup.find_all('p')
        texto = "\n".join([p.get_text() for p in paragraphs])
        return texto
    except:
        return "Erro ao extrair"

def scraper_suina():
    dados_totais = []
    for categoria, url in SECOES.items():
        print(f"Lendo: {categoria}...")
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            links = soup.find_all('a', href=True)
            
            for link in links:
                href = link['href']
                if '/post/' in href or '/noticia/' in href or href.endswith('.pdf'):
                    full_url = href if href.startswith('http') else f"https://www.institutosuina.org{href}"
                    titulo = link.get_text().strip() or "Post"
                    
                    conteudo = ""
                    if not full_url.endswith('.pdf'):
                        conteudo = extrair_conteudo_completo(full_url)
                    else:
                        conteudo = "PDF Link"

                    dados_totais.append({"Categoria": categoria, "Título": titulo, "URL": full_url, "Conteúdo": conteudo})
                    time.sleep(0.5)
        except Exception as e:
            print(f"Erro em {categoria}: {e}")

    if dados_totais:
        pd.DataFrame(dados_totais).to_excel("migracao_suina.xlsx", index=False)
        print("Sucesso! Arquivo 'migracao_suina.xlsx' criado.")

if __name__ == "__main__":
    scraper_suina()