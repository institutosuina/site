from supabase import create_client

URL = "https://moephwizcfrdupquxpha.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
sb = create_client(URL, KEY)

COVERS = {
    "jovens-observadores-educacao-ambiental-como-caminho-para-o-pertencimento-e-o-turismo-sustentavel": "https://static.wixstatic.com/media/e2b488_72e0ece90a3e439ba0583271da1163e5~mv2.jpg",
    "dia-nacional-da-conservacao-do-solo-precisamos-olhar-para-a-terra-com-mais-carinho-e-ciencia": "https://static.wixstatic.com/media/e2b488_374a5d2ebad948539dccaf571af419fe~mv2.jpg"
}

for slug, url in COVERS.items():
    print(f"Atualizando capa para {slug}...")
    try:
        sb.table("posts_blog").update({"cover_image": url}).eq("slug", slug).execute()
        print("  OK!")
    except Exception as e:
        print(f"  Erro: {e}")

print("\nFinalizado!")
