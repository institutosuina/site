import re, unicodedata
from supabase import create_client

URL = "https://moephwizcfrdupquxpha.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
sb = create_client(URL, KEY)

def slug(t):
    t = unicodedata.normalize('NFD', t).encode('ascii','ignore').decode()
    return re.sub(r'[\s_]+','-',re.sub(r'[^a-z0-9\s-]','',t.lower())).strip('-')[:80]

POSTS = [
  {
    "title": "Floresta e água: a restauração ecológica como caminho para a segurança hídrica",
    "slug": "floresta-e-agua-restauracao-ecologica-seguranca-hidrica",
    "author": "Jhennifer Machado & Alessandra Souza",
    "published_at": "2026-03-30",
    "reading_time": 3,
    "content": """<p>A relação entre floresta e água é um dos pilares fundamentais para a manutenção dos serviços ecossistêmicos e da qualidade de vida nos territórios. A cobertura vegetal nativa exerce papel estratégico na regulação do ciclo hidrológico, favorecendo a infiltração da água no solo, a proteção de nascentes e a redução de processos erosivos. Em contrapartida, a degradação ambiental compromete diretamente a disponibilidade hídrica, impactando tanto os ecossistemas quanto as atividades produtivas.</p>
<p>Diante desse cenário, a restauração ecológica emerge como uma solução essencial e urgente, especialmente em áreas rurais, onde a água é um recurso indispensável para a produção e para a sustentabilidade das propriedades.</p>
<h2>Relato de quem vivencia a restauração</h2>
<p>O produtor rural Gerson Alvarenga compartilha sua percepção sobre o processo de restauração ecológica:</p>
<blockquote><p>"No meu caso, foi bastante oportuno, porque o produtor rural costuma ser penalizado e quase nunca tem recursos disponíveis para realizar um procedimento desse tipo. A participação do poder público é indispensável, por si só você não consegue e não há motivação para isso."</p></blockquote>
<p>Além dos aspectos econômicos, Gerson destaca a dimensão coletiva da água e a percepção das mudanças no território:</p>
<blockquote><p>"Eu entendo assim, a água é de vital importância e não se resume, não se restringe ao meu interesse pessoal. Há a necessidade de restauração sim, pois a gente tem percebido a redução drástica no volume de água disponível. Sou bastante adepto à restauração."</p></blockquote>
<h2>Caminhos para avançar</h2>
<p>A restauração ecológica, quando articulada a políticas públicas eficazes, assistência técnica e engajamento local, tem potencial para gerar impactos positivos em múltiplas dimensões: ambiental, social e econômica. Iniciativas que promovem a recuperação de áreas degradadas, especialmente em regiões estratégicas para a produção de água, contribuem diretamente para a segurança hídrica e para a sustentabilidade dos territórios rurais.</p>
<p>Mais do que uma escolha, trata-se de um compromisso coletivo com o presente e o futuro. Afinal, onde há floresta, há água, e onde há água, há possibilidade de vida.</p>
<p><strong>Autora:</strong> Jhennifer Machado é estudante de Publicidade e Propaganda e técnica de comunicação do Instituto Suinã.</p>
<p><strong>Co-autora:</strong> Alessandra Souza, Bióloga, mestranda e apaixonada por todas as formas de vida.</p>"""
  },
  {
    "title": "A Força da Reflexão Estratégica: O novo caminho do Suinã após o BTG Soma Meio Ambiente",
    "slug": "forca-reflexao-estrategica-novo-caminho-suina-btg-soma",
    "author": "Giuliana do Vale Milani",
    "published_at": "2025-11-25",
    "reading_time": 3,
    "content": """<p>Ao longo de seis meses intensos em 2025, o Instituto Suinã integrou a 12ª edição do BTG Soma Meio Ambiente, programa de aceleração realizado pelo BTG Pactual em parceria com a AGO Social. Ser uma das 12 organizações selecionadas foi, sem dúvida, um reconhecimento do trabalho que desenvolvemos no território.</p>
<p>Para quem não conhece, o BTG Soma Meio Ambiente é uma importante iniciativa de aceleração dedicada a fortalecer organizações que atuam na conservação da biodiversidade brasileira. Nossa equipe mergulhou em um programa intensivo, estruturado em três pilares:</p>
<ol>
<li>Aulas semanais com a rede AGO Social (focadas em Liderança, Gestão e Sustentabilidade Financeira);</li>
<li>Mentoria individualizada com voluntários do BTG Pactual para diagnóstico de desafios;</li>
<li>Desafios de aplicação prática com avaliação de bancas de especialistas.</li>
</ol>
<h2>Criação da Teoria da Mudança do Suinã</h2>
<p>O programa proporcionou exatamente o que mais faltava: tempo dedicado, estrutura metodológica e especialistas capacitados para nos ajudar a recalcular a rota. Esse processo incluiu, sobretudo, a construção da Teoria da Mudança Institucional (TdM): o mapa que liga nossas ações ao impacto que desejamos gerar.</p>
<h2>De Metas e Indicadores: A Prova da Maturidade</h2>
<p>O esforço e a dedicação de toda a equipe do Instituto Suinã nos permitiram alcançar resultados expressivos. Com grande satisfação, celebramos a realização de 30 metas definidas em nosso Plano de Desenvolvimento Institucional (PDI).</p>
<p>Além das conquistas operacionais, tivemos conquistas profundamente estratégicas:</p>
<ol>
<li>Revisão participativa do Planejamento Estratégico;</li>
<li>Mapeamento e Criação de Indicadores Institucionais;</li>
<li>Capital para Impulso: R$10 mil em recursos para impulsionar a nova estratégia.</li>
</ol>
<h2>Um Novo Ciclo: Intencionalidade e Robustez</h2>
<p>Participar do BTG Soma justamente no ano em que celebramos 11 anos de atuação nos trouxe uma certeza: crescer de forma sustentável exige coragem para parar, refletir e ajustar os caminhos. Estamos mais preparados para medir nosso impacto, comunicar nossos resultados e tomar decisões com base em evidências.</p>
<p><strong>Autora:</strong> Giuliana do Vale Milani.</p>"""
  },
  {
    "title": "Avistando 2025: o que aprendemos com a campanha de financiamento coletivo",
    "slug": "avistando-2025-aprendemos-campanha-financiamento-coletivo",
    "author": "Lorrane Coelho",
    "published_at": "2025-10-03",
    "reading_time": 4,
    "content": """<p>A campanha de financiamento coletivo do Avistando 2025 foi um marco importante para o Instituto Suinã. Durante 51 dias, mobilizamos nossa rede, parceiros, amigos e apoiadores em torno da causa da observação de aves como ferramenta de educação ambiental, turismo sustentável e ciência cidadã.</p>
<p>Ao final da campanha, alcançamos R$ 9.476,85 arrecadados pela plataforma Benfeitoria e 91 doadores individuais se engajaram para viabilizar a próxima edição do evento.</p>
<p>Esse resultado, embora muito significativo, nos colocou diante de uma realidade que atravessa a maioria das OSCs no Brasil: a dificuldade de captação de recursos. Nossa meta inicial era de R$ 25.000,00.</p>
<h2>O retrato de um cenário nacional</h2>
<p>Diversos estudos têm apontado que as OSCs no Brasil enfrentam uma dependência histórica de recursos internacionais. O artigo <em>O Terceiro Setor no Brasil: Avanços, Retrocessos e Desafios</em> reforça que essa dependência de fontes instáveis gera descontinuidade de projetos e dificuldades para manter equipes e metodologias de longo prazo.</p>
<h2>Lições da nossa campanha</h2>
<p>No caso da campanha do Avistando, a solidariedade comunitária é potente, mas precisa estar conectada a parcerias institucionais mais robustas. Cada um dos 91 apoiadores não apenas doou, mas também validou a importância do Avistando.</p>
<h2>O que o terceiro setor precisa discutir</h2>
<ol>
<li>A necessidade de profissionalização da captação de recursos;</li>
<li>A importância de parcerias locais;</li>
<li>O fortalecimento da cultura de doação no Brasil;</li>
<li>A articulação política e institucional.</li>
</ol>
<h2>Gratidão e convite à continuidade</h2>
<p>Encerramos a campanha com menos da metade da meta, mas com a certeza de que demos um passo importante. Um agradecimento especial à SAVE Brasil, nossa parceira na realização da campanha. Essa parceria reafirma a importância de trabalharmos em rede.</p>
<p><strong>Autora:</strong> Lorrane Coelho, caiçara de origem, bióloga especialista em Educação Ambiental e Sustentabilidade.</p>"""
  },
]

print(f"Migrando {len(POSTS)} posts do blog...")
# Limpa posts anteriores
try:
    all_ids = [r['id'] for r in sb.table("posts_blog").select("id").execute().data]
    for i in all_ids:
        sb.table("posts_blog").delete().eq("id", i).execute()
    print(f"  {len(all_ids)} posts antigos removidos.")
except Exception as e:
    print(f"  Erro ao limpar: {e}")

ok = 0
for p in POSTS:
    try:
        sb.table("posts_blog").insert({
            "title": p["title"],
            "slug": p["slug"],
            "content": p["content"],
            "published_at": p["published_at"],
            "status": "Publicado",
        }).execute()
        print(f"  OK: {p['title'][:60]}")
        ok += 1
    except Exception as e:
        print(f"  ERRO: {p['title'][:40]} | {e}")

print(f"\nTotal: {ok}/{len(POSTS)} posts migrados.")
