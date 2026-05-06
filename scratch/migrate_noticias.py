import re, unicodedata
from supabase import create_client

URL = "https://moephwizcfrdupquxpha.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
sb = create_client(URL, KEY)

def link(url): return f'<p><a href="{url}" target="_blank" rel="noopener noreferrer">▶ Acessar conteúdo na íntegra</a></p>'
def slug(t):
    t = unicodedata.normalize('NFD', t).encode('ascii','ignore').decode()
    return re.sub(r'[\s_]+','-',re.sub(r'[^a-z0-9\s-]','',t.lower())).strip('-')[:80]

NOTICIAS = [
  ("Educação Ambiental em pauta nas escolas de Jacareí","https://youtu.be/AmCEoizLxXI","2024-06-01"),
  ("Projeto Viver o Viveiro: uma aventura em meio a natureza | Quarta Show","https://www.youtube.com/watch?v=OyF6I5JQhbI","2024-05-01"),
  ("Reportagem Band Vale: Projeto Viver o Viveiro promove conexão com a natureza","https://www.youtube.com/live/62sf3Wf-sPw","2024-04-01"),
  ("Reportagem TH+ Notícias: Programa de Restauração Ecológica","https://www.youtube.com/watch?v=Fs-SizpzvjA","2024-03-01"),
  ("Junho EcoSustentável realiza palestra sobre compostagem doméstica no Viveiro de Mudas","https://www.mogidascruzes.sp.gov.br/noticia/junho-ecosustentavel-realiza-palestra-sobre-compostagem-domestica-no-viveiro-de-mudas","2024-06-26"),
  ("Podcast: Café com Will recebe a Bióloga Fernanda Scalambrino","https://www.youtube.com/watch?v=xMGJPJfMDFo","2024-02-01"),
  ("Reportagem TV Câmera Jacareí: Programa de Restauração Ecológica","https://www.youtube.com/watch?v=2fXa5ITOv-8","2023-12-01"),
  ("Reportagem TV Câmera Jacareí: Programa Jovens Observadores","https://www.youtube.com/watch?v=KcYHY0r5l0o","2023-11-01"),
  ("Conferência debate transformação ecológica e elege representante para etapa estadual","https://diariodejacarei.com.br/cidade/conferencia-debate-transformacao-ecologica-e-elege-representante-para-etapa-estadual","2023-10-01"),
  ("Passeio guiado permite observar aves no Jardim Botânico de Santos","https://www.santos.sp.gov.br/?q=noticia/passeio-guiado-permite-observar-aves-no-jardim-botanico-de-santos","2023-09-01"),
  ("Núcleo de Educação Ambiental de Jacareí divulga Guia com as trilhas ambientais do Viveiro Municipal","https://www.jacarei.sp.gov.br/nucleo-de-educacao-ambiental-de-jacarei-divulga-guia-com-as-trilhas-ambientais-do-viveiro-municipal/","2023-08-01"),
  ("Integrantes do PET Ecologia visitaram o Instituto Suinã","https://www.esalq.usp.br/banco-de-noticias/integrantes-do-pet-ecologia-visitaram-o-instituto-suin%C3%A3","2023-07-01"),
  ("Encontro no Parque Municipal debate ações conjuntas para unidades de conservação da Serra do Itapeti","https://www.mogidascruzes.sp.gov.br/noticia/encontro-no-parque-municipal-debate-acoes-conjuntas-para-unidades-de-conservacao-da-serra-do-itapeti","2023-06-01"),
  ("Viveiro Municipal de Jacareí tem portas abertas todos os domingos com programação especial","https://www.jacarei.sp.gov.br/viveiro-municipal-de-jacarei-tem-portas-abertas-todos-os-domingos-com-programacao-especial/","2023-05-15"),
  ("Viver o Viveiro! Público aprova abertura do Viveiro Municipal aos domingos em Jacareí","https://www.jacarei.sp.gov.br/viver-o-viveiro-publico-aprova-abertura-do-viveiro-municipal-aos-domingos-em-jacarei/","2023-05-01"),
  ("Viveiro Municipal de Jacareí passa a abrir todo domingo","https://www.jacarei.sp.gov.br/viveiro-municipal-de-jacarei-passa-a-abrir-todo-domingo/","2023-04-20"),
  ("NJ | Plano Municipal de Conservação e Recuperação da Mata Atlântica","https://www.youtube.com/watch?v=IocJ3ciSc8M","2023-04-01"),
  ("Jacareí aprova plano para recuperar Mata Atlântica","https://globoplay.globo.com/v/11771224/","2023-03-20"),
  ("Plano Municipal da Mata Atlântica de Jacareí é tema de audiência","https://diariodejacarei.com.br/cidade/plano-municipal-da-mata-atlantica-e-tema-de-audiencia-nesta-terca-20-em-jacarei","2023-03-18"),
  ("NJ | Conselho do Meio Ambiente aprova Plano Municipal da Mata Atlântica","https://www.youtube.com/watch?v=jVHncdgKBkU","2023-02-01"),
  ("NJ | Programa Renascentes - Jacareí","https://www.youtube.com/watch?v=XdfsWu57M7Y","2023-01-01"),
  ("Projeto de restauração ecológica é deliberado em Jacareí","https://www.meon.com.br/noticias/rmvale/projeto-de-restauracao-ecologica-e-deliberado-em-jacarei","2022-12-01"),
  ("Instituto Suinã participa da Oficina Final do Projeto Planos da Mata","https://pmma.etc.br/instituto-suina-participa-da-oficina-final-do-projeto-planos-da-mata/","2022-11-01"),
  ("Municípios de São Paulo aprovam planos para proteção e uso sustentável da Mata Atlântica","https://www.suzano.com.br/municipios-de-sao-paulo-aprovam-planos-para-protecao-e-uso-sustentavel-da-mata-atlantica/","2022-10-01"),
  ("Suzano apoia exposição fotográfica Pandemina em Jacareí","https://www.portalr3.com.br/2023/03/suzano-apoia-exposicao-fotografica-pandemina-em-jacarei/","2023-03-05"),
  ("Reunião aberta ao público apresenta Plano Municipal da Mata Atlântica","https://www.nossajacarei.com.br/2023/03/reuniao-aberta-ao-publico-apresenta-plano-municipal-da-mata-atlantica/","2023-03-10"),
  ("Jacareí recebe exposição que retrata trabalho de mulheres na pandemia","https://diariodejacarei.com.br/cidade/jacarei-recebe-exposicao-que-retrata-trabalho-de-mulheres-na-pandemia","2023-03-01"),
  ("Secretaria de Meio Ambiente de Jacareí valida Plano Municipal da Mata Atlântica","https://www.jacarei.sp.gov.br/secretaria-de-meio-ambiente-e-zeladoria-urbana-de-jacarei-valida-plano-municipal-da-mata-atlantica-junto-ao-conselho-do-meio-ambiente/","2023-01-15"),
  ("Cidades do Vale do Paraíba começam 2023 em fase de implementação de restauração florestal","https://conservadordamantiqueira.org/cidades-do-vale-do-paraiba-comecam-2023-em-fase-de-implementacao-de-acoes-de-restauracao-florestal","2023-01-10"),
  ("Instituto Suinã realiza oficinas prévias de apresentação do Plano Municipal da Mata Atlântica","https://onovo.com.br/meio-ambiente/instituto-suina-realiza-oficinas-previas-de-apresentacao","2022-09-01"),
  ("Conheça as organizações dos grupos de trabalho do Planos da Mata Atlântica","https://www.sosma.org.br/noticias/conheca-as-organizacoes-que-irao-compor-os-grupos-de-trabalho-do-planos-da-mata-atlantica-pmma/","2022-08-01"),
  ("Condemat participa de APL para fortalecer cadeia produtiva do mel na região","https://www.diariodesuzano.com.br/regiao/condemat-participa-de-apl-para-fortalecer-cadeia-produtiva-do-mel-na/61691/","2022-07-01"),
  ("Junho Ambiental tem balanço positivo com parcerias firmadas e boa participação do público","https://www.mogidascruzes.sp.gov.br/noticia/junho-ambiental-tem-balanco-positivo-com-parcerias-firmadas-e-boa-participacao-do-publico","2022-06-30"),
  ("Guararema cria 1ª Unidade de Conservação Ambiental para preservar o Bicudinho","https://oidiario.com.br/unidade-conservacao-bicudinho-guararema/","2019-12-01"),
]

print(f"Migrando {len(NOTICIAS)} notícias...")
sb.table("noticias").delete().like("slug", "%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-%-").execute()
# Limpa tudo
try:
    all_ids = [r['id'] for r in sb.table("noticias").select("id").execute().data]
    for i in all_ids:
        sb.table("noticias").delete().eq("id", i).execute()
    print(f"  {len(all_ids)} registros antigos removidos.")
except: pass

ok = 0
for title, url, date in NOTICIAS:
    try:
        sb.table("noticias").insert({
            "title": title,
            "slug": slug(title),
            "content": link(url),
            "published_at": date,
            "status": "Publicado",
        }).execute()
        print(f"  OK: {title[:55]}")
        ok += 1
    except Exception as e:
        print(f"  ERRO: {title[:40]} | {e}")

print(f"\nTotal: {ok}/{len(NOTICIAS)} migradas.")
