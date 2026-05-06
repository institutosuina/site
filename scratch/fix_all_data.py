import os, requests, mimetypes, json
from supabase import create_client

URL = "https://moephwizcfrdupquxpha.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZXBod2l6Y2ZyZHVwcXV4cGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE3MTUzMSwiZXhwIjoyMDkxNzQ3NTMxfQ.d04EFVmjQDAjAz4k4_DW4i6gPgQoozTk4gkki7BhwEs"
sb = create_client(URL, KEY)
BUCKET = "covers"

def baixar_e_subir(wix_url):
    filename = wix_url.split("/")[-1]
    local_path = os.path.join("downloads_projetos", filename)
    try:
        r = requests.get(wix_url, timeout=60)
        if r.status_code == 200:
            with open(local_path, "wb") as f: f.write(r.content)
    except:
        return ""
        
    clean_name = filename.replace('~mv2', '')
    remote_path = f"projetos/{clean_name}"
    try:
        mime, _ = mimetypes.guess_type(remote_path)
        if not mime: mime = "image/jpeg"
        with open(local_path, "rb") as f:
            sb.storage.from_(BUCKET).upload(remote_path, f, {"content-type": mime, "x-upsert": "true"})
    except:
        pass
        
    return f"https://moephwizcfrdupquxpha.supabase.co/storage/v1/object/public/covers/{remote_path}"

fortalecimento = [
    {
        "title": "Mobilização - Projeto Árvores Raras na Paisagem",
        "images": ["https://static.wixstatic.com/media/e2b488_406ae3d384bd48d2aaf99b9047aa6862~mv2.png"],
        "text": "O projeto ocorreu no entorno da Unidade de Conservação Refúgio da Vida Silvestre do Bicudinho (UC RVS), localizada na sub-bacia hidrográfica do ribeirão do Putim, no município de Guararema/SP, local de extrema importância para a conservação dos recursos hídricos e da biodiversidade regional. As ações realizadas incluíram entrevista e mapeamento de proprietários rurais no entorno da UC RVS com o objetivo de sensibilizá-los sobre a importância da existência das árvores consideradas raras na paisagem e mobilizá-los para a conservação das florestas e dos serviços ecossistêmicos e o plantio dessas espécies em suas propriedades.\\nLocalidade: Guararema/SP."
    },
    {
        "title": "Assessoria",
        "images": ["https://static.wixstatic.com/media/e2b488_c899f275a4fe4d1a8cbf0a6e1262315e~mv2.jpg"],
        "text": "O objetivo é assessorar empresas e parceiros no fortalecimento da relação comunitária, colaboradores, terceiros e cliente. A partir de uma comunicação bem direcionada e do diálogo estabelecido, a comunidade tende a se envolver mais efetivamente no processo, o que facilita a troca e assimilação de informações. O trabalho é realizado a partir de pesquisa de campo para caracterização e georreferenciamento das comunidades."
    },
    {
        "title": "Diálogo Operacional",
        "images": [
            "https://static.wixstatic.com/media/e2b488_c750d952f4424dbaabcce5d3cd5e6c69~mv2.jpg",
            "https://static.wixstatic.com/media/e2b488_7ce116c1e4484c2a81f4643b3aff50cf~mv2.png"
        ],
        "text": "Realizado para aproximação e fortalecimento da relação comunitária a partir da escuta ativa de sugestões, dúvidas, reclamações e questionamentos diante das situações características de cada local. É o momento de trocar informações, gerando contribuições para a comunidade e para as empresas.\\nLocalidades: Americana; Amparo; Arandu; Araraquara; Avaré; Caçapava; Charqueada; Corumbataí; Fernão; Guararema; Guaratinguetá; Ibaté; Igaratá; Itu; Jacareí; Jambeiro; Limeira; Monteiro Lobato; Natividade da Serra; Paraibuna; Pardinho; Pindamonhangaba; Redenção da Serra; Santa Branca; Santa Lúcia; São Carlos; São José dos Campos; São Luís do Paraitinga; São Miguel Arcanjo; São Pedro; Silveiras; Tapiraí; Taubaté; Tremembé; Águas de Santa Bárbara; Agudos; Alambari; Álvaro de Carvalho; Alvinlândia; Angatuba; Anhembi; Arealva; Assis; Avaí; Avaré; Balbinos; Bariri; Bauru; Bernandino de Campos; Bofete; Bom Sucesso de Itararé; Boraceia; Borebi; Botucatu; Brotas; Buri; Cabrália Paulista; Cafelândia; Capão Bonito; Cerqueira Cesar; Conchas; Duartina; Echaporã; Espírito Santo do Turvo; Gália; Garça; Getulina; Guaiçara; Guaimbê; Guarantã; Iacanga; Iaras, Iepê; Itaberá; Itaí; Itapetininga; Itapeva; Itapirapuã Paulista; Itaporanga; Itararé; Itatinga; Itirapina; Jaú; Júlio de Mesquita; Lençóis Paulista; Lucianópolis; Lupércio; Manduri; Marília; Nova Campina; Ocauçu; Ourinhos; Paranapanema; Paulistânia; Pederneiras; Pilar do Sul; Piracicaba; Piraju, Pirajuí; Piratininga; Pratania; Presidente Alves; Promissão; Quadra; Quintana; Reginopólis; Ribeirão Bonito; Sarutaiá, Santa Cruz do Rio Pardo; São Miguel Arcanjo; São Pedro do Turvo; Taquarituba; Taquarivaí; Tatuí; Tejubá; Oriente; Torrinha e Vera Cruz."
    },
    {
        "title": "Inventário / Caracterização Social",
        "images": ["https://static.wixstatic.com/media/e2b488_1c4079d098de4c53a8a4bbabc84e4660~mv2.png"],
        "text": "O Inventário/Caracterização Social é um instrumento utilizado para a compreensão da realidade e do contexto social de uma determinada localidade ou região. Trata-se de um estudo detalhado e sistematizado sobre as características demográficas, socioeconômicas, culturais e ambientais das comunidades avaliadas. Esse levantamento é fundamental para o planejamento, implementação e avaliação de políticas públicas e projetos sociais.\\nLocalidades: Andrelândia, Aparecida, Areias, Barra Mansa, Bertioga, Biritiba-Mirim, Caçapava, Cachoeira Paulista, Canas, Carrancas, Cruzeiro, Cruzília, Cunha, Guararema, Itumirim, Jacareí, Lavras, Lorena, Luminárias, Mogi das Cruzes, Piquete, Queluz, Resende, Roseira, Salesópolis, Santa Branca, São José do Barreiro, São Vicente de Minas, Silveiras."
    }
]

conservacao = [
    {
        "title": "Planos Municipais da Mata Atlântica",
        "images": ["https://static.wixstatic.com/media/e2b488_5489bc440b34473e8ca8af9b8b765354~mv2.jpg"],
        "text": "O Instituto Suinã participa desde o início de 2022 do programa Planos da Mata, um projeto desenvolvido pela SOS Mata Atlântica e fomentado pela Suzano Papel e Celulose, que tem como objetivo construir ou revisar junto às prefeituras e comunidades os PMMAs (Planos Municipais da Mata Atlântica) de 33 municípios nos estados de São Paulo, Minas, Espírito Santo e Bahia. O instituto ficou a cargo de 4 cidades.\\nLocalidade: Jacareí/SP, Guararema/SP, Salesópolis/SP e Santa Branca/SP."
    },
    {
        "title": "Encantamentos da Natureza",
        "images": ["https://static.wixstatic.com/media/e2b488_abfdb0fa6b8a4b3b87d5f7c423f28898~mv2.jpg"],
        "text": "Utilizamos a Interpretação Ambiental (IA) para criar oportunidades para que pessoas sejam sensibilizadas sobre os bens naturais, cultura e história de cada Área ou Unidade de Conservação a partir da tradução das informações técnicas e científicas utilizando estratégias de educomunicação que orienta práticas de criação e fortalecimento de ecossistemas comunicativos abertos e democráticos nos espaços educativos."
    },
    {
        "title": "Conservação em Rede",
        "images": ["https://static.wixstatic.com/media/e2b488_abfdb0fa6b8a4b3b87d5f7c423f28898~mv2.jpg"],
        "text": "Assim, a conservação ganha mais aliados e as mudanças positivas de comportamento podem ocorrer de forma crescente e duradoura, por falar de forma direta com a sociedade e gerando empatia e identificação pessoal entre o público e aquilo que queremos proteger: a natureza."
    },
    {
        "title": "Inventário de Fauna",
        "images": ["https://static.wixstatic.com/media/e2b488_0801937b5c3e4aceaa477c097cea1710~mv2.png", "https://static.wixstatic.com/media/e2b488_3ef66aff7bbf4faea69ceba4345a83aa~mv2.jpg"],
        "text": "Realizado o inventário preliminar de fauna na Unidade de Conservação Refúgio de Vida Silvestre do Bicudinho, em Guararema - SP. A coleta de informações gerou uma caracterização sobre a diversidade e riqueza de espécies da UC e entorno, servindo como embasamento do atual plano de manejo. Também são realizados inventários de mastofauna, avifauna, herpetofauna e ictiofauna.\\nLocalidade: Guararema/SP."
    },
    {
        "title": "Árvores Raras na Paisagem",
        "images": ["https://static.wixstatic.com/media/e2b488_b24a79566bee45a6b1579bde220f212d~mv2.jpg"],
        "text": "Assegurar a presença das árvores ausentes na paisagem do Vale do Paraíba Paulista e resgatar a importância dessas espécies como símbolos de conservação na região.\\nLocalidade: Caçapava/SP e Taubaté/SP."
    },
    {
        "title": "Diagnóstico Socioambiental da Sub-Bacia 4 Ribeiras",
        "images": ["https://static.wixstatic.com/media/e2b488_c2f9497136204d778d4dc4c4239858fa~mv2.jpg", "https://static.wixstatic.com/media/e2b488_fca02c7c10604e82bd66d634f7977506~mv2.jpg", "https://static.wixstatic.com/media/e2b488_56b963366b5f4f4f916fc0b1c8ef7aee~mv2.jpg"],
        "text": "Projeto voltado ao diagnóstico socioambiental da sub-bacia do quatro ribeiras a fim de mobilizar e sensibilizar os proprietários de terras a conservarem os recursos hídricos por meio de melhorias ambientais em sua propriedades. O foco do projeto é a análise da condição das nascentes existentes, com objetivo de restauração ecológica das mesmas quando desprovidas de vegetação.\\nLocalidade: Jacareí/SP."
    },
    {
        "title": "Caracterização de Vegetação",
        "images": ["https://static.wixstatic.com/media/e2b488_676c9c3c096f475baa78a061a3d7610f~mv2.jpg", "https://static.wixstatic.com/media/e2b488_d333c16d8db145619c95c5f5bfd7a11a~mv2.jpg", "https://static.wixstatic.com/media/e2b488_8ccef27f6dc9428999a3924cf86c7334~mv2.jpg"],
        "text": "Caracterização da vegetação ou laudo de vegetação é um inventário da vegetação de uma determinada área ou região. Tem como objetivo trazer informações como diversidade, abundância e estado de conservação da vegetação existente no local. As informações coletadas podem auxiliar no planejamento de intervenção de uma determinada área e auxiliar na mitigação de seus impactos, bem como propor soluções para aumentar a biodiversidade local.\\nLocalidade: Extrema/MG."
    },
    {
        "title": "Unidade de Conservação - RVS",
        "images": ["https://static.wixstatic.com/media/e2b488_2c06a8cf47164dd99ae4d315d57dca9a~mv2.jpg"],
        "text": "Criada a Unidade de Conservação, Guararema se tornou destaque internacional por sua importância na conservação de uma espécie globalmente ameaçada de extinção que só ocorre nessa região. O Refúgio de Vida Silvestre (RVS) em Guararema tem o objetivo de proteger o bicudinho-do-brejo-paulista, o sagui-da-serra-escuro e as demais espécies da fauna e da flora ameaçadas ou não de extinção, além de garantir a manutenção dos recursos hídricos do município.\\nO Instituto Suinã faz parte dessa linda trajetória compondo a equipe técnica por trás da elaboração da proposta de criação da Unidade de Conservação, juntamente com a Prefeitura Municipal de Guararema, a Sociedade para a Conservação das Aves do Brasil – SAVE Brasil e Mosaico Ambiental Ltda.\\nLocalidade: Guararema/SP."
    }
]

print("Baixando e atualizando Fortalecimento...")
for p in fortalecimento:
    new_imgs = []
    for img in p['images']:
        print(f" -> {img}")
        url = baixar_e_subir(img)
        new_imgs.append(url)
    p['images'] = new_imgs

print("Baixando e atualizando Conservação...")
for p in conservacao:
    new_imgs = []
    for img in p['images']:
        print(f" -> {img}")
        url = baixar_e_subir(img)
        new_imgs.append(url)
    p['images'] = new_imgs

# Agora ler o arquivo atual, preservar "educacao" e reescrever as outras chaves.
import ast

with open('src/data/nossoTrabalho.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Extrair a parte de educacao que ja esta correta
educacao_part = text.split("fortalecimento:")[0]

out = educacao_part
out += "fortalecimento: [\n"
for p in fortalecimento:
    out += "    {\n"
    out += f"      title: {repr(p['title'])},\n"
    out += f"      images: {p['images']},\n"
    out += f"      text: {repr(p['text'])}\n"
    out += "    },\n"
out += "  ],\n"

out += "  conservacao: [\n"
for p in conservacao:
    out += "    {\n"
    out += f"      title: {repr(p['title'])},\n"
    out += f"      images: {p['images']},\n"
    out += f"      text: {repr(p['text'])}\n"
    out += "    },\n"
out += "  ],\n"
out += "};\n"

with open('src/data/nossoTrabalho.ts', 'w', encoding='utf-8') as f:
    f.write(out)

print("Dados corrigidos com sucesso!")
