# Guia de contribuição e workflow — OndEco Salto

Este documento estabelece as diretrizes e padrões de desenvolvimento para a equipe do projeto **OndEco Salto**. Para manter o histórico limpo e a aplicação estável, todos os colaboradores devem seguir este fluxo.

---

## 1. Estrutura de branches

Para evitar conflitos de código, **nunca faça commits diretos na branch `main`**. Cada integrante/sub-equipe deve trabalhar em sua respectiva *feature branch*:

| Integrante / Área | Branch Dedicada | Atribuição Principal |
| :--- | :--- | :--- |
| **Naomi** | `feature/layout-ui` | Design, CSS, HTML e Responsividade |
| **Isael** | `feature/logica-js` | Scripts JS, Algoritmo de Busca e Filtros |
| **Rafael** | `feature/dados-json` | Curadoria e Atualização do `pontos.json` |
| **Henrique** | `feature/docs-readme` | Documentação Técnica e Atualização do README |

---

## 2. Fluxo de trabalho (Workflow)

Ao iniciar uma nova tarefa ou atualização, siga os passos no terminal:

```bash
# 1. Alterne para a sua branch de trabalho
git checkout feature/nome-da-sua-branch

# 2. Faça as alterações necessárias e teste no navegador

# 3. Adicione os arquivos alterados
git add .

# 4. Crie o commit seguindo os padrões do projeto
git commit -m "tipo: descrição curta da alteração"

# 5. Envie a branch para o GitHub
git push origin feature/nome-da-sua-branch
```

Após o envio, abra um **Pull Request (PR)** na interface do GitHub apontando para a branch `main`.

---

## 3. Padrão de commits (Conventional Commits)

Utilizamos mensagens padronizadas para facilitar o rastreamento de melhorias e correções:

* **`feat:`** Adição de nova funcionalidade ou tela.
  * *Exemplo:* `feat: adiciona filtro por categoria de medicamentos`
* **`fix:`** Correção de algum erro ou bug no código/interface.
  * *Exemplo:* `fix: corrige link do Google Maps para o ecoponto Central`
* **`style:`** Alterações visuais no CSS/HTML sem mudar a lógica.
  * *Exemplo:* `style: ajusta espaçamento dos cards para telas mobile`
* **`data:`** Atualizações e adições de dados no banco JSON.
  * *Exemplo:* `data: cadastra 3 novos pontos no bairro Santa Cruz`
* **`docs:`** Alterações na documentação (`README.md`, manuais).
  * *Exemplo:* `docs: atualiza equipe no README`

---

## 4. Boas práticas

1. **Testes Antes do PR:** Sempre valide o funcionamento do código localmente no navegador antes de abrir o Pull Request.
2. **Commits Atômicos:** Faça commits pequenos e focados em uma única tarefa.
3. **Respeito ao Layout Base:** Mantenha os padrões estéticos definidos para o protótipo *Mobile First*.
