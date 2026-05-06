import os, re, time, mimetypes, requests, unicodedata
from supabase import create_client

URL = "https://moephwizcfrdupquxpha.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
BUCKET = "reports"
DIR = "downloads_material_tecnico"
os.makedirs(DIR, exist_ok=True)
sb = create_client(URL, KEY)
HEADERS = {"User-Agent": "Mozilla/5.0"}

def slugify(t):
    t = unicodedata.normalize('NFD', t).encode('ascii','ignore').decode()
    return re.sub(r'[\s_]+','-',re.sub(r'[^a-z0-9\s-]','',t.lower())).strip('-')[:80]

def baixar(url, nome):
    path = os.path.join(DIR, nome)
    try:
        r = requests.get(url, headers=HEADERS, timeout=60)
        r.raise_for_status()
        with open(path, "wb") as f: f.write(r.content)
        return path
    except Exception as e:
        print(f"    Erro download: {e}")
        return None

def upload(path, remote):
    try:
        mime, _ = mimetypes.guess_type(remote)
        if not mime: mime = "application/pdf"
        with open(path, "rb") as f:
            sb.storage.from_(BUCKET).upload(remote, f, {"content-type": mime, "x-upsert": "true"})
    except: pass
    return sb.storage.from_(BUCKET).get_public_url(remote)

# Estrutura: grupos com seus respectivos anexos
# Cada grupo vira 1 registro em material_tecnico
# Cada PDF vira 1 registro em material_tecnico_anexos
GRUPOS = [
    {
        "title": "Arvores Raras na Paisagem",
        "description": "Materiais educativos sobre especies de arvores raras presentes na paisagem do Vale do Paraiba.",
        "anexos": [
            ("Cartilha Arvores Raras na Paisagem", "https://www.institutosuina.org/_files/ugd/e2b488_e33c0c0c389a46b281dae6dce4b4f9e4.pdf"),
            ("Folder Arvores Raras na Paisagem", "https://www.institutosuina.org/_files/ugd/e2b488_fe7103245da6420290d0ffcf0f5ed2b5.pdf"),
        ]
    },
    {
        "title": "Plano de Manejo - Refugio de Vida Silvestre do Bicudinho",
        "description": "Documentos do Plano de Manejo da UC Refugio de Vida Silvestre do Bicudinho em Guararema/SP.",
        "anexos": [
            ("Informativo: Refugio de Vida Silvestre do Bicudinho", "https://www.institutosuina.org/_files/ugd/e2b488_bdab5f6c9bf0459e9e69f26e5f198c36.pdf"),
            ("Informativo: Fauna Ameacada", "https://www.institutosuina.org/_files/ugd/e2b488_40e68c7aee284fb097c5e467e9d22139.pdf"),
            ("Plano de Trabalho", "https://www.institutosuina.org/_files/ugd/e2b488_86fc8384aa1c4a79849d944353ea9368.pdf"),
            ("Relatorio da Oficina de Diagnostico", "https://www.institutosuina.org/_files/ugd/e2b488_65b739cecf0341d6b8db292e5bd7a047.pdf"),
            ("Relatorio da Oficina de Zoneamento", "https://www.institutosuina.org/_files/ugd/e2b488_5bb09367ff9c4d4999de39c7ed6c63e0.pdf"),
            ("Relatorio da Oficina de Programas de Gestao", "https://www.institutosuina.org/_files/ugd/e2b488_178e4aa9515848f8bf1ea41f867a37b0.pdf"),
            ("Dados Secundarios de Especies de Fauna e Flora", "https://www.institutosuina.org/_files/ugd/e2b488_e54c78e8cdd74009affc9475d7041197.pdf"),
            ("Atas do CONDEMA", "https://www.institutosuina.org/_files/ugd/e2b488_e962ff63e12746d7b7a98f370c359287.pdf"),
            ("Plano de Manejo - Documento Final", "https://www.institutosuina.org/_files/ugd/e2b488_fbb51d7cc2a54ab68c7ff7019f78b8dd.pdf"),
        ]
    },
    {
        "title": "Guia das Trilhas Interpretativas - Viveiro Municipal",
        "description": "Guia das Trilhas Interpretativas Ambientais do Viveiro Municipal Seo Moura em Jacarei/SP.",
        "anexos": [
            ("Guia das Trilhas Interpretativas Ambientais", "https://www.institutosuina.org/_files/ugd/e2b488_bc1749580e7342a099232e00727e91c7.pdf"),
        ]
    },
    {
        "title": "Planos Municipais da Mata Atlantica (PMMA)",
        "description": "Planos Municipais da Mata Atlantica desenvolvidos em parceria com municipios da regiao.",
        "anexos": [
            ("PMMA: Guararema/SP", "https://www.institutosuina.org/_files/ugd/e2b488_aeccd3e583014f8a8f6d5461091d6c62.pdf"),
            ("PMMA: Jacarei/SP", "https://www.institutosuina.org/_files/ugd/e2b488_8e708a58f9394115b64d6f6f29f92b95.pdf"),
            ("PMMA: Santa Branca/SP", "https://www.institutosuina.org/_files/ugd/e2b488_962932cb62324eaa8c87bad804fdb820.pdf"),
            ("PMMA: Salesopolis/SP", "https://www.institutosuina.org/_files/ugd/e2b488_05f79ce303cb47bca0d4084b8981124e.pdf"),
        ]
    },
    {
        "title": "Relatorio de Fauna Silvestre - RVS do Bicudinho",
        "description": "Relatorio de Levantamento Preliminar da Fauna Silvestre do Refugio de Vida Silvestre do Bicudinho.",
        "anexos": [
            ("Relatorio Levantamento Preliminar da Fauna Silvestre", "https://www.institutosuina.org/_files/ugd/e2b488_c5af6590f3844f319e64fda4c1638d7a.pdf"),
        ]
    },
]

# Limpa dados antigos
print("Limpando registros antigos...")
try:
    ids = [r['id'] for r in sb.table("material_tecnico").select("id").execute().data]
    for i in ids:
        sb.table("material_tecnico_anexos").delete().eq("material_id", i).execute()
        sb.table("material_tecnico").delete().eq("id", i).execute()
    print(f"  {len(ids)} grupos e seus anexos removidos.")
except Exception as e:
    print(f"  Erro ao limpar: {e}")

total_ok = 0
for grupo in GRUPOS:
    print(f"\nGrupo: {grupo['title']}")
    sl = slugify(grupo['title'])
    try:
        r = sb.table("material_tecnico").insert({
            "title": grupo['title'],
            "slug": sl,
            "content": grupo['description'],
            "status": "Publicado",
            "published_at": "2024-01-01",
        }).execute()
        mat_id = r.data[0]['id']
        print(f"  Grupo criado: {mat_id}")
    except Exception as e:
        print(f"  ERRO ao criar grupo: {e}")
        continue

    for idx, (titulo, wix_url) in enumerate(grupo['anexos']):
        print(f"    [{idx+1}] {titulo[:50]}")
        fname = f"material/{slugify(titulo)}.pdf"
        local = baixar(wix_url, f"{slugify(titulo)}.pdf")
        if not local:
            print("      Pulando (erro download)")
            continue
        pub_url = upload(local, fname)
        try:
            sb.table("material_tecnico_anexos").insert({
                "material_id": mat_id,
                "title": titulo,
                "file_url": pub_url,
                "sort_order": idx,
            }).execute()
            print(f"      OK")
            total_ok += 1
        except Exception as e:
            print(f"      ERRO ao salvar anexo: {e}")
        time.sleep(0.2)

print(f"\nConcluido! {total_ok} arquivos migrados em {len(GRUPOS)} grupos.")
