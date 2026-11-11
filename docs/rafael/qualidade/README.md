# OndEco Salto — qualidade e rastreabilidade dos dados

**Responsável pelo módulo:** Rafael (estrutura e gerenciamento de dados).
**Pesquisa dos 29 locais novos:** Isabella.
**Referência:** 10/11/2026. **Escopo:** só a pasta `docs/rafael/qualidade/`.

## O que este módulo faz

Audita os dados que o site consome **sem modificá-los**: verifica IDs, campos e categorias, nomes em caixa alta, telefones, URLs do Maps, coordenadas, possíveis duplicações e divergências com as fontes documentais. Gera um checklist de campo, propostas de nomes em Title Case e sugestões de padronização de bairros/vias/telefones, relatórios JSON/CSV/Markdown e um **mapa independente** para conferência visual dos pinos.

É um projeto complementar. **Não altera** `assets/data/pontos.json`, `js/main.js`, CSS, HTML, `main` ou os arquivos de outros integrantes. Não é uma ferramenta de geocodificação automática nem substitui a inspeção visual/homologação presencial.

## Conteúdo

| Arquivo | Finalidade |
|---|---|
| `ferramentas/validar_pontos.py` | Valida estrutura, categorias, telefones, URL, mapa e fontes; auditoria e modo estrito |
| `ferramentas/executar_qualidade.py` | Executa a auditoria e gera todos os arquivos auxiliares em outra pasta |
| `ferramentas/padronizar_nomes.py` | Sugere Title Case; **não altera nomes comerciais** |
| `ferramentas/propor_padronizacao.py` | Sugestões de bairros, endereços e formato de telefone, sem gravação no JSON |
| `ferramentas/gerar_mapa_qa.py` | Gera GeoJSON e HTML de mapa privado, com identificação da origem das coordenadas |
| `ferramentas/test_validar_pontos.py` | Testes de regressão e segurança sem dependências externas |
| `ferramentas/executar_auditoria_windows.bat` | Executa um diagnóstico da `main` local no Windows |
| `ferramentas/executar_auditoria_linux.sh` | Mesmo fluxo em Linux/macOS (Python 3 instalado) |
| `dados/controle_fontes.csv` | Rastreabilidade dos 51 registros; 51 linhas e tipos de contato, *sem fingir confirmação em campo* |
| `documentacao/CONTRATO_DADOS.md` | Regras técnicas dos campos de dados |
| `documentacao/GUIA_CONFERENCIA_51.md` | Procedimento de revisão dos endereços e pinos |
| `relatorios/diagnostico_2026-11-10.md` | Fotografia da auditoria na data, com SHA de referência |

## Como executar (Windows)

Com o repositório clonado no computador, abra `docs/rafael/qualidade/ferramentas/executar_auditoria_windows.bat`. Necessário Python 3 instalado. Os resultados aparecerão em `docs/rafael/qualidade/saida_local_nao_publicar`.

## Como executar no terminal

Na raiz do repositório:

```bash
python docs/rafael/qualidade/ferramentas/executar_qualidade.py \
  --dados assets/data/pontos.json \
  --controle docs/rafael/qualidade/dados/controle_fontes.csv \
  --saida docs/rafael/qualidade/saida_local_nao_publicar \
  --modo auditoria
```

Teste:

```bash
python -m unittest discover -s docs/rafael/qualidade/ferramentas -p 'test_*.py' -v
```

Para usar o **arquivo de referência** com as 51 coordenadas, informe seu caminho em `--dados` e use `--modo estrito`. O **JSON de referência não faz parte deste PR**; ele deve continuar separado até revisão com a equipe e PR específico de dados.

## Entendendo os resultados

- **Erro:** problema estrutural ou campo obrigatório ausente; retorno de código `1`.
- **Alerta:** divergência com fonte, pinos muito próximos, dado ausente (em modo auditoria) ou nome com capitalização irregular; revisão necessária.
- **Informativo:** indicação de endereço abreviado e serviço móvel; não é falha.
- **0 alertas não comprova geocodificação correta**. O mesmo vale para telefone com 11 dígitos: só confirma formato, não se a linha atende.
- O arquivo de mapa HTML usa bibliotecas Leaflet e mapas OpenStreetMap por HTTPS; para carregar o mapa é necessária Internet.

## Cuidado com o trabalho dos colegas

O PR [#16 — Naomi](https://github.com/ondecosalto/ondeco/pull/16) modifica `pontos.json` e `main.js`; ele não deve ser substituído ou refeito por este módulo. Execute o validador novamente após a integração do PR, compare o controle com o novo JSON e proponha ajustes **apenas em outro PR de dados**, após combinar com a equipe.

## Referências

- [Levantamento Isabella — 10/11/2026](https://drive.google.com/file/d/11QZJXJ_iqWXLIwHyeH8Jb70_xml7pOSJ/view)
- [Código-fonte oficial](https://github.com/ondecosalto/ondeco)
- [Cartilha municipal de Assistência Farmacêutica — 2025](https://salto.sp.gov.br/wp-content/uploads/2025/06/Cartilha-Acesso-Assistencia-Farmaceutica-2.pdf)
- [CSO Ambiental](https://csoambiental.com.br/)
- [Cáritas](https://caritassalto.org.br/wp-content/uploads/2024/06/2024-Plano-de-Acao-Geral-2024.pdf)

**Nota:** atribuição de fonte documental não equivale a validação de campo. O controle inclui status pendentes para revisão posterior.
