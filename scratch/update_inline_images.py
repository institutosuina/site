from supabase import create_client

URL = "https://moephwizcfrdupquxpha.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
sb = create_client(URL, KEY)

slug = 'inventario-de-fauna-uma-prosa-rapida'
post = sb.table('posts_blog').select('content').eq('slug', slug).single().execute()
content = post.data['content']

content = content.replace('<p>Imagem 1: Procura ativa de anuros noturnos</p>', 
    '<p><img src="https://static.wixstatic.com/media/e2b488_b34ca1b16d944535b788c9a17ad37ec3~mv2.jpeg" alt="Procura ativa de anuros noturnos" style="width:100%; max-width:800px; border-radius:12px; margin:20px 0;" /></p><p><em>Imagem 1: Procura ativa de anuros noturnos</em></p>')

content = content.replace('<p>Imagem 2: Instalação de parcela de areia</p>', 
    '<p><img src="https://static.wixstatic.com/media/e2b488_0ca9b9f83bfa4839bdb4c61733f44653~mv2.jpeg" alt="Instalação de parcela de areia" style="width:100%; max-width:800px; border-radius:12px; margin:20px 0;" /></p><p><em>Imagem 2: Instalação de parcela de areia</em></p>')

sb.table('posts_blog').update({'content': content}).eq('slug', slug).execute()
print('Post atualizado com imagens inline!')
