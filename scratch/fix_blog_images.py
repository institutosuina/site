import os, requests, mimetypes
from supabase import create_client

URL = "https://moephwizcfrdupquxpha.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
sb = create_client(URL, KEY)
BUCKET = "covers"
DIR = "downloads_blog_images"
os.makedirs(DIR, exist_ok=True)

HEADERS = {"User-Agent": "Mozilla/5.0"}

def baixar_e_subir(wix_url, filename):
    local_path = os.path.join(DIR, filename)
    try:
        r = requests.get(wix_url, headers=HEADERS, timeout=60)
        r.raise_for_status()
        with open(local_path, "wb") as f: f.write(r.content)
    except Exception as e:
        print(f"Erro download {filename}: {e}")
        return None
        
    clean_name = filename.replace('~mv2', '')
    remote_path = f"blog/{clean_name}"
    try:
        mime, _ = mimetypes.guess_type(remote_path)
        if not mime: mime = "image/jpeg"
        with open(local_path, "rb") as f:
            sb.storage.from_(BUCKET).upload(remote_path, f, {"content-type": mime, "x-upsert": "true"})
    except Exception as e:
        print(f"        Erro upload {filename}: {e}")
        
    return sb.storage.from_(BUCKET).get_public_url(remote_path)

# Mapeamento de imagens
BLOG_IMAGES = {
    "floresta-e-agua-restauracao-ecologica-seguranca-hidrica": {
        "cover": "https://static.wixstatic.com/media/e2b488_9a908e85e3d147109b07b47c4beac1b0~mv2.jpg",
        "inline": [
            "https://static.wixstatic.com/media/e2b488_5c593bb0311745b0b51ed53af7bcf356~mv2.jpeg",
            "https://static.wixstatic.com/media/e2b488_85ba4c46346347c1afd4276bd8b9ff5f~mv2.jpg"
        ],
        "content_template": """<p>A relação entre floresta e água é um dos pilares fundamentais para a manutenção dos serviços ecossistêmicos e da qualidade de vida nos territórios. A cobertura vegetal nativa exerce papel estratégico na regulação do ciclo hidrológico, favorecendo a infiltração da água no solo, a proteção de nascentes e a redução de processos erosivos. Em contrapartida, a degradação ambiental compromete diretamente a disponibilidade hídrica, impactando tanto os ecossistemas quanto as atividades produtivas.</p>
<p>Diante desse cenário, a restauração ecológica emerge como uma solução essencial e urgente, especialmente em áreas rurais, onde a água é um recurso indispensável para a produção e para a sustentabilidade das propriedades.</p>
<h2>Relato de quem vivencia a restauração</h2>
<img src="{inline_0}" alt="Área de restauração" />
<p>O produtor rural Gerson Alvarenga compartilha sua percepção sobre o processo de restauração ecológica:</p>
<blockquote><p>"No meu caso, foi bastante oportuno, porque o produtor rural costuma ser penalizado e quase nunca tem recursos disponíveis para realizar um procedimento desse tipo. A participação do poder público é indispensável, por si só você não consegue e não há motivação para isso."</p></blockquote>
<p>Além dos aspectos econômicos, Gerson destaca a dimensão coletiva da água e a percepção das mudanças no território:</p>
<blockquote><p>"Eu entendo assim, a água é de vital importância e não se resume, não se restringe ao meu interesse pessoal. Há a necessidade de restauração sim, pois a gente tem percebido a redução drástica no volume de água disponível. Sou bastante adepto à restauração."</p></blockquote>
<h2>Caminhos para avançar</h2>
<img src="{inline_1}" alt="Caminhos para avançar" />
<p>A restauração ecológica, quando articulada a políticas públicas eficazes, assistência técnica e engajamento local, tem potencial para gerar impactos positivos em múltiplas dimensões: ambiental, social e econômica. Iniciativas que promovem a recuperação de áreas degradadas, especialmente em regiões estratégicas para a produção de água, contribuem diretamente para a segurança hídrica e para a sustentabilidade dos territórios rurais.</p>
<p>Mais do que uma escolha, trata-se de um compromisso coletivo com o presente e o futuro. Afinal, onde há floresta, há água, e onde há água, há possibilidade de vida.</p>
<p><strong>Autora:</strong> Jhennifer Machado é estudante de Publicidade e Propaganda e técnica de comunicação do Instituto Suinã.</p>
<p><strong>Co-autora:</strong> Alessandra Souza, Bióloga, mestranda e apaixonada por todas as formas de vida.</p>"""
    },
    
    "forca-reflexao-estrategica-novo-caminho-suina-btg-soma": {
        "cover": "https://static.wixstatic.com/media/e2b488_6d730560319a4de288dd4ff0ac686019~mv2.jpg",
        "inline": [
            "https://static.wixstatic.com/media/e2b488_8e3cfbf6405f43bf96e6705ca842dea8~mv2.jpg",
            "https://static.wixstatic.com/media/e2b488_ef42cf4ac7304a80919d75ed14753f89~mv2.jpg"
        ],
        "content_template": """<p>Ao longo de seis meses intensos em 2025, o Instituto Suinã integrou a 12ª edição do BTG Soma Meio Ambiente, programa de aceleração realizado pelo BTG Pactual em parceria com a AGO Social. Ser uma das 12 organizações selecionadas foi, sem dúvida, um reconhecimento do trabalho que desenvolvemos no território.</p>
<p>Para quem não conhece, o BTG Soma Meio Ambiente é uma importante iniciativa de aceleração dedicada a fortalecer organizações que atuam na conservação da biodiversidade brasileira. Nossa equipe mergulhou em um programa intensivo, estruturado em três pilares:</p>
<ol>
<li>Aulas semanais com a rede AGO Social (focadas em Liderança, Gestão e Sustentabilidade Financeira);</li>
<li>Mentoria individualizada com voluntários do BTG Pactual para diagnóstico de desafios;</li>
<li>Desafios de aplicação prática com avaliação de bancas de especialistas.</li>
</ol>
<h2>Criação da Teoria da Mudança do Suinã</h2>
<img src="{inline_0}" alt="Equipe Instituto Suinã" />
<p>O programa proporcionou exatamente o que mais faltava: tempo dedicado, estrutura metodológica e especialistas capacitados para nos ajudar a recalcular a rota. Esse processo incluiu, sobretudo, a construção da Teoria da Mudança Institucional (TdM): o mapa que liga nossas ações ao impacto que desejamos gerar.</p>
<h2>De Metas e Indicadores: A Prova da Maturidade</h2>
<img src="{inline_1}" alt="Apresentação BTG Soma" />
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
    
    "avistando-2025-aprendemos-campanha-financiamento-coletivo": {
        "cover": "https://static.wixstatic.com/media/e2b488_4b648b736c664d9ab8e89983d5ae535f~mv2.jpeg",
        "inline": [
            "https://static.wixstatic.com/media/e2b488_4cdcadad3035439db8ea3d5121341360~mv2.jpeg",
            "https://static.wixstatic.com/media/e2b488_18e3245941ad43cb81e0356737d1810a~mv2.jpg",
            "https://static.wixstatic.com/media/e2b488_a6ab836960bc45ac990e16c526ab94ac~mv2.jpg"
        ],
        "content_template": """<p>A campanha de financiamento coletivo do Avistando 2025 foi um marco importante para o Instituto Suinã. Durante 51 dias, mobilizamos nossa rede, parceiros, amigos e apoiadores em torno da causa da observação de aves como ferramenta de educação ambiental, turismo sustentável e ciência cidadã.</p>
<p>Ao final da campanha, alcançamos R$ 9.476,85 arrecadados pela plataforma Benfeitoria e 91 doadores individuais se engajaram para viabilizar a próxima edição do evento.</p>
<img src="{inline_0}" alt="Avistando 2024 - Santa Branca/SP" />
<p><em>Fonte: Márcio Gomes / Avistando 2024 - Santa Branca/SP</em></p>
<p>Esse resultado, embora muito significativo, nos colocou diante de uma realidade que atravessa a maioria das OSCs no Brasil: a dificuldade de captação de recursos. Nossa meta inicial era de R$ 25.000,00.</p>
<h2>O retrato de um cenário nacional</h2>
<p>Diversos estudos têm apontado que as OSCs no Brasil enfrentam uma dependência histórica de recursos internacionais. O artigo <em>O Terceiro Setor no Brasil: Avanços, Retrocessos e Desafios</em> reforça que essa dependência de fontes instáveis gera descontinuidade de projetos e dificuldades para manter equipes e metodologias de longo prazo.</p>
<img src="{inline_1}" alt="Avistando 2024 - Igaratá/SP" />
<p><em>Fonte: João Ferreira / Avistando 2024 - Igaratá/SP</em></p>
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
<img src="{inline_2}" alt="Jovens Observadores - Guararema/SP" />
<p><em>Fonte: Jhennifer Pires - Instituto Suinã / Jovens Observadores - Guararema/SP</em></p>
<p>Encerramos a campanha com menos da metade da meta, mas com a certeza de que demos um passo importante. Um agradecimento especial à SAVE Brasil, nossa parceira na realização da campanha. Essa parceria reafirma a importância de trabalharmos em rede.</p>
<p><strong>Autora:</strong> Lorrane Coelho, caiçara de origem, bióloga especialista em Educação Ambiental e Sustentabilidade.</p>"""
    },
    
    "jovens-observadores-educacao-ambiental-como-caminho-para-o-pertencimento-e-o-turismo-sustentavel": {
        "cover": "https://static.wixstatic.com/media/e2b488_72e0ece90a3e439ba0583271da1163e5~mv2.jpg",
        "inline": [],
        "content_template": """<p>A educação ambiental, quando construída a partir das vivências, do território e da escuta ativa, torna-se uma potente ferramenta de transformação social. É com esse princípio que o Projeto Jovens Observadores foi concebido e executado pelo Instituto Suinã nos municípios de Jacareí e Guararema (SP), ao longo de nove meses de projeto.</p>
<p>O projeto propôs um percurso formativo pautado na observação de aves como porta de entrada para temas como conservação da biodiversidade, turismo sustentável e os chamados empregos verdes.</p>
<h2>Metodologia fundamentada na escuta, no vínculo e na prática</h2>
<p>A metodologia do projeto teve como base a educação ambiental crítica, integrando aspectos cognitivos, sensoriais e afetivos no processo de formação. Conforme define a Lei nº 9.795/99 (Art. 1º), a educação ambiental deve ser um componente permanente da educação, integrando-se a todos os níveis e modalidades de ensino, tanto no contexto formal quanto no não formal.</p>
<p><strong>Autora:</strong> Lorrane Coelho, bióloga especialista em Educação Ambiental e Sustentabilidade.</p>"""
    },
    
    "dia-nacional-da-conservacao-do-solo-precisamos-olhar-para-a-terra-com-mais-carinho-e-ciencia": {
        "cover": "https://static.wixstatic.com/media/e2b488_374a5d2ebad948539dccaf571af419fe~mv2.jpg",
        "inline": [],
        "content_template": """<p>No dia 15 de abril, celebra-se o Dia Nacional da Conservação do Solo, uma data que ressalta a urgência de integrar o conhecimento científico às políticas públicas e práticas socioambientais voltadas à gestão sustentável dos recursos naturais.</p>
<p>O solo fornece suporte físico para vegetação e construções, atua como habitat para trilhões de organismos, regulador da qualidade da água por meio de processos de infiltração e filtragem de poluentes, e reservatório estratégico de carbono.</p>
<h2>Um alerta</h2>
<p>Segundo a FAO (Organização das Nações Unidas para a Alimentação e Agricultura), cerca de 33% dos solos do mundo estão degradados. Isso significa menor fertilidade, mais enchentes, menos carbono sendo capturado da atmosfera.</p>
<p><strong>Autora:</strong> Alessandra Souza, Bióloga e mestranda.</p>"""
    }
}

for slug, data in BLOG_IMAGES.items():
    print(f"\\nProcessando post: {slug}")
    
    # Capa
    print("  Baixando capa...")
    cover_filename = data["cover"].split('/')[-1]
    cover_url = baixar_e_subir(data["cover"], cover_filename)
    
    # Inline
    inline_urls = []
    for i, inline_wix in enumerate(data["inline"]):
        print(f"  Baixando imagem {i+1}...")
        inline_filename = inline_wix.split('/')[-1]
        pub_url = baixar_e_subir(inline_wix, inline_filename)
        inline_urls.append(pub_url)
        
    # Formata o HTML com as URLs novas do Supabase
    format_args = {f"inline_{i}": url for i, url in enumerate(inline_urls)}
    new_html = data["content_template"].format(**format_args)
    
    # Atualiza o banco
    print("  Atualizando banco de dados...")
    try:
        sb.table("posts_blog").update({
            "cover_image": cover_url,
            "content": new_html
        }).eq("slug", slug).execute()
        print("  OK! Post atualizado.")
    except Exception as e:
        print(f"  ERRO ao atualizar: {e}")

print("\\nFinalizado!")
