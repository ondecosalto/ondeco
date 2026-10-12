# Metodologia de Desenvolvimento
## Projeto OndEco Salto | Outubro 2026

---

### 1. Visão Geral da Abordagem Técnica

A solução **OndEco Salto** foi desenvolvida com foco em simplicidade, acessibilidade e baixo custo de manutenção.  
Optou-se por uma **arquitetura serverless** (sem servidor back-end próprio).  
Isso significa que toda a aplicação funciona diretamente no navegador do usuário, sem necessidade de banco de dados complexo ou servidor dedicado.

Essa escolha permite:

- Hospedagem gratuita
- Atualizações rápidas
- Acesso imediato via celular ou computador
- Zero custo de infraestrutura

---

### 2. Tecnologias Utilizadas

| Tecnologia            | Função no Projeto                                      | Justificativa                                        |
|-----------------------|--------------------------------------------------------|------------------------------------------------------|
| **HTML5**             | Estrutura semântica das páginas                        | Organização clara e acessível do conteúdo            |
| **CSS3**              | Estilização e design responsivo (*Mobile First*)       | Adaptação automática para celulares e desktops       |
| **JavaScript (ES6+)** | Lógica de busca, filtros e carregamento dinâmico       | Interatividade em tempo real sem recarregar a página |
| **JSON**              | Banco de dados estático (`pontos.json`)                | Leve, fácil de atualizar e não precisa de servidor   |
| **GitHub Pages**      | Hospedagem e publicação automática                     | Gratuita, estável e integrada ao controle de versão  |

---

### 3. Fluxo de Funcionamento da Aplicação

1. O usuário acessa o site pelo navegador.
2. O JavaScript solicita o arquivo `pontos.json` (via *Fetch API*).
3. Os dados são exibidos em formato de *cards* informativos.
4. O usuário pode filtrar por:
   - Texto livre (bairro, nome ou material)
   - Categoria (Eletrônicos, Medicamentos, Óleo de Cozinha ou Recicláveis)
5. A busca normaliza o texto (remove acentos e converte para minúsculas), evitando erros comuns de digitação.
6. Cada card possui um botão que abre a rota no **Google Maps**.

Todo esse processo ocorre **no lado do cliente** (no navegador), sem necessidade de comunicação com um servidor de aplicação.

---

### 4. Acessibilidade e Inclusão Digital (WCAG 2.1 AA / e-MAG)

A interface do OndEco Salto foi projetada sob as diretrizes de acessibilidade do Governo Federal (e-MAG) e da W3C (WCAG 2.1 AA), priorizando o uso por pessoas com diferentes necessidades:

- **Escalabilidade (`rem`):** Dimensionamento relativo que permite o zoom nativo do navegador sem quebra de layout.
- **Navegação por Teclado:** Suporte completo a atalhos com indicadores de foco visíveis (`:focus-visible`).
- **Atalho de Conteúdo (*Skip Link*):** Mecanismo que permite pular o cabeçalho e ir diretamente ao conteúdo principal.
- **Suporte a Leitores de Tela:** Inclusão de rótulos descritivos ocultos visualmente por meio da classe `.sr-only`.

Essas práticas reforçam o compromisso do projeto com a inclusão digital e o acesso equitativo à informação sobre descarte correto de resíduos.

---

### 5. Vantagens da Arquitetura Serverless

A arquitetura escolhida traz benefícios diretos para um projeto de extensão:

- Custo zero de hospedagem e manutenção
- Facilidade de atualização dos dados (basta editar o arquivo JSON)
- Acessibilidade imediata via qualquer navegador
- Escalabilidade natural (o GitHub Pages aguenta o volume de acessos esperado)
- Alinhamento com os princípios de sustentabilidade e inclusão digital

---

### 6. Controle de Versão e Colaboração

O código-fonte é versionado no repositório oficial:  
[https://github.com/ondecosalto/ondeco](https://github.com/ondecosalto/ondeco)

O fluxo de trabalho adotado segue rigorosamente os manuais internos do projeto:

- Cada integrante trabalha em sua própria *feature branch* padronizada (ex.: `feature/layout-ui`, `feature/logica-js`, `feature/dados-json`), evitando conflitos diretos na `main`.
- Após a conclusão de uma tarefa, é aberto um **Pull Request** apontando para a branch principal (`main`).
- É adotado o modelo de **Peer Review obrigatório**: nenhum integrante realiza *self-merge*. Toda alteração só é integrada após revisão e aprovação de outro membro da equipe.
- As mensagens de commit seguem o padrão *Conventional Commits* (`feat:`, `fix:`, `style:`, `data:`, `docs:`), facilitando o rastreamento das mudanças.

Esse processo garante qualidade, rastreabilidade e responsabilidade coletiva sobre o código.

---

### 7. Considerações Finais

A combinação de tecnologias web padrão com uma arquitetura *serverless* permitiu entregar uma solução funcional, leve e de fácil manutenção, adequada tanto para a realidade acadêmica quanto para o uso pela comunidade de Salto.

A preocupação com acessibilidade (WCAG 2.1 AA), a disciplina no controle de versão e a prática de revisão por pares reforçam o caráter técnico e colaborativo do projeto.

Essa abordagem atende plenamente aos requisitos definidos no escopo do projeto de extensão, priorizando usabilidade, baixo custo, inclusão digital e impacto social.

---

**Documento elaborado por:**  
Henrique Carmona dos Santos  
Sub-equipe 3 — Documentação e Metodologia  
Projeto de Extensão — ADS | IFSP Câmpus Salto  
Outubro de 2026
