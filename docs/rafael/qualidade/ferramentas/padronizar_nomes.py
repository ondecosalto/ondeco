#!/usr/bin/env python3
"""Gera propostas de Title Case; nao altera pontos.json nem nomes comerciais automaticamente."""
import argparse
import csv
import json
import re
from pathlib import Path

CONEXOES={'de','do','da','dos','das','e','em','no','na','para'}
SIGLAS={'jc':'JC','fp':'FP','cl':'CL','ii':'II','iii':'III','iv':'IV','v':'V','dvd':'DVD','cd':'CD'}

def sugestao_nome(nome):
    palavras=re.split(r'(\s+|[-–—/&()])',nome)
    saida=[]
    for idx,p in enumerate(palavras):
        if not p or not any(c.isalpha() for c in p):saida.append(p);continue
        k=p.casefold();isfirst=not any(c.isalpha() for c in ''.join(saida))
        if k in SIGLAS:v=SIGLAS[k]
        elif k in CONEXOES and not isfirst:v=k
        elif re.match(r'^\d+[a-zA-Z]*$',p):v=p
        else:v=p[0].upper()+p[1:].lower()
        saida.append(v)
    return ''.join(saida)

def propostas(dados):
    out=[]
    for p in dados:
        original=p.get('nome','');new=sugestao_nome(original)
        if new!=original:
            out.append({'id':p.get('id'),'nome_atual':original,'nome_sugerido':new,
                        'revisao':'PENDENTE: verificar nome comercial na fonte',
                        'motivo':'Padronizacao de apresentacao; nenhuma alteracao aplicada'})
    return out

def main():
    p=argparse.ArgumentParser();p.add_argument('--dados',required=True,type=Path);p.add_argument('--saida',required=True,type=Path)
    a=p.parse_args();d=json.loads(a.dados.read_text(encoding='utf-8-sig'))
    if a.dados.resolve()==a.saida.resolve():p.error('Saida nao pode ser o JSON de origem')
    rows=propostas(d);a.saida.parent.mkdir(parents=True,exist_ok=True)
    with a.saida.open('w',encoding='utf-8-sig',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=['id','nome_atual','nome_sugerido','revisao','motivo'],delimiter=';');writer.writeheader();writer.writerows(rows)
    print(f'{len(rows)} sugestoes; o JSON de origem nao foi alterado')
if __name__=='__main__':main()
