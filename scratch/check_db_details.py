from supabase import create_client

URL = 'https://moephwizcfrdupquxpha.supabase.co'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs'
sb = create_client(URL, KEY)

def check_table(t):
    try:
        res = sb.table(t).select('*').execute()
        data = res.data
        if not data:
            print(f"{t}: No records")
            return
            
        print(f"\n--- {t.upper()} ({len(data)} records) ---")
        empty_content = sum(1 for d in data if not d.get('content'))
        empty_cover = sum(1 for d in data if not d.get('cover_image'))
        print(f"Empty content: {empty_content}")
        print(f"Empty cover image: {empty_cover}")
        
        # sample content
        sample = data[0]
        print("Sample columns:", list(sample.keys()))
        if sample.get('content'):
            print("Sample content length:", len(sample.get('content')))
    except Exception as e:
        print(f"{t}: Error - {e}")

check_table('noticias')
check_table('editais')
check_table('material_tecnico')
check_table('parceiros')
