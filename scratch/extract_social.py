import urllib.request
import re

url = 'https://www.institutosuina.org'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    links = set(re.findall(r'href="(https?://[^"]*institutosuina[^"]*)"', html, re.IGNORECASE))
    
    # Also look for social platform names
    socials = set(re.findall(r'href="(https?://(?:www\.)?(?:instagram|facebook|linkedin|youtube|wa\.me)[^"]*)"', html, re.IGNORECASE))
    
    print("Suina Links found:")
    for link in links:
        print(link)
        
    print("\nSocial Links found:")
    for link in socials:
        print(link)
except Exception as e:
    print(f"Error: {e}")
