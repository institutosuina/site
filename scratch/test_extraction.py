import requests
from bs4 import BeautifulSoup
import json

url = "https://www.institutosuina.org/post/projeto-quatro-ribeiras-integrando-sociedade-e-natureza"
res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(res.text, 'html.parser')

# Wix Blog posts often have the content in a <script> tag with JSON or directly in the HTML
# Let's try to find the article body
article = soup.find('article')
if article:
    print("Found <article>!")
    # Get all paragraphs and images
    content = ""
    for elem in article.descendants:
        if elem.name == 'p':
            content += f"<p>{elem.get_text()}</p>\n"
        elif elem.name == 'img':
            src = elem.get('src')
            if src:
                content += f'<img src="{src}" style="width:100%; max-width:800px; margin:20px 0; border-radius:12px;" />\n'
        elif elem.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            content += f"<{elem.name}>{elem.get_text()}</{elem.name}>\n"
            
    print(content[:500])
else:
    print("Article not found. Searching for JSON...")
    # Look for common Wix JSON patterns
    for script in soup.find_all('script'):
        if script.string and 'postPage' in script.string:
            print("Found script with postPage!")
            break
