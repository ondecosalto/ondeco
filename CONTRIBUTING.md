# Guia de contribuição e workflow — OndEco Salto

Este documento estabelece as diretrizes e padrões de desenvolvimento para a equipe do projeto **OndEco Salto**. Para manter o histórico limpo e a aplicação estável, todos os colaboradores devem seguir este fluxo.

---

## 1. Estrutura e Nomenclatura de Branches

Para manter o histórico organizado e evitar conflitos, **nunca faça commits diretos na branch `main`**. 

Cada nova tarefa ou correção deve ser desenvolvida em uma **branch dedicada e temporária**, criada a partir da `main` atualizada. Após o *Pull Request* ser aprovado e integrado à `main`, essa branch cumpre seu papel.

Usamos a seguinte convenção para dar nome às branches:

| Prefixo / Padrão | Responsável / Área Principal | Exemplo de Nome da Branch |
| :--- | :--- | :--- |
| `feature/` | **Naomi** (Design, UI, CSS, Responsividade) | `feature/identidade-visual`, `feature/acessibilidade-menu` |
| `feature/` | **Isael** (Lógica JS, Filtros, Integração) | `feature/busca-acentos`, `feature/valida-link-maps` |
| `data/` ou `feature/` | **Rafael** (Dados, Curadoria do JSON) | `data/pontos-coleta-salto`, `data/atualiza-horarios` |
| `docs/` ou `feature/` | **Henrique** (Documentação, README, Guias) | `docs/methodology`, `docs/atualiza-status-readme` |
| `fix/` | **Todos** (Correções rápidas de bugs) | `fix/caminho-logo`, `fix/erro-select-html` |

> **Regra Básica:** Sempre crie sua branch com um nome descritivo do que está sendo feito (ex: `feature/ajuste-cores` ou `fix/link-quebrado`). Nunca reutilize uma branch que já teve seu PR aprovado e fechado!

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

---

## 5. Guia Prático: Como atualizar o README

Para manter o arquivo atualizado, a equipe utilizará **apenas duas seções**:

1. **Na Seção `Status Atual do Projeto`:**
   - **Para marcar como concluído:** Mude `- [ ]` para `- [x]`.
   - **Para atualizar a data:** Altere o valor de `Última Atualização: DD/MM/AAAA`.
2. **Na Seção `Histórico de Atualizações (Changelog)`:**
   - Adicione uma nova linha no topo da lista a cada grande atualização ou *PR* aprovada:
     ```markdown
     - **DD/MM/AAAA:** Descrição curta da melhoria efetuada (Nome do Membro).
     ```

