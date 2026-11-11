#!/usr/bin/env python3
"""Gera GeoJSON + mapa de QA isolado em HTML; nao altera mapa publico Leaflet."""
import argparse
import html
import json
import math
from pathlib import Path
from urllib.parse import quote


def features(dados,controle):
    idx={int(x['id']):x for x in controle}
    out=[]
    for p in dados:
        x=p.get('lat');y=p.get('lng')
        if not all(isinstance(k,(int,float)) and not isinstance(k,bool) and math.isfinite(k) for k in (x,y)):continue
        ref=idx.get(p.get('id'),{})
        out.append({'type':'Feature','geometry':{'type':'Point','coordinates':[y,x]},'properties':{
            'id':p.get('id'),'nome':p.get('nome'),'bairro':p.get('bairro'),'endereco':p.get('endereco'),
            'tipo':p.get('tipo_ponto'),'link_maps':p.get('link_maps'),
            'origem_coordenadas':ref.get('origem_coordenadas','Nao informada'),
            'verificacao_visual':ref.get('status_conferencia_endereco','PENDENTE'),
            'telefone_tipo':ref.get('tipo_telefone','Nao informado'),
            'servico_movel': 'móvel' in p.get('nome','').casefold()}}
        )
    return {'type':'FeatureCollection','features':out}


def html_mapa(geojson):
    # JSON embutido como texto, com caracteres escapados para evitar injeção em <script>.
    texto=json.dumps(geojson,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
    return r'''<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OndEco | conferência de pinos (não oficial)</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoTOSYUQGfZcM=" crossorigin="">
<style>body{margin:0;font:15px system-ui;color:#19352d;background:#f3f7f4}header{padding:14px 20px;background:#164d39;color:white}h1{font-size:20px;margin:0 0 6px}small{opacity:.9}main{display:grid;grid-template-columns:minmax(300px,1fr) minmax(320px,2fr);height:calc(100vh - 102px)}#lista{overflow:auto;padding:12px 18px}.item{border:1px solid #d4e4db;padding:10px;margin:8px 0;background:white;border-radius:9px;cursor:pointer}.item:hover{background:#e8f1ec}.sub{font-size:12px;color:#45665c}#mapa{min-height:450px}.alerta{padding:10px;background:#fff6dd;color:#59420e}button{padding:8px;background:#14543e;color:white;border:0;border-radius:6px;cursor:pointer}@media(max-width:800px){main{display:block;height:auto}#mapa{height:65vh}#lista{max-height:35vh}}a{color:#166e50}</style>
</head><body><header><h1>Conferência de coordenadas — OndEco (prévia interna)</h1><small>Visualização independente: não modifica o site. Coordenada plausível não equivale a endereço homologado.</small></header>
<div class="alerta">Consulte o endereço e o Google Maps antes de marcar um pino como verificado. Serviços móveis mostram apenas um endereço de referência.</div>
<main><section id="lista" aria-label="Lista de pontos"></section><section id="mapa" aria-label="Mapa de pontos"></section></main>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>const fonte=__DADOS__;
const lista=document.getElementById('lista');const mapa=L.map('mapa').setView([-23.198,-47.28],12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(mapa);
const marcadores=[];const bounds=[];function el(tag,txt,cls){const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;if(cls)e.className=cls;return e}
for(const f of fonte.features){const p=f.properties,coord=f.geometry.coordinates;
const marker=L.marker([coord[1],coord[0]]).addTo(mapa);bounds.push([coord[1],coord[0]]);
const box=document.createElement('div');box.appendChild(el('strong',`ID ${p.id} — ${p.nome}`));box.appendChild(el('p',p.endereco+', '+p.bairro));box.appendChild(el('p','Origem: '+p.origem_coordenadas));box.appendChild(el('p','Situação: '+p.verificacao_visual));
if(p.servico_movel)box.appendChild(el('strong','Serviço móvel — endereço de referência'));
if(typeof p.link_maps==='string' && /^https:\/\/(maps\.app\.goo\.gl|maps\.google\.com|google\.com|www\.google\.com)\//.test(p.link_maps)){const a=document.createElement('a');a.textContent='Conferir no Google Maps';a.href=p.link_maps;a.target='_blank';a.rel='noopener noreferrer';box.appendChild(a)}
marker.bindPopup(box);marcadores.push(marker);
const card=el('article',undefined,'item');card.appendChild(el('strong',`#${p.id} — ${p.nome}`));card.appendChild(el('div',p.bairro+' | '+p.tipo,'sub'));card.addEventListener('click',()=>{mapa.setView([coord[1],coord[0]],17);marker.openPopup()});lista.appendChild(card)}
if(bounds.length)mapa.fitBounds(bounds,{padding:[20,20]});
</script></body></html>'''.replace('__DADOS__',texto)


def main():
    import csv
    pa=argparse.ArgumentParser();pa.add_argument('--dados',type=Path,required=True);pa.add_argument('--controle',type=Path,required=True)
    pa.add_argument('--geojson',type=Path,required=True);pa.add_argument('--html',type=Path,required=True)
    a=pa.parse_args();reg=json.loads(a.dados.read_text(encoding='utf-8-sig'))
    with a.controle.open(encoding='utf-8-sig',newline='') as f:ctrl=list(csv.DictReader(f,delimiter=';'))
    geo=features(reg,ctrl)
    for out,content in [(a.geojson,json.dumps(geo,ensure_ascii=False,indent=2)+'\n'),(a.html,html_mapa(geo))]:
        if out.resolve()==a.dados.resolve():pa.error('Nao sobrescrever JSON')
        out.parent.mkdir(parents=True,exist_ok=True);out.write_text(content,encoding='utf-8')
    print(f"{len(geo['features'])} pinos na prévia independente; nenhuma alteracao no site")
if __name__=='__main__':main()
