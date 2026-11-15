# ondEco Salto — Mapeamento de Resíduos e Pontos de Descarte Ecológico

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-green)
![Curso](https://img.shields.io/badge/Curso-ADS%20IFSP%20Salto-blue)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-orange)

> **Projeto de Extensão Acadêmica** desenvolvido pelos alunos do curso de Análise e Desenvolvimento de Sistemas (ADS) do **Instituto Federal de São Paulo (IFSP) — Campus Salto**.

---

## Status Atual do Projeto

> **Versão:** 2 (mobile-first, mapa interativo e base de 51 pontos)
> **Última Atualização:** 13/11/2026

- [x] **Arquitetura Base:** HTML5 semântico, CSS3 e JavaScript organizados em `css/`, `js/` e `assets/`.
- [x] **Acessibilidade Digital:** WCAG 2.1 AA / e-MAG (unidades `rem`, *Skip Link*, `.sr-only`, foco visível, `aria-pressed` e `aria-live`).
- [x] **Mobile First & Layout:** Layout responsivo com breakpoints em 600, 768 e 1024 px, *skeleton cards* e botão de voltar ao topo.
- [x] **Mapa Interativo:** Leaflet + OpenStreetMap com marcadores, popups e modal de detalhes.
- [x] **Base de Dados:** `assets/data/pontos.json` com **51 pontos**, todos com coordenadas e telefone.
- [x] **Busca e Filtros (JS):** Busca unificada com normalização de acentos e filtros por categoria.
- [x] **Segurança dos Dados:** Renderização com `textContent` (sem `innerHTML`) e valores padrão para campos ausentes.
- [ ] **Deploy e Release:** Confirmar a publicação no GitHub Pages e marcar a tag `v2.0.0`.
- [ ] **Testes de Usabilidade:** Validação com moradores de Salto (equipe de Doc & QA).

> Veja o relatório completo em [RELATORIO_EVOLUCAO_V2.md](RELATORIO_EVOLUCAO_V2.md).

---

## Sobre o Projeto

O **ondEco Salto** é uma solução web *Mobile First* desenvolvida para facilitar a localização e o descarte correto de resíduos na cidade de Salto (SP). A plataforma mapeia ecopontos municipais, borracharias, farmácias e unidades de saúde que recebem materiais, bazares e outros pontos de coleta de recicláveis, eletrônicos, óleo de cozinha, medicamentos e pilhas.

### Principais Funcionalidades
- **Mapa Interativo:** Pontos de descarte marcados no mapa de Salto; ao clicar em um marcador, abre-se o modal com os detalhes.
- **Busca Textual Inteligente:** Filtragem por nome, bairro, endereço, material ou categoria, com normalização de acentos.
- **Filtros por Categoria:** Recicláveis, Eletrônicos, Pilhas e baterias, Óleo, Medicamentos e Outros, combináveis com a busca.
- **Detalhes do Ponto:** Endereço, bairro, telefone (link `tel:`), horário de funcionamento, materiais aceitos e rota no **Google Maps** com um clique.
- **Carregamento Suave:** *Skeleton cards*, rolagem suave até os resultados no celular e mensagens amigáveis em caso de erro.
- **Arquitetura Serverless:** Execução 100% *client-side*, sem servidor *back-end*.

---

## Acessibilidade e Inclusão Digital (WCAG 2.1 AA / e-MAG)

A interface do ondEco Salto foi projetada sob as diretrizes de acessibilidade do Governo Federal (e-MAG) e da W3C:
* **Escalabilidade (`rem`):** Dimensionamento relativo para suportar zoom nativo de navegador sem quebra de *layout*.
* **Navegação por Teclado:** `:focus-visible` destacado e fechamento dos modais com a tecla `Esc`.
* **Atalho de Conteúdo (*Skip Link*):** Mecanismo para saltar o cabeçalho e ir direto ao conteúdo principal.
* **Suporte a Leitores de Tela:** Rótulos ocultos via `.sr-only`, `aria-label` nos botões dos cards, `aria-pressed` nas categorias e `aria-live="polite"` na lista de resultados.

---

## Tecnologias Utilizadas

- **HTML5:** Estrutura semântica e acessível.
- **CSS3:** Design responsivo *Mobile First*.
- **JavaScript (ES6+):** Manipulação de DOM, `Fetch API`, busca e filtros.
- **Leaflet 1.9.4 + OpenStreetMap:** Mapa interativo (carregado por CDN).
- **JSON:** Base de dados estática e leve (`assets/data/pontos.json`).
- **GitHub Pages:** Hospedagem.

---

## Estrutura do Repositório

```text
ondeco/
├── index.html
├── css/style.css
├── js/main.js
├── assets/
│   ├── data/pontos.json
│   └── img/              # logo, favicons e ícones
├── CONTRIBUTING.md       # fluxo de branches e commits
├── METHODOLOGY.md        # metodologia de desenvolvimento
└── RELATORIO_EVOLUCAO_V2.md
```

---

## Equipe de Desenvolvimento

| Sub-equipe | Membros | Papel Principal |
| :--- | :--- | :--- |
| **Front-End & Lógica** | Naomi & Isael | UI/Layout, Estilização e Algoritmo de Busca em JS |
| **Pesquisa de Dados** | Isabella & Rafael | Mapeamento Local e Curadoria de Dados (`pontos.json`) |
| **Doc & QA** | Patrícia, Henrique & Brenda | Relatório Acadêmico, Testes de Usabilidade e Mídia |
| **Gestão de Projeto** | Sarah | Liderança, Cronograma e Articulação de Extensão |

---

## Normas e Conformidade Legal

O projeto está enquadrado nas diretrizes de extensão universitária do Ministério da Educação (**Resolução CNE/CES nº 7/2018**) e fundamentado na **Política Nacional de Resíduos Sólidos (PNRS - Lei nº 12.305/2010)**.

---

## Instituição

**Instituto Federal de Educação, Ciência e Tecnologia de São Paulo (IFSP) — Câmpus Salto**
*Curso:* Análise e Desenvolvimento de Sistemas (ADS)
*Semestre:* 1º Semestre / 2026
*Evento:* Socialização na **IFCIÊNCIA 2026** (22/10/2026 — Sala D-112)

---

## Como Executar o Projeto Localmente

1. Clone este repositório:
   ```bash
   git clone https://github.com/ondecosalto/ondeco.git
   ```
2. Acesse a pasta do projeto:
   ```bash
   cd ondeco
   ```
3. Sirva a pasta com um servidor local (necessário para o `fetch` do `pontos.json`), por exemplo com a extensão **Live Server** do VS Code ou:
   ```bash
   python3 -m http.server 8000
   ```
   Depois acesse `http://localhost:8000`. Abrir o `index.html` direto pelo arquivo (`file://`) bloqueia a leitura do JSON em vários navegadores.

---

## Como Contribuir

Leia o [CONTRIBUTING.md](CONTRIBUTING.md): cada tarefa em uma branch própria (`feature/`, `data/`, `docs/` ou `fix/`), integrada à `main` por Pull Request.

---

## Histórico de Atualizações (Changelog)

### v2
- **13/11/2026:** README e relatório técnico de evolução da v2 atualizados.
- **11/11/2026:** Rolagem suave até os resultados e reset de categorias na busca mobile (PR #19). Coordenadas, telefones e padronização final dos **51 pontos** (PR #18, Rafael). `pontos.json` padronizado, com suporte a telefone e busca unificada (PR #16, Naomi).
- **10/11/2026:** Limpeza da pasta `docs/rafael`, com o levantamento migrado para o Drive (PR #15). Novos pontos da curadoria da Isabella integrados (PR #14).
- **09/11/2026:** **+29 pontos** no cadastro, de 22 para 51 (Rafael e Isabella).
- **07/11/2026:** Correção da formatação do endereço e da inicialização do DOM (Isael, PR #12). Ajuste da capitalização da marca no título da página (PR #13).
- **02/11/2026:** Acessibilidade WCAG finalizada, responsividade mobile-first e *skeleton cards* (Naomi).
- **30/10/2026:** Sanitização de dados e *fallbacks* de segurança no JavaScript (Isael).
- **26/10/2026:** Layout mobile-first, mapa Leaflet responsivo e modais; reorganização em `css/`, `js/` e `assets/` (Naomi, PR #10).

### v1
- **13/10/2026:** Melhorias de performance e acessibilidade, com filtros por categoria (PR #9).
- **12/10/2026:** Ajuste do pathing dos assets e correção dos seletores de acessibilidade (Naomi). Documentação de metodologia e guia de contribuição (Henry, PRs #6 e #8).
- **11/10/2026:** Botão do Google Maps só aparece com link válido (Isael). Estruturação inicial do `pontos.json` com 22 ecopontos (Isabella e Rafael). Identidade visual e logo oficial, refatoração do CSS para `rem` e *Skip Link* (Naomi).
- **10/10/2026:** Estrutura inicial do projeto, README e CONTRIBUTING (Naomi).
