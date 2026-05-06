import os, requests, mimetypes, re
from supabase import create_client

URL = "https://moephwizcfrdupquxpha.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
sb = create_client(URL, KEY)
BUCKET = "covers"

def baixar_e_subir(wix_url):
    filename = wix_url.split("/")[-1]
    local_path = os.path.join("downloads_projetos", filename)
    try:
        r = requests.get(wix_url, timeout=60)
        if r.status_code == 200:
            with open(local_path, "wb") as f: f.write(r.content)
    except:
        return ""
        
    clean_name = filename.replace('~mv2', '')
    remote_path = f"projetos/{clean_name}"
    try:
        mime, _ = mimetypes.guess_type(remote_path)
        if not mime: mime = "image/jpeg"
        with open(local_path, "rb") as f:
            sb.storage.from_(BUCKET).upload(remote_path, f, {"content-type": mime, "x-upsert": "true"})
    except:
        pass
        
    return sb.storage.from_(BUCKET).get_public_url(remote_path)

# Download extra images for Dialogo Operacional
img2 = baixar_e_subir("https://static.wixstatic.com/media/e2b488_c750d952f4424dbaabcce5d3cd5e6c69~mv2.jpg")
img3 = baixar_e_subir("https://static.wixstatic.com/media/e2b488_7ce116c1e4484c2a81f4643b3aff50cf~mv2.png")

with open('src/data/nossoTrabalho.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Change string to array of strings
content = content.replace('image:', 'images:')
content = re.sub(r"images:\s*'([^']*)'", r"images: ['\1']", content)

# Fix specifically for Dialogo Operacional
search_text = "title: 'Diálogo Operacional', images: ['https://moephwizcfrdupquxpha.supabase.co/storage/v1/object/public/covers/projetos/e2b488_c899f275a4fe4d1a8cbf0a6e1262315e.jpg?']"
replace_text = f"title: 'Diálogo Operacional', images: ['https://moephwizcfrdupquxpha.supabase.co/storage/v1/object/public/covers/projetos/e2b488_c899f275a4fe4d1a8cbf0a6e1262315e.jpg', '{img2}', '{img3}']"

# We must also remove the '?' at the end of the URLs that python's get_public_url somehow added in the previous script?
# Wait, let's just strip '?' from all image urls
content = content.replace('.jpg?', '.jpg').replace('.png?', '.png').replace('.jpeg?', '.jpeg')

content = content.replace(search_text.replace('?', ''), replace_text)

with open('src/data/nossoTrabalho.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Images downloaded and TS file updated!")
