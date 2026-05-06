import os, requests, mimetypes
from supabase import create_client

URL = "https://moephwizcfrdupquxpha.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
sb = create_client(URL, KEY)
BUCKET = "covers"

os.makedirs("downloads_projetos", exist_ok=True)
HEADERS = {"User-Agent": "Mozilla/5.0"}

def baixar_e_subir(wix_url, filename):
    local_path = os.path.join("downloads_projetos", filename)
    try:
        r = requests.get(wix_url, headers=HEADERS, timeout=60)
        if r.status_code == 200:
            with open(local_path, "wb") as f: f.write(r.content)
    except Exception as e:
        print(f"Erro download {filename}: {e}")
        return None
        
    clean_name = filename.replace('~mv2', '')
    remote_path = f"projetos/{clean_name}"
    try:
        mime, _ = mimetypes.guess_type(remote_path)
        if not mime: mime = "image/jpeg"
        with open(local_path, "rb") as f:
            sb.storage.from_(BUCKET).upload(remote_path, f, {"content-type": mime, "x-upsert": "true"})
    except Exception as e:
        pass
        
    return sb.storage.from_(BUCKET).get_public_url(remote_path)

projetos = {
    "educacao": [
        {"title": "Viver o Viveiro", "img": "https://static.wixstatic.com/media/e2b488_0327c5a2084544d88a873249557a30b2~mv2.png", "text": "O Viveiro Municipal “Seo Moura” é um espaço educador, uma área verde no coração do município Jacareí. Este espaço tão valioso agora está aberto todos os domingos visando atender e cumprir políticas públicas de educação ambiental municipal, ampliando o acesso às atividades oferecidas de forma gratuita a população, como oficinas ambientais e artísticas, distribuição de mudas de ervas medicinais e realização de trilhas, favorecendo o maior contato com o meio natural. Essas ações acontecem em parceria com a Prefeitura Municipal de Jacareí e visam integrar e sensibilizar todos e todas perante as questões ambientais, podendo culminar na mudança cultural por parte dos indivíduos.\\nLocalidade: Jacareí / SP"},
        {"title": "JornalEco", "img": "https://static.wixstatic.com/media/e2b488_fe6363bd59474cbb9e1ebab74745ed16~mv2.png", "text": "Elaboração do material educativo JornalEco com o objetivo de dialogar com o cotidiano das comunidades escolares (educandos, seus responsáveis e funcionárias(os) da escola), contemplando a realidade local e facilitando o processo de reconhecimento e entendimento de onde se está inserido. Com o material pronto, realizamos a formação de educadoras e educadores da rede pública de ensino.\\nLocalidades: Três Lagoas/MS, Brasilândia/MS, Selvíria/MS e Ribas do Rio Pardo/MS."},
        {"title": "Ambiente-se", "img": "https://static.wixstatic.com/media/e2b488_2c69eae0ea7d43149baf5b58f3b39156~mv2.jpg", "text": "Formação e capacitação das professoras(es) da rede municipal de ensino, visando auxiliar os mesmos em propostas de projetos pedagógicos ligados a temática ambiental.\\nLocalidades: Guararema/SP."},
        {"title": "Formação Ambiental Quatro Ribeiras", "img": "https://static.wixstatic.com/media/e2b488_322298feb0114c5698cf75d567056e8d~mv2.jpg", "text": "As ações de educação ambiental deste projeto visam contextualizar a importância da sub-bacia do córrego Quatro Ribeiras para produção de água e segurança hídrica do município de Jacareí / SP, por meio da parceria com escolas municipais, viveiro municipal e Núcleo de educação ambiental (NEA).\\nLocalidades: Jacareí/SP."},
        {"title": "Ciclo das Estações", "img": "https://static.wixstatic.com/media/e2b488_322298feb0114c5698cf75d567056e8d~mv2.jpg", "text": "A fim de promover encontros e trazer sentido à prática de pertencer ao meio em que estamos inseridos, a equipe de educação ambiental do Instituto Suinã foi convidada pela equipe da APAE de São José dos Campos para propor um projeto de sensibilização para as/os colaboradoras/es.\\nLocalidades: São José dos Campos/SP."},
        {"title": "De Olho no Resíduo", "img": "https://static.wixstatic.com/media/e2b488_4bc9d966db5045a89f827b86a1330a17~mv2.jpg", "text": "Fomento de ações que visam minimizar a problemática do descarte incorreto de resíduos, a fim de unir esforços e aproximar o poder público, as empresas que atuam no município, cooperativas, atores locais e sociedade civil na busca de alternativas técnicas que possam ser implementadas na sensibilização dos munícipes, estimulando a mudança de hábitos.\\nLocalidades: Porto Feliz/SP."},
        {"title": "Práticas Sustentáveis", "img": "https://static.wixstatic.com/media/e2b488_69de16c0a2264e57bd61d51427529fcb~mv2.jpg", "text": "Localidades: Capão Bonito/SP; Alumínio/SP e Salto de Pirapora/SP."},
        {"title": "Pátio Verde", "img": "https://static.wixstatic.com/media/e2b488_253bb5a9f1ec4f4db45e315fdb9875dc~mv2.jpg", "text": "O projeto fomentou a organização de uma rede de produtoras e produtores urbanos agroecológicos no Distrito de São Silvestre, Jacareí - SP e contribuir com a transformação das relações humanas a partir de um olhar carinhoso com o espaço em que vive.\\nLocalidade: Jacareí/SP."},
        {"title": "Quintais Produtivos", "img": "https://static.wixstatic.com/media/e2b488_66a834a1404f4a3dbe1af6b2c57b81e3~mv2.jpeg", "text": "Projeto em andamento."},
        {"title": "Núcleo de Educação Ambiental da Empresa Suzano", "img": "https://static.wixstatic.com/media/e2b488_a5d57f689d614a6c99e41993e6dfb865~mv2.jpg", "text": "Projeto em andamento."}
    ],
    "fortalecimento": [
        {"title": "Mobilização - Projeto Árvores Raras na Paisagem", "img": "https://static.wixstatic.com/media/e2b488_406ae3d384bd48d2aaf99b9047aa6862~mv2.png", "text": "O projeto ocorreu no entorno da Unidade de Conservação Refúgio da Vida Silvestre do Bicudinho (UC RVS), localizada na sub-bacia hidrográfica do ribeirão do Putim, no município de Guararema/SP, local de extrema importância para a conservação dos recursos hídricos e da biodiversidade regional. As ações realizadas incluíram entrevista e mapeamento de proprietários rurais no entorno da UC RVS com o objetivo de sensibilizá-los sobre a importância da existência das árvores consideradas raras na paisagem e mobilizá-los para a conservação das florestas e dos serviços ecossistêmicos e o plantio dessas espécies em suas propriedades.\\nLocalidade: Guararema/SP."},
        {"title": "Assessoria", "img": "https://static.wixstatic.com/media/e2b488_c899f275a4fe4d1a8cbf0a6e1262315e~mv2.jpg", "text": "Projeto em andamento."},
        {"title": "Diálogo Operacional", "img": "https://static.wixstatic.com/media/e2b488_c899f275a4fe4d1a8cbf0a6e1262315e~mv2.jpg", "text": "Localidades: Americana; Amparo; Arandu; Araraquara; Avaré; Caçapava; Charqueada; Corumbataí; Fernão; Guararema; Guaratinguetá; Ibaté; Igaratá; Itu; Jacareí; Jambeiro; Limeira; Monteiro Lobato; Natividade da Serra; Paraibuna; Pardinho; Pindamonhangaba; Redenção da Serra; Santa Branca; Santa Lúcia; São Carlos; São José dos Campos; São Luís do Paraitinga; São Miguel Arcanjo; São Pedro; Silveiras; Tapiraí; Taubaté; Tremembé; Águas de Santa Bárbara; Agudos; Alambari; Álvaro de Carvalho; Alvinlândia; Angatuba; Anhembi; Arealva; Assis; Avaí; Avaré; Balbinos; Bariri; Bauru; Bernandino de Campos; Bofete; Bom Sucesso de Itararé; Boraceia; Borebi; Botucatu; Brotas; Buri; Cabrália Paulista; Cafelândia; Capão Bonito; Cerqueira Cesar; Conchas; Duartina; Echaporã; Espírito Santo do Turvo; Gália; Garça; Getulina; Guaiçara; Guaimbê; Guarantã; Iacanga; Iaras, Iepê; Itaberá; Itaí; Itapetininga; Itapeva; Itapirapuã Paulista; Itaporanga; Itararé; Itatinga; Itirapina; Jaú; Júlio de Mesquita; Lençóis Paulista; Lucianópolis; Lupércio; Manduri; Marília; Nova Campina; Ocauçu; Ourinhos; Paranapanema; Paulistânia; Pederneiras; Pilar do Sul; Piracicaba; Piraju, Pirajuí; Piratininga; Pratania; Presidente Alves; Promissão; Quadra; Quintana; Reginopólis; Ribeirão Bonito; Sarutaiá, Santa Cruz do Rio Pardo; São Miguel Arcanjo; São Pedro do Turvo; Taquarituba; Taquarivaí; Tatuí; Tejubá; Oriente; Torrinha e Vera Cruz."},
        {"title": "Inventário / Caracterização Social", "img": "https://static.wixstatic.com/media/e2b488_1c4079d098de4c53a8a4bbabc84e4660~mv2.png", "text": "Projeto em andamento."}
    ],
    "conservacao": [
        {"title": "Planos Municipais da Mata Atlântica", "img": "https://static.wixstatic.com/media/e2b488_5489bc440b34473e8ca8af9b8b765354~mv2.jpg", "text": "O Instituto Suinã participa desde o início de 2022 do programa Planos da Mata, um projeto desenvolvido pela SOS Mata Atlântica e fomentado pela Suzano Papel e Celulose, que tem como objetivo construir ou revisar junto às prefeituras e comunidades os PMMAs (Planos Municipais da Mata Atlântica) de 33 municípios nos estados de São Paulo, Minas, Espírito Santo e Bahia. O instituto ficou a cargo de 4 cidades: Guararema, Jacareí, Salesópolis e Santa Branca - SP."},
        {"title": "Encantamentos da Natureza", "img": "https://static.wixstatic.com/media/e2b488_abfdb0fa6b8a4b3b87d5f7c423f28898~mv2.jpg", "text": "Utilizamos a Interpretação Ambiental (IA) para criar oportunidades para que pessoas sejam sensibilizadas sobre os bens naturais, cultura e história de cada Área ou Unidade de Conservação a partir da tradução das informações técnicas e científicas utilizando estratégias de educomunicação que orienta práticas de criação e fortalecimento de ecossistemas comunicativos abertos e democráticos nos espaços educativos."},
        {"title": "Conservação em Rede", "img": "https://static.wixstatic.com/media/e2b488_abfdb0fa6b8a4b3b87d5f7c423f28898~mv2.jpg", "text": "Assim, a conservação ganha mais aliados e as mudanças positivas de comportamento podem ocorrer de forma crescente e duradoura, por falar de forma direta com a sociedade e gerando empatia e identificação pessoal entre o público e aquilo que queremos proteger: a natureza."},
        {"title": "Diagnóstico Socioambiental da Sub-Bacia 4 Ribeiras", "img": "https://static.wixstatic.com/media/e2b488_406ffff7405849a0a2b3f33036b64263~mv2.jpeg", "text": "Projeto em andamento."},
        {"title": "Caracterização de Vegetação", "img": "https://static.wixstatic.com/media/e2b488_56b963366b5f4f4f916fc0b1c8ef7aee~mv2.jpg", "text": "Projeto em andamento."},
        {"title": "Unidade de Conservação - RVS", "img": "https://static.wixstatic.com/media/e2b488_8ccef27f6dc9428999a3924cf86c7334~mv2.jpg", "text": "Projeto em andamento."}
    ]
}

js_content = "export const WORK_AREAS_DATA = {\\n"

for area, proj_list in projetos.items():
    js_content += f"  {area}: [\\n"
    for p in proj_list:
        if p["img"]:
            filename = p["img"].split("/")[-1]
            print(f"Baixando e subindo {filename}...")
            new_url = baixar_e_subir(p["img"], filename)
        else:
            new_url = ""
        js_content += f"    {{ title: {repr(p['title'])}, image: {repr(new_url)}, text: {repr(p['text'])} }},\\n"
    js_content += "  ],\\n"

js_content += "};\\n"

with open("src/data/nossoTrabalho.ts", "w", encoding="utf-8") as f:
    f.write(js_content)
    
print("Pronto! Arquivo src/data/nossoTrabalho.ts gerado com sucesso com as novas URLs.")
