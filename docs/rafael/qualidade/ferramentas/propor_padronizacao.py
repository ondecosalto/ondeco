#!/usr/bin/env python3
"""Sugestoes NAO destrutivas para bairros, vias e telefones; exige aprovacao humana."""
import argparse
import csv
import json
import re
from pathlib import Path

BAIRROS={'Jardim Sao Joao':'Jardim São João','Jardim das Nacoes':'Jardim das Nações',
         'Parque imperial':'Parque Imperial','Santa Lucia':'Santa Lúcia'}

def sugerir(dados):
    saida=[]
    for p in dados:
        ident=p.get('id');bairro=p.get('bairro','');end=p.get('endereco','');tel=p.get('telefone')
        if bairro in BAIRROS:
            saida.append({'id':ident,'campo':'bairro','valor_atual':bairro,'valor_sugerido':BAIRROS[bairro],
                         'motivo':'Acentuacao/capitalizacao sugerida; conferir fonte oficial','decisao':'PENDENTE'})
        if isinstance(end,str):
            proposed=re.sub(r'^R\.\s+', 'Rua ',end)
            proposed=re.sub(r'^Av\.\s+', 'Avenida ',proposed)
            # Somente nos casos onde endereco nao inclui cidade; bairro e campo separado no JSON atual
            if 'Salto' not in proposed and bairro:
                proposed=f'{proposed}, {BAIRROS.get(bairro,bairro)}, Salto - SP'
            if proposed!=end:
                saida.append({'id':ident,'campo':'endereco','valor_atual':end,'valor_sugerido':proposed,
                             'motivo':'Expansao de via e cidade para leitura; nao comprovada como padrao postal','decisao':'PENDENTE'})
        if isinstance(tel,str):
            digits=re.sub(r'\D','',tel)
            fmt=None
            if len(digits)==11 and not digits.startswith('0800'):fmt=f'({digits[:2]}) {digits[2:7]}-{digits[7:]}'
            elif len(digits)==10:fmt=f'({digits[:2]}) {digits[2:6]}-{digits[6:]}'
            elif digits.startswith('0800') and len(digits)==11:fmt=f'{digits[:4]} {digits[4:7]} {digits[7:]}'
            if fmt and fmt!=tel:
                saida.append({'id':ident,'campo':'telefone','valor_atual':tel,'valor_sugerido':fmt,
                             'motivo':'Formatacao textual, sem validacao de existencia da linha','decisao':'PENDENTE'})
    return saida

def main():
    a=argparse.ArgumentParser();a.add_argument('--dados',type=Path,required=True);a.add_argument('--saida',type=Path,required=True)
    v=a.parse_args()
    if v.dados.resolve()==v.saida.resolve():a.error('Saida nao pode sobrescrever o JSON')
    dados=json.loads(v.dados.read_text(encoding='utf-8-sig'))
    rows=sugerir(dados);v.saida.parent.mkdir(parents=True,exist_ok=True)
    with v.saida.open('w',encoding='utf-8-sig',newline='') as f:
        wr=csv.DictWriter(f,fieldnames=['id','campo','valor_atual','valor_sugerido','motivo','decisao'],delimiter=';');wr.writeheader();wr.writerows(rows)
    print(f'{len(rows)} sugestoes; nenhuma aplicada aos dados')
if __name__=='__main__':main()
