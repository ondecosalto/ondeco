"""Testes isolados; nenhuma alteracao no repositório ou no JSON original."""
import copy
import importlib.util
import unittest
from pathlib import Path


def load(name):
    path=Path(__file__).with_name(name+'.py');spec=importlib.util.spec_from_file_location(name,path)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

val=load('validar_pontos');nom=load('padronizar_nomes');mp=load('gerar_mapa_qa');pad=load('propor_padronizacao')
B={'id':1,'nome':'Ecoponto Exemplo','bairro':'Centro','categoria':'reciclaveis','endereco':'Rua Exemplo, 100, Salto - SP',
   'materiais':'Reciclaveis','horario':'Seg a Sab','categorias':['reciclaveis'],'lat':-23.2,'lng':-47.3,
   'telefone':'(11) 4028-0000','link_maps':'https://maps.app.goo.gl/exemplo','tipo_ponto':'Ecoponto'}

class TestValidacao(unittest.TestCase):
    def codes(self,r):return [x['codigo'] for x in r['ocorrencias']]
    def test_basico_estrito(self):self.assertEqual(val.analisar([B],'estrito')['metricas']['erros'],0)
    def test_leitura_sem_mutacao(self):
        o=copy.deepcopy(B);val.analisar([o]);self.assertEqual(o,B)
    def test_raiz_objeto_em_vez_de_lista(self):self.assertIn('raiz_nao_lista',self.codes(val.analisar({'id':1})))
    def test_raiz_numero(self):self.assertIn('raiz_nao_lista',self.codes(val.analisar(7)))
    def test_registro_nao_objeto(self):self.assertIn('registro_nao_objeto',self.codes(val.analisar([None])))
    def test_id_repetido(self):self.assertIn('id_duplicado',self.codes(val.analisar([B,dict(B)])))
    def test_id_booleano(self):self.assertIn('id_invalido',self.codes(val.analisar([{**B,'id':True}])))
    def test_id_negativo(self):self.assertIn('id_invalido',self.codes(val.analisar([{**B,'id':-2}])))
    def test_campo_obrigatorio(self):self.assertIn('campo_obrigatorio_ausente',self.codes(val.analisar([{**B,'nome':''}])))
    def test_categoria_invalida(self):self.assertIn('categoria_desconhecida',self.codes(val.analisar([{**B,'categorias':['nao existe']}])))
    def test_categorias_repetidas(self):self.assertIn('categorias_repetidas',self.codes(val.analisar([{**B,'categorias':['reciclaveis','reciclaveis']}])))
    def test_categoria_principal_fora(self):self.assertIn('categoria_principal_fora_da_lista',self.codes(val.analisar([{**B,'categorias':['outros']}])))
    def test_lat_bool(self):self.assertIn('coordenadas_ausentes_ou_invalidas',self.codes(val.analisar([{**B,'lat':True}])))
    def test_lat_nan(self):self.assertIn('coordenadas_ausentes_ou_invalidas',self.codes(val.analisar([{**B,'lat':float('nan')}])))
    def test_lat_texto(self):self.assertIn('coordenadas_ausentes_ou_invalidas',self.codes(val.analisar([{**B,'lat':'-23.20'}])))
    def test_lat_fora_faixa(self):self.assertIn('coordenada_fora_faixa',self.codes(val.analisar([{**B,'lat':1.0}])))
    def test_estrito_sem_lng_bloqueia(self):
        self.assertGreater(val.analisar([{k:v for k,v in B.items() if k!='lng'}],'estrito')['metricas']['erros'],0)
    def test_auditoria_sem_lng_alerta(self):
        r=val.analisar([{k:v for k,v in B.items() if k!='lng'}]);self.assertEqual(r['metricas']['erros'],0);self.assertGreater(r['metricas']['alertas'],0)
    def test_telefone_central(self):self.assertTrue(val.telefone_ok('0800 940 3203'))
    def test_telefone_curto(self):self.assertIn('telefone_ausente_ou_invalido',self.codes(val.analisar([{**B,'telefone':'123'}])))
    def test_telefone_central_sem_tipo(self):self.assertIn('central_sem_identificacao',self.codes(val.analisar([{**B,'telefone':'0800 940 3203'}])))
    def test_telefone_central_com_tipo(self):self.assertNotIn('central_sem_identificacao',self.codes(val.analisar([{**B,'telefone':'0800 940 3203','tipo_telefone':'central'}])))
    def test_url_http(self):self.assertFalse(val.url_maps_ok('http://maps.app.goo.gl/abc'))
    def test_url_host_malicioso(self):self.assertFalse(val.url_maps_ok('https://maps.app.goo.gl.evil.test/p'))
    def test_url_dominio_aceito(self):self.assertTrue(val.url_maps_ok('https://maps.app.goo.gl/x'))
    def test_url_vazia(self):self.assertFalse(val.url_maps_ok(None))
    def test_rede_farmacia_outra_filial(self):
        p={**B,'id':2,'endereco':'Rua Outra, 200, Salto - SP'}
        self.assertNotIn('duplicacao_nome_endereco',self.codes(val.analisar([B,p])))
    def test_duplicacao_mesmo_nome_endereco(self):
        p={**B,'id':2,'nome':'ECOPONTO EXEMPLO'}
        self.assertIn('duplicacao_nome_endereco',self.codes(val.analisar([B,p])))
    def test_pinos_proximos_alerta_nao_erro(self):
        p={**B,'id':2,'lat':B['lat']+0.00002,'endereco':'Rua Distinta'}
        r=val.analisar([B,p]);self.assertIn('pinos_proximos',self.codes(r));self.assertEqual(r['metricas']['erros'],0)
    def test_csv_controle_divergencia(self):
        ctr=[{'id':'1','lat':'-23.3','lng':'-47.3','telefone':'(11) 99999-9999','link_maps':B['link_maps']}]
        r=val.analisar([B],controle=ctr);self.assertIn('coordenada_diverge_controle',self.codes(r));self.assertIn('telefone_diverge_controle',self.codes(r))
    def test_controle_id_sobra(self):
        r=val.analisar([B],controle=[{'id':'1'},{'id':'99'}]);self.assertIn('linha_controle_sem_registro',self.codes(r))
    def test_referencia_nao_lista(self):self.assertIn('referencia_nao_lista',self.codes(val.analisar([B],referencia={})))
    def test_versao_diferente_referencia(self):
        ref=[{**B,'materiais':'Outro'}];self.assertIn('campo_alterado_desde_referencia',self.codes(val.analisar([B],referencia=ref)))
    def test_normalizador_siglas(self):self.assertEqual(nom.sugestao_nome('FP borracharia'),'FP Borracharia')
    def test_normalizador_preposicao(self):self.assertEqual(nom.sugestao_nome('POSTO DE SAÚDE NAÇÕES'),'Posto de Saúde Nações')
    def test_normalizador_ii(self):self.assertEqual(nom.sugestao_nome('CENTRO DE SAÚDE II'),'Centro de Saúde II')
    def test_nao_muda_json_ao_propor(self):
        o=copy.deepcopy(B);nom.propostas([o]);self.assertEqual(o,B)
    def test_geojson_estrutura(self):
        geo=mp.features([B],[{'id':'1','origem_coordenadas':'Fonte','status_conferencia_endereco':'pendente'}])
        self.assertEqual(len(geo['features']),1);self.assertEqual(geo['features'][0]['geometry']['coordinates'],[-47.3,-23.2])
    def test_geojson_nao_inclui_sem_coordenadas(self):
        geo=mp.features([{k:v for k,v in B.items() if k!='lat'}],[{'id':'1'}]);self.assertEqual(len(geo['features']),0)
    def test_html_escape_script(self):
        p={**B,'nome':'<script>alert(1)</script>'}
        h=mp.html_mapa(mp.features([p],[{'id':'1'}]));self.assertNotIn('<script>alert(1)</script>',h)
    def test_html_usa_textcontent(self):self.assertIn('textContent=txt',mp.html_mapa(mp.features([B],[{'id':'1'}])))
    def test_proposta_bairro_sem_mutacao(self):
        o={**B,'bairro':'Jardim Sao Joao'};r=pad.sugerir([o]);self.assertTrue(any(x['valor_sugerido']=='Jardim São João' for x in r));self.assertEqual(o['bairro'],'Jardim Sao Joao')
    def test_nao_inventar_telefone(self):
        o={**B};o.pop('telefone');self.assertFalse(any(x['campo']=='telefone' for x in pad.sugerir([o])))
    def test_endereco_completo_preservado(self):
        self.assertFalse(any(x['campo']=='endereco' for x in pad.sugerir([B])))
if __name__=='__main__':unittest.main()
