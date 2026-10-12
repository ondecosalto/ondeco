# OndEco Salto — Mapeamento de Resíduos e Pontos de Descarte Ecológico

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-green)
![Curso](https://img.shields.io/badge/Curso-ADS%20IFSP%20Salto-blue)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-orange)

> **Projeto de Extensão Acadêmica** desenvolvido pelos alunos do curso de Análise e Desenvolvimento de Sistemas (ADS) do **Instituto Federal de São Paulo (IFSP) — Campus Salto**.

---

## Status Atual do Projeto

> **Sprint Atual:** Finalização de Interface e Ingestão de Dados  
> **Última Atualização:** 12/10/2026

- [x] **Arquitetura Base:** Estruturação HTML5 semântica e CSS3 responsivo.
- [x] **Acessibilidade Digital:** Adequação WCAG 2.1 AA / e-MAG (unidades `rem`, *Skip Link*, `.sr-only` e foco visível).
- [x] **Mobile First & Layout:** Implementação de regras de visualização fluida em dispositivos móveis.
- [x] **Integração do JSON:** Estruturação e povoamento final do arquivo `pontos.json`.
- [ ] **Lógica de Filtros (JS):** Algoritmo de busca por bairro/categoria e anúncios `aria-live` (Em andamento pelo Front-End/JS).
- [ ] **Deploy GitHub Pages:** Publicação da versão final para a comunidade.

---

## Sobre o Projeto

O **OndEco Salto** é uma solução web *Mobile First* desenvolvida para facilitar a localização e o descarte correto de resíduos na cidade de Salto (SP). A plataforma mapeia ecopontos municipais, pontos de recolhimento de óleo de cozinha, pilhas/baterias, farmácias para medicamentos vencidos e cooperativas de reciclagem.

### Principais Funcionalidades
- **Busca Textual Inteligente:** Filtragem de locais por nome, bairro ou tipo de material com normalização de acentos.
- **Filtros por Categoria:** Seleção rápida para Eletrônicos, Medicamentos, Óleo de Cozinha e Recicláveis.
- **Rotas Diretas:** Cards informativos integrados ao **Google Maps** para traçar rotas com um clique.
- **Arquitetura Serverless:** Execução 100% *client-side*, sem necessidade de instalação ou servidor *back-end* complexo.

---

## Acessibilidade e Inclusão Digital (WCAG 2.1 AA / e-MAG)

A interface do OndEco Salto foi projetada sob as diretrizes de acessibilidade do Governo Federal (e-MAG) e da W3C:
* **Escalabilidade (`rem`):** Dimensionamento relativo para suportar zoom nativo de navegador sem quebra de *layout*.
* **Navegação por Teclado:** Suporte a atalhos com `:focus-visible` destacado (`3px` em alto contraste).
* **Atalho de Conteúdo (*Skip Link*):** Mecanismo para saltar o cabeçalho e ir diretamente aos filtros (`#main-content`).
* **Suporte a Leitores de Tela:** Inclusão de rótulos descritivos ocultos visualmente via `.sr-only`.

---

## Tecnologias Utilizadas

- **HTML5:** Estrutura semântica e acessível.
- **CSS3:** Design responsivo adaptado para dispositivos móveis (*Mobile First*).
- **JavaScript (ES6+):** Manipulação dinâmica de DOM, consumo de dados via `Fetch API` e algoritmo de filtro.
- **JSON:** Banco de dados estático e leve (`pontos.json`).
- **GitHub Pages:** Hospedagem e distribuição contínua.

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
   git clone [https://github.com/seu-usuario/ondeco-salto.git](https://github.com/seu-usuario/ondeco-salto.git)```
2. Acesse a pasta do projeto:
`cd ondeco-salto`

3. Abra o arquivo `index.html` em seu navegador ou utilize a extensão Live Server do VS Code.

---

## Histórico de Atualizações (Changelog)

- **12/10/2026:** Ajuste no pathing dos assets e correção dos seletores de acessibilidade (Naomi).
- **11/10/2026:** Melhoria na lógica do botão do Google Maps e segurança dos links externos (Isael).
- **11/10/2026:** Estruturação inicial do pontos.json com 22 ecopontos de Salto e materiais pesquisados (Isabella e Rafael).
- **11/10/2026:** Aplicação da identidade visual e logo oficial (Naomi).
- **11/10/2026:** Refatoração de CSS para rem, acréscimo de Skip Link e acessibilidade (Naomi).
- **08/10/2026:** Estruturação da base HTML/CSS do projeto (Naomi).
