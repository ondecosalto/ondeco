# Metodologia de Desenvolvimento

## Projeto OndEco Salto // Outubro 2026

---

### 1. Introdução à Abordagem Técnica

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

| Tecnologia | Função no Projeto | Justificativa |

|------------------|--------------------------------------------------------|---------------|

| **HTML5** | Estrutura semântica das páginas | Organização clara e acessível do conteúdo |

| **CSS3** | Estilização e design responsivo (*Mobile First*) | Adaptação automática para celulares e desktops |

| **JavaScript (ES6+)** | Lógica de busca, filtros e carregamento dinâmico | Interatividade em tempo real sem recarregar a página |

| **JSON** | Banco de dados estático (pontos.json) | Leve, fácil de atualizar e não precisa de servidor |

| **GitHub Pages** | Hospedagem e publicação automática | Gratuita, estável e integrada ao controle de versão |

---

### 3. Como a Aplicação Funciona (Fluxo Técnico)

1. O usuário acessa o site pelo navegador.

2. O JavaScript solicita o arquivo pontos.json (via *Fetch API*).

3. Os dados são convertidos em **cards informativos**.

4. O usuário pode filtrar por:

- Texto livre (bairro, nome ou material)

- Categoria (Eletrônicos, Medicamentos, Óleo de Cozinha ou Recicláveis)

5. A busca normaliza o texto (remove acentos e deixa tudo em minúsculas), evitando erros comuns de digitação.

6. Cada card possui um botão que abre a rota no **Google Maps**.

Todo esse processo acontece **no lado do cliente** (no navegador), sem necessidade de comunicação com um servidor de aplicação.

---

### 4. Arquitetura Serverless — Vantagens para o Projeto

A arquitetura escolhida traz benefícios diretos para um projeto de extensão:

- **Custo zero** de hospedagem e manutenção

- **Facilidade de atualização** dos dados (basta editar o arquivo JSON)

- **Acessibilidade** imediata via qualquer navegador

- **Escalabilidade natural** (o GitHub Pages aguenta o volume de acessos esperado)

- Alinhamento com os princípios de sustentabilidade e inclusão digital

---

### 5. Controle de Versão e Colaboração

O código-fonte é versionado no repositório oficial:

[https://github.com/ondecosalto/ondeco](https://github.com/ondecosalto/ondeco)

Cada integrante trabalha em sua própria *feature branch*, evitando conflitos.

Após a conclusão de uma tarefa, é aberto um *Pull Request* para a branch principal (main).

---

### 6. Considerações Finais da Metodologia

A combinação de tecnologias web padrão com uma arquitetura *serverless* permitiu entregar uma solução funcional, leve e de fácil manutenção, adequada tanto para a realidade acadêmica quanto para o uso pela comunidade de Salto.

Essa abordagem atende plenamente aos requisitos definidos no escopo do projeto de extensão, priorizando usabilidade, baixo custo e impacto social.

---

**Documento elaborado por:**

Henrique Carmona dos Santos

Sub-equipe 3 — Documentação e Metodologia

Projeto de Extensão — ADS | IFSP Câmpus Salto
