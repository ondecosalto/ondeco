# Evolução do módulo de qualidade

## 10/11/2026 — v2 (entrega independente)

- Validador ampliado: checagem de categorias, tipos, números de telefone, links HTTPS, URLs com host permitido, divergências com CSV, ID e endereço, duplicação e pinos próximos.
- Correção de erros defensivos para JSON com raiz inválida e coordenadas não numéricas.
- Exportação automática de auditoria em JSON e CSV por registro.
- Gerador de mapa Leaflet privado com 51 pinos do arquivo de referência e GeoJSON de conferência.
- Checklist manual para confirmar cada endereço e o tipo de telefone.
- Propostas de Title Case, bairros, abreviações de vias e formato de telefone sem sobrescrever nomes comerciais ou o JSON.
- Scripts de execução para Windows e Linux/macOS, e 44 testes de regressão.
- Documentação de fontes, contrato de dados e prevenção de conflitos com o PR de Naomi.

**Sem alterações no site, no `pontos.json` em produção ou na `main`.**
