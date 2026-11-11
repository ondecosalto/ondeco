# Diagnóstico reproduzível da qualidade do cadastro (10/11/2026)

**Base oficial conferida:** `assets/data/pontos.json` da `main` em 10/11/2026, SHA Git blob `3c1afdf4a602dda4cb8e645862e19d2e22f8ac21`.
**Arquivo de comparação:** proposta de atualização preparada separadamente com 51 coordenadas e contatos; não publicada neste módulo.

| Indicador | `main` | Referência preparada |
|---|---:|---:|
| Registros / IDs únicos | 51 / 51 | 51 / 51 |
| Coordenadas numéricas plausíveis | 1 | 51 |
| Telefones em formato reconhecido | 29 | 51 |
| Links Maps HTTPS reconhecidos | 50 | 51 |
| Nomes totalmente em caixa alta | 22 | 0 |
| Erros no modo de execução | 0 | 0 |
| Alertas com comparação de fontes | 218 | 1 |

As contagens de alertas não equivalem ao número de pontos: um mesmo registro pode gerar mais de um alerta (inclusive um para cada latitude/longitude ausente no controle). O modo `main` é **auditoria**; o modo da referência é **estrito**.

### Observações

- **IDs 21 e 43:** coordenadas separadas por aproximadamente 6 m; verificar se os endereços correspondem aos pinos corretos.
- **IDs 42 e 43:** serviços móveis; não tratar a posição fornecida como localização fixa de entrega.
- **Ecopontos IDs 2 a 12:** contato geral da CSO. **Unidades de saúde 13 a 22:** contatos extraídos da cartilha municipal de 2025 (checar atualidade).
- **ID 36:** link do Maps consta na versão Isabella de 10/11, apesar de ausente no cadastro antigo.
- **29 registros novos:** a fonte documental é o levantamento Isabella. Isso não prova visita independente ou operação do serviço hoje.
- **PR #16:** Naomi modifica `pontos.json` e `main.js`; este diagnóstico não deve sobrescrever seu trabalho.

### Critérios para aprovação futura

- Conferência **visual e nominal** dos pinos usando mapa e checklist.
- Registro da origem e revisão atual dos telefones; diferenciar centrais de estabelecimentos.
- Aplicação de padronização de nomes somente após conferir nome comercial real.
- Reexecutar validador depois dos PRs da equipe e registrar o SHA atualizado.

[PR nº 16](https://github.com/ondecosalto/ondeco/pull/16) · [Fonte Isabella](https://drive.google.com/file/d/11QZJXJ_iqWXLIwHyeH8Jb70_xml7pOSJ/view)
