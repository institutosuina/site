from supabase import create_client
import sys

# Change default encoding to utf-8 for print
sys.stdout.reconfigure(encoding='utf-8')

URL = 'https://moephwizcfrdupquxpha.supabase.co'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs'
sb = create_client(URL, KEY)
res = sb.table('noticias').select('title, content').limit(3).execute()
for r in res.data:
    print(f"TITLE: {r['title']}")
    print(f"CONTENT: {r['content']}")
    print("-" * 50)
