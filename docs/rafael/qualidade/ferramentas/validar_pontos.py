#!/usr/bin/env python3
"""Auditoria nao destrutiva dos pontos OndEco, apenas biblioteca padrao Python.

Apenas leitura dos arquivos de entrada; nao modifica o arquivo de producao.
Indicadores de completude != verificação cartografica, telefonica ou in loco.
"""
from __future__ import annotations
import argparse
import csv
import json
import math
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

CATEGORIAS = frozenset(('reciclaveis','eletronicos','medicamentos','oleo','pilhas','entulho','outros'))
OBRIGATORIOS = ('id','nome','bairro','categoria','endereco','materiais','horario','categorias')
# Caixa apenas exploratoria (nao representa limite administrativo municipal)
CAIXA_PLAUSIBILIDADE = (-23.50,-23.00,-47.55,-46.95)
URL_HOSTS = frozenset(('maps.app.goo.gl','maps.google.com','www.google.com','google.com'))


def slug(texto):
    s=unicodedata.normalize('NFKD',str(texto or '').casefold())
    s=''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+','',s)


def telefone_digitos(valor):
    return re.sub(r'\D','',valor) if isinstance(valor,str) else ''


def telefone_ok(valor):
    d=telefone_digitos(valor)
    return d.startswith('0800') and len(d)==11 or (len(d) in (10,11) and d[:2] != '00')


def url_maps_ok(url):
    if not isinstance(url,str) or not url.strip():return False
    try:
        x=urlparse(url)
        return x.scheme=='https' and x.hostname in URL_HOSTS and bool(x.path.strip('/')) and not x.username and not x.password
    except (ValueError, TypeError):return False


def ponto_valido_geo(p):
    lat,lng=p.get('lat'),p.get('lng')
    return (all(isinstance(z,(float,int)) and not isinstance(z,bool) and math.isfinite(z) for z in (lat,lng)))


def metros(a,b):
    y1,x1,y2,x2=map(math.radians,(a['lat'],a['lng'],b['lat'],b['lng']))
    delta_lat=y2-y1;delta_lng=x2-x1
    h=math.sin(delta_lat/2)**2+math.cos(y1)*math.cos(y2)*math.sin(delta_lng/2)**2
    return 6371000.0*2*math.atan2(math.sqrt(h),math.sqrt(max(0,1-h)))


def ler_controle(arquivo):
    with Path(arquivo).open('r',encoding='utf-8-sig',newline='') as f:
        rd=csv.DictReader(f,delimiter=';')
        if not rd.fieldnames or 'id' not in rd.fieldnames:
            raise ValueError('Controle deve ser CSV delimitado por ; com coluna id')
        return list(rd)


def analisar(registros,modo='auditoria',controle=None,referencia=None):
    """Retorna relatorio JSON-serializavel, sem modificar registros. Dois modos: auditoria e estrito."""
    if modo not in ('auditoria','estrito'):raise ValueError('modo invalido')
    ocorrencias=[]; linhas=[]
    def item(nivel,codigo,ident=None,detalhe=''):
        ocorrencias.append({'nivel':nivel,'codigo':codigo,'id':ident,'detalhe':str(detalhe)})
    if not isinstance(registros,list):
        item('erro','raiz_nao_lista',None,'Esperada lista de objetos')
        return {'modo':modo,'total':0,'metricas':{'erros':1,'alertas':0,'informativos':0},'ocorrencias':ocorrencias,'registros':[]}
    ids=set();nome_enderecos=defaultdict(list);geo=[];cnt=Counter();no_maps=[]
    for pos,o in enumerate(registros,1):
        if not isinstance(o,dict):
            item('erro','registro_nao_objeto',None,f'Posicao {pos}');continue
        ident=o.get('id');codigos=[]
        def flag(nivel,codigo,d=''):
            item(nivel,codigo,ident,d);codigos.append(codigo)
        if type(ident) is not int or ident<1:flag('erro','id_invalido',f'posicao {pos}')
        elif ident in ids:flag('erro','id_duplicado')
        else:ids.add(ident)
        for chave in OBRIGATORIOS:
            val=o.get(chave)
            if val is None or val=='' or val==[]:flag('erro','campo_obrigatorio_ausente',chave)
        for chave in ('nome','bairro','categoria','endereco','materiais','horario'):
            if chave in o and not isinstance(o[chave],str):flag('erro','tipo_invalido',chave)
            if isinstance(o.get(chave),str) and o[chave] != o[chave].strip():flag('alerta','espacos_externos',chave)
        cats=o.get('categorias')
        if not isinstance(cats,list):flag('erro','categorias_tipo_invalido')
        else:
            if any(not isinstance(c,str) or c not in CATEGORIAS for c in cats):flag('erro','categoria_desconhecida',str(cats))
            if len(cats)!=len(set(str(c) for c in cats)):flag('alerta','categorias_repetidas')
            if o.get('categoria') not in cats:flag('alerta','categoria_principal_fora_da_lista')
        if isinstance(o.get('categoria'),str) and o['categoria'] not in CATEGORIAS:flag('erro','categoria_principal_desconhecida')
        if isinstance(o.get('nome'),str) and o['nome'].isupper() and any(c.isalpha() for c in o['nome']):flag('alerta','nome_em_caixa_alta')
        nome=o.get('nome','');end=o.get('endereco','')
        if isinstance(nome,str) and isinstance(end,str) and nome and end:
            # Nomes repetidos de redes de farmacia nao sao duplicidade se enderecos diferentes
            nome_enderecos[(slug(nome),slug(end))].append(ident)
        if ponto_valido_geo(o):
            ymin,ymax,xmin,xmax=CAIXA_PLAUSIBILIDADE
            if not ymin<=o['lat']<=ymax or not xmin<=o['lng']<=xmax:flag('erro','coordenada_fora_faixa',f"{o['lat']}, {o['lng']}")
            else:cnt['coordenadas_validas']+=1;geo.append(o)
        else:flag('erro' if modo=='estrito' else 'alerta','coordenadas_ausentes_ou_invalidas')
        telefone=o.get('telefone')
        if telefone_ok(telefone):
            cnt['telefones_validos']+=1
            if isinstance(telefone,str) and telefone.startswith('0800') and not o.get('tipo_telefone'):
                flag('alerta','central_sem_identificacao','Numero geral precisa ser explicitado')
        else:flag('erro' if modo=='estrito' else 'alerta','telefone_ausente_ou_invalido')
        if url_maps_ok(o.get('link_maps')):cnt['links_maps']+=1
        else:flag('erro' if modo=='estrito' else 'alerta','link_maps_ausente_ou_invalido');no_maps.append(ident)
        if re.search(r'\bmovel\b|\bmóvel\b',str(nome),re.I) and not o.get('observacao_servico'):
            flag('info','servico_movel_exige_aviso','Referencia de endereco nao corresponde a localizacao em tempo real')
        if isinstance(o.get('endereco'),str) and o['endereco'] and not re.search(r'\bSalto\b',o['endereco'],re.I):
            flag('info','endereco_curto','Bairro separado em campo bairro; ver exibicao no cartao')
        linhas.append({'id':ident,'nome':nome,'bairro':o.get('bairro'),'tem_coordenadas':ponto_valido_geo(o),
                      'tem_telefone':telefone_ok(telefone),'tem_maps':url_maps_ok(o.get('link_maps')),'codigos':codigos})
    for chave,lista in nome_enderecos.items():
        if len(lista)>1:item('alerta','duplicacao_nome_endereco',lista[0],f'IDs: {lista}')
    for i,a in enumerate(geo):
        for b in geo[i+1:]:
            d=metros(a,b)
            if d<15:
                item('alerta','pinos_proximos',a['id'],f"ID {a['id']} e {b['id']}: {d:.1f} m; nao significa duplicidade")
    if controle is not None:
        controle_por_id={}
        for linha in controle:
            try:ident=int(linha['id'])
            except (KeyError,ValueError,TypeError):item('erro','controle_id_invalido',None,str(linha)[:80]);continue
            if ident in controle_por_id:item('erro','controle_id_duplicado',ident)
            controle_por_id[ident]=linha
        for o in registros:
            if not isinstance(o,dict) or type(o.get('id')) is not int:continue
            ident=o['id'];c=controle_por_id.get(ident)
            if c is None:item('alerta','sem_controle',ident);continue
            if c.get('nome') and slug(c['nome']) != slug(o.get('nome')):item('alerta','nome_diverge_controle',ident)
            for k in ('lat','lng'):
                if c.get(k,'').strip():
                    try:
                        if not math.isclose(float(c[k]),float(o.get(k)),abs_tol=0.000001,rel_tol=0):
                            item('alerta','coordenada_diverge_controle',ident,k)
                    except (ValueError,TypeError):item('alerta','coordenada_ausente_para_comparacao',ident,k)
            if c.get('telefone') and telefone_digitos(c['telefone'])!=telefone_digitos(o.get('telefone')):item('alerta','telefone_diverge_controle',ident)
            if c.get('link_maps') and c['link_maps']!=o.get('link_maps'):item('alerta','url_diverge_controle',ident)
        for ident in sorted(controle_por_id.keys()-ids):item('alerta','linha_controle_sem_registro',ident)
    if referencia is not None:
        if not isinstance(referencia,list):item('erro','referencia_nao_lista')
        else:
            por_id={o.get('id'):o for o in referencia if isinstance(o,dict) and type(o.get('id')) is int}
            for o in registros:
                if not isinstance(o,dict) or type(o.get('id')) is not int:continue
                b=por_id.get(o['id'])
                if not b:item('alerta','id_inexistente_referencia',o['id']);continue
                for field in ('endereco','bairro','materiais','horario','categoria','categorias'):
                    if o.get(field)!=b.get(field):item('alerta','campo_alterado_desde_referencia',o['id'],field)
    counts=Counter(x['nivel'] for x in ocorrencias)
    status=dict(registros=len(registros),ids_unicos=len(ids),coordenadas_numericas=cnt['coordenadas_validas'],
                telefones_formatados=cnt['telefones_validos'],links_maps_https=cnt['links_maps'],
                nomes_em_caixa_alta=sum('nome_em_caixa_alta' in r['codigos'] for r in linhas),
                erros=counts['erro'],alertas=counts['alerta'],informativos=counts['info'])
    return {'modo':modo,'total':len(registros),'metricas':status,'ocorrencias':ocorrencias,'registros':linhas,
            'metodologia':'Auditoria de estrutura, fontes e plausibilidade; NAO atesta posicao exata, servico, horario ou atualidade do contato.'}


def main(argv=None):
    p=argparse.ArgumentParser(description='OndEco - auditoria nao destrutiva de pontos.json')
    p.add_argument('--dados',required=True,type=Path);p.add_argument('--controle',type=Path)
    p.add_argument('--referencia',type=Path);p.add_argument('--modo',choices=('auditoria','estrito'),default='auditoria')
    p.add_argument('--saida',type=Path,help='JSON de auditoria; NUNCA o mesmo caminho de --dados')
    p.add_argument('--csv',type=Path,help='Resumo por registro')
    a=p.parse_args(argv)
    try:
        if a.saida and a.saida.resolve()==a.dados.resolve():raise ValueError('Nao sobrescrever arquivo de entrada')
        if a.csv and a.csv.resolve()==a.dados.resolve():raise ValueError('Nao sobrescrever arquivo de entrada')
        data=json.loads(a.dados.read_text(encoding='utf-8-sig'))
        ctrl=ler_controle(a.controle) if a.controle else None
        ref=json.loads(a.referencia.read_text(encoding='utf-8-sig')) if a.referencia else None
        result=analisar(data,a.modo,ctrl,ref)
        if a.saida:a.saida.parent.mkdir(parents=True,exist_ok=True);a.saida.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        if a.csv:
            a.csv.parent.mkdir(parents=True,exist_ok=True)
            with a.csv.open('w',encoding='utf-8-sig',newline='') as f:
                w=csv.DictWriter(f,fieldnames=['id','nome','bairro','tem_coordenadas','tem_telefone','tem_maps','codigos'],delimiter=';')
                w.writeheader();w.writerows({**r,'codigos':', '.join(r['codigos'])} for r in result['registros'])
        print(json.dumps(result['metricas'],ensure_ascii=False,indent=2))
        return 1 if result['metricas']['erros'] else 0
    except (OSError,ValueError,UnicodeError,json.JSONDecodeError,csv.Error) as e:
        print(f'ERRO DE ENTRADA: {e}',file=sys.stderr);return 2

if __name__=='__main__':sys.exit(main())
