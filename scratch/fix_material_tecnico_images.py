import os, fitz, mimetypes
from supabase import create_client

URL = "https://moephwizcfrdupquxpha.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
sb = create_client(URL, KEY)
BUCKET = "covers"

MAPPING = {
    "arvores-raras-na-paisagem": "cartilha-arvores-raras-na-paisagem.pdf",
    "plano-de-manejo---refugio-de-vida-silvestre-do-bicudinho": "plano-de-manejo---documento-final.pdf",
    "guia-das-trilhas-interpretativas---viveiro-municipal": "guia-das-trilhas-interpretativas-ambientais.pdf",
    "planos-municipais-da-mata-atlantica-pmma": "pmma-jacareisp.pdf",
    "relatorio-de-fauna-silvestre---rvs-do-bicudinho": "relatorio-levantamento-preliminar-da-fauna-silvestre.pdf"
}

def pdf_to_image(pdf_filename, slug):
    pdf_path = os.path.join("downloads_material_tecnico", pdf_filename)
    if not os.path.exists(pdf_path):
        print(f"  PDF não encontrado: {pdf_path}")
        return None
        
    img_filename = f"material_{slug}.jpg"
    img_path = os.path.join("downloads_material_tecnico", img_filename)
    
    try:
        doc = fitz.open(pdf_path)
        page = doc.load_page(0)
        pix = page.get_pixmap(dpi=150)
        pix.save(img_path)
        doc.close()
        return img_path
    except Exception as e:
        print(f"  Erro ao gerar imagem de {pdf_filename}: {e}")
        return None

def processar():
    grupos = sb.table("material_tecnico").select("*").execute().data
    print(f"Processando {len(grupos)} grupos de Material Técnico...")
    
    for g in grupos:
        slug = g["slug"]
        print(f"\\nGrupo: {g['title']}")
        
        pdf_filename = MAPPING.get(slug)
        if not pdf_filename:
            print(f"  Sem mapeamento para slug {slug}.")
            continue
            
        print(f"  Gerando capa a partir de {pdf_filename}...")
        img_path = pdf_to_image(pdf_filename, slug)
        
        if not img_path: continue
        
        remote_path = f"material/{os.path.basename(img_path)}"
        try:
            with open(img_path, "rb") as f:
                sb.storage.from_(BUCKET).upload(remote_path, f, {"content-type": "image/jpeg", "x-upsert": "true"})
                
            public_url = sb.storage.from_(BUCKET).get_public_url(remote_path)
            
            sb.table("material_tecnico").update({"cover_image": public_url}).eq("id", g["id"]).execute()
            print("  OK! Capa atualizada com sucesso.")
        except Exception as e:
            print(f"  Erro no upload/update: {e}")

if __name__ == "__main__":
    processar()
