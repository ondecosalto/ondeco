#!/usr/bin/env python3
"""Executa auditoria e produz artefatos revisaveis, sem editar os dados do site."""
import argparse
import csv
import json
from collections import Counter
from pathlib import Path
from urllib.parse import urlencode
from validar_pontos import analisar,ler_controle
from padronizar_nomes import propostas
from propor_padronizacao import sugerir
from gerar_mapa_qa import features,html_mapa


def write_csv(path,fields,rows):
    path.parent.mkdir(parents=True,exist_ok=True)
    with path.open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields,delimiter=';',extrasaction='ignore');w.writeheader();w.writerows(rows)


def fazer_checklist(dados,controle):
    by={int(c['id']):c for c in controle};out=[]
    for p in dados:
        c=by.get(p['id'],{})
        lat=p.get('lat');lng=p.get('lng');presentes=all(isinstance(k,(int,float)) for k in (lat,lng))
        link_coord=f'https://www.google.com/maps/search/?{urlencode({"api":"1","query":f"{lat},{lng}"})}' if presentes else ''
        out.append({'id':p['id'],'nome':p.get('nome',''),'bairro':p.get('bairro',''),
                    'endereco':p.get('endereco',''),'lat_no_json':lat or '', 'lng_no_json':lng or '',
                    'lat_da_referencia':c.get('lat',''),'lng_da_referencia':c.get('lng',''),
                    'fonte_coords':c.get('origem_coordenadas',''),'maps_da_fonte':c.get('link_maps',''),
                    'abrir_coordenadas':link_coord,'tipo_telefone':c.get('tipo_telefone',''),
                    'status_verificacao_visual':c.get('status_conferencia_endereco','Pendente'),
                    'revisao_manual':'PENDENTE','resultado_revisao':'', 'data_revisao':'',
                    'observacoes':c.get('observacoes','')})
    return out


def principal(argv=None):
    pa=argparse.ArgumentParser(description='Gera modulo completo de QA nao destrutivo')
    pa.add_argument('--dados',type=Path,required=True);pa.add_argument('--controle',type=Path,required=True)
    pa.add_argument('--saida',type=Path,required=True);pa.add_argument('--modo',choices=('auditoria','estrito'),default='auditoria')
    pa.add_argument('--referencia',type=Path,default=None)
    a=pa.parse_args();dados=json.loads(a.dados.read_text(encoding='utf-8-sig'))
    controle=ler_controle(a.controle)
    ref=json.loads(a.referencia.read_text(encoding='utf-8-sig')) if a.referencia else None
    if a.saida.resolve() in [a.dados.resolve(),a.controle.resolve()]:pa.error('Saida nao pode ser arquivo de entrada')
    a.saida.mkdir(parents=True,exist_ok=True)
    audit=analisar(dados,a.modo,controle,ref)
    (a.saida/'auditoria.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    write_csv(a.saida/'resumo_registros.csv',['id','nome','bairro','tem_coordenadas','tem_telefone','tem_maps','codigos'],
              [{**r,'codigos':', '.join(r['codigos'])} for r in audit['registros']])
    ps=propostas(dados)
    pad=sugerir(dados)
    write_csv(a.saida/'propostas_padronizacao.csv',['id','campo','valor_atual','valor_sugerido','motivo','decisao'],pad)
    write_csv(a.saida/'propostas_nomes.csv',['id','nome_atual','nome_sugerido','revisao','motivo'],ps)
    checklist=fazer_checklist(dados,controle)
    fields=list(checklist[0]) if checklist else []
    if checklist:write_csv(a.saida/'checklist_pinos.csv',fields,checklist)
    geo=features(dados,controle)
    (a.saida/'pontos_qa.geojson').write_text(json.dumps(geo,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (a.saida/'mapa_conferencia.html').write_text(html_mapa(geo),encoding='utf-8')
    c=Counter(f['properties']['tipo'] for f in geo['features'])
    m=audit['metricas'];diferenca=len(dados)-m['coordenadas_numericas']
    linhas=[
        '# Relatorio gerado automaticamente - OndEco', '',
        '> A auditoria nao realiza visitas nem comprova localizacao exata. A fonte de dados deve ser verificada no mapa e, se necessario, em campo.', '',
        f"- Registros: **{m['registros']}**; IDs unicos: **{m['ids_unicos']}**.",
        f"- Coordenadas plausiveis: **{m['coordenadas_numericas']}**; pendentes: **{diferenca}**.",
        f"- Contatos formatados: **{m['telefones_formatados']}**; links Maps com HTTPS: **{m['links_maps_https']}**.",
        f"- Erros: **{m['erros']}**; alertas: **{m['alertas']}**; informativos: **{m['informativos']}**.",
        f"- Propostas de nomes: **{len(ps)}**; padronizacao de bairros/vias/telefones: **{len(pad)}**; sem modificacoes automaticas.", '',
        '## Proximidade entre pinos'
    ]
    near=[q for q in audit['ocorrencias'] if q['codigo']=='pinos_proximos']
    linhas += ['- '+q['detalhe'] for q in near] or ['- Nenhum par a menos de 15 m.']
    linhas += ['', '## Proximos passos',
              '1. Inspecionar os pinos no mapa de QA, comparando com o endereco e o Maps da fonte.',
              '2. Preencher checklist_pinos.csv com revisao manual, resultados e data.',
              '3. Verificar telefones e distinguir centrais de contatos diretos.',
              '4. Revisar propostas_nomes.csv e obter concordancia para nomes comerciais.',
              '5. Nao substituir assets/data/pontos.json sem reconciliar com o PR de interface da equipe.', '',
              '## Fontes', '- controle_fontes.csv (pesquisa de Isabella, cartilha municipal, contato institucional e base tecnica anterior).',
              '','## Limites', '- Coordenadas plausiveis nao significam pinos homologados.',
              '- Presenca de telefone nao significa contato ativo.',
              '- Mapas dependem de conexao com a Internet para carregar camadas externas.','']
    (a.saida/'resumo.md').write_text('\n'.join(linhas),encoding='utf-8')
    print(json.dumps({'metricas':m,'arquivos_gerados':8,'padronizacoes_sugeridas':len(pad),'pinos_mapa':len(geo['features']),'propostas_nomes':len(ps)},ensure_ascii=False,indent=2))
    return 1 if m['erros'] else 0
if __name__=='__main__':raise SystemExit(principal())
