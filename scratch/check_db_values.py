from supabase import create_client

URL = 'https://moephwizcfrdupquxpha.supabase.co'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs'
sb = create_client(URL, KEY)

res = sb.table('relatorios').select('*').execute()
for r in res.data:
    title = r['title']
    print(f"Title: {repr(title)}, toLowerCase: {repr(title.lower())}, includes relat: {'relat' in title.lower()}")
