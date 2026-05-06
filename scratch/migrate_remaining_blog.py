import os
import re
from supabase import create_client

URL = "https://moephwizcfrdupquxpha.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
sb = create_client(URL, KEY)

BASE_DIR = r"C:\Users\User\.gemini\antigravity\brain\1d0ec4fe-52dd-4cca-af60-96b3d29d6315\.system_generated\steps"

MAPPING = [
    {"slug": "projeto-quatro-ribeiras-integrando-sociedade-e-natureza", "step": 222, "cover": "https://static.wixstatic.com/media/e2b488_00db44e0c5774983b5f61aa21bda63e3~mv2.jpg"},
    {"slug": "a-importância-das-áreas-verdes-para-a-manutenção-dos-serviços-ecossistêmicos", "step": 225, "cover": "https://static.wixstatic.com/media/e2b488_d49ee6a0f3074d5c8933dce818fea808~mv2.jpeg"},
    {"slug": "dia-da-educadora-o-ambiental", "step": 228, "cover": "https://static.wixstatic.com/media/e2b488_60bbf68a5b1549c785708f3dd9ec5378~mv2.jpg"},
    {"slug": "a-tal-da-biologia-da-conservação", "step": 231, "cover": "https://static.wixstatic.com/media/e2b488_69ef37a1a04d4cc8bb7fe8b1478f5a52~mv2.jpeg"},
    {"slug": "10-anos-de-suinã-celebrando-a-força-e-liderança-feminina-no-terceiro-setor", "step": 234, "cover": "https://static.wixstatic.com/media/e2b488_0f2b0633e9b44bfc971e71b816403fa2~mv2.png"},
    {"slug": "celebrando-o-dia-do-biólogo-atuação-na-educação-ambiental", "step": 237, "cover": "https://static.wixstatic.com/media/e2b488_7c04e94858dd43b3a0d58baf39d79c10~mv2.jpg"},
    {"slug": "o-papel-da-sensibilização-ambiental-no-ecoturismo-sustentável", "step": 240, "cover": "https://static.wixstatic.com/media/e2b488_59da15012d34420d9aa739457c01ae3b~mv2.jpg"},
    {"slug": "participação-social-na-restauração-florestal-uma-importante-contribuição", "step": 243, "cover": "https://static.wixstatic.com/media/e2b488_571367130faf4d658c136baf27f78afc~mv2.jpg"},
    {"slug": "a-importância-das-florestas-na-crise-climática", "step": 246, "cover": "https://static.wixstatic.com/media/e2b488_8e9da00ea91a4045b4803886f4f0f1a4~mv2.jpg"},
    {"slug": "a-democratização-da-ciência-e-a-conservação-da-biodiversidade-o-papel-transformador-da-educomunicaç", "step": 249, "cover": "https://static.wixstatic.com/media/e2b488_18c2496f8f7c429d95755f671642dc4a~mv2.png"},
    {"slug": "o-que-é-o-projeto-planos-da-mata", "step": 252, "cover": "https://static.wixstatic.com/media/e2b488_557bbf09722e48349613cb30bb2d4880~mv2.jpg"},
    {"slug": "como-você-se-sente-em-meio-a-natureza", "step": 255, "cover": "https://static.wixstatic.com/media/e2b488_4c2b06892e914ad3bc9fd1f32b8290df~mv2.jpeg"},
    {"slug": "políticas-públicas-ambientais-contribuições-necessárias-para-a-conservação-da-biodiversidade", "step": 258, "cover": "https://static.wixstatic.com/media/e2b488_b7fb17b649484fff9d816f58a3249566~mv2.jpg"},
    {"slug": "inventário-de-fauna-uma-prosa-rápida", "step": 261, "cover": "https://static.wixstatic.com/media/e2b488_b34ca1b16d944535b788c9a17ad37ec3~mv2.jpeg"}
]

def clean_slug(s):
    # Wix slugs often have accents and special chars
    s = s.lower()
    repl = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'ã': 'a', 'õ': 'o', 'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u',
        'ç': 'c', ' ': '-', 'ç': 'c'
    }
    for k, v in repl.items(): s = s.replace(k, v)
    s = re.sub(r'[^a-z0-9-]', '', s)
    return s

def parse_date(d_str):
    # Example: "22 de mar. de 2024"
    months = {
        "jan": "01", "fev": "02", "mar": "03", "abr": "04", "mai": "05", "jun": "06",
        "jul": "07", "ago": "08", "set": "09", "out": "10", "nov": "11", "dez": "12"
    }
    parts = d_str.split(" de ")
    if len(parts) == 3:
        day = parts[0].zfill(2)
        month_abbr = parts[1].replace(".", "").lower()
        month = months.get(month_abbr, "01")
        year = parts[2]
        return f"{year}-{month}-{day}"
    return "2025-01-01"

for item in MAPPING:
    path = os.path.join(BASE_DIR, str(item["step"]), "content.md")
    if not os.path.exists(path):
        print(f"Error: {path} not found")
        continue
    
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    title = lines[0].replace("Title: ", "").strip()
    
    # Find publication date
    pub_date_str = ""
    for line in lines:
        if " de " in line and " de 20" in line:
            pub_date_str = line.strip().lstrip("- ")
            break
            
    published_at = parse_date(pub_date_str)
    
    # Find start of content
    start_idx = 0
    for i, line in enumerate(lines):
        if "Atualizado: " in line:
            start_idx = i + 1
            break
            
    # Find end of content
    end_idx = len(lines)
    for i in range(start_idx, len(lines)):
        if line.startswith("[Ver tudo]") or line.startswith("Suinã Instituto Socioambiental"):
            end_idx = i
            break
            
    content_lines = lines[start_idx:end_idx]
    
    # Clean up content: remove navigation artifacts if any
    # Actually, read_url_content does a good job, but let's wrap in <p>
    content_html = ""
    for line in content_lines:
        line = line.strip()
        if not line: continue
        if line.startswith("Source:"): continue
        if line.startswith("---"): continue
        
        if line.startswith("#"):
            level = line.count("#")
            text = line.replace("#", "").strip()
            content_html += f"<h{level}>{text}</h{level}>\n"
        else:
            content_html += f"<p>{line}</p>\n"

    slug = clean_slug(item["slug"])
    
    print(f"Migrating: {title} ({published_at})")
    
    try:
        # Check if exists
        exists = sb.table("posts_blog").select("id").eq("slug", slug).execute()
        if exists.data:
            print(f"  Already exists. Skipping.")
            continue
            
        sb.table("posts_blog").insert({
            "title": title,
            "slug": slug,
            "content": content_html,
            "published_at": published_at,
            "status": "Publicado",
            "cover_image": item["cover"]
        }).execute()
        print(f"  Success!")
    except Exception as e:
        print(f"  Error: {e}")

print("\nMigration completed!")
