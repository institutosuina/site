from supabase import create_client

URL = 'https://moephwizcfrdupquxpha.supabase.co'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs'
sb = create_client(URL, KEY)

tables = [
    'posts_blog', 
    'noticias', 
    'editais', 
    'material_tecnico', 
    'projetos', 
    'relatorios', 
    'parceiros', 
    'informativo_anos'
]

print("--- SUPABASE DATABASE AUDIT ---")
for t in tables:
    try:
        res = sb.table(t).select('id', count='exact').execute()
        print(f"Table '{t}': {res.count} records")
    except Exception as e:
        print(f"Table '{t}': Error - {e}")
