import requests
import json
import re

url = "https://www.institutosuina.org/post/projeto-quatro-ribeiras-integrando-sociedade-e-natureza"
res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
text = res.text

# Find all JSON-like structures in script tags
patterns = [
    r'id="wix-warmup-data">(\{.*?\})</script>',
    r'id="BLOG_POST_DATA">(\{.*?\})</script>',
    r'window\.__INITIAL_STATE__\s*=\s*(\{.*?\});'
]

for p in patterns:
    match = re.search(p, text, re.DOTALL)
    if match:
        print(f"Found match for pattern: {p[:30]}...")
        data = json.loads(match.group(1))
        # Save to file for inspection
        with open("scratch/wix_data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print("Saved to scratch/wix_data.json")
        break
else:
    print("No JSON pattern found.")
