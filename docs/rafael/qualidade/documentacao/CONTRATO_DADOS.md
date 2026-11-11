# Contrato técnico dos dados OndEco

Este contrato serve **para auditoria**. Não exige que a equipe modifique o site nem adiciona campos obrigatórios extras na interface.

## Campos lidos pelo site e validador

| Campo | Tipo | Regra |
|---|---|---|
| `id` | inteiro positivo | Único, sem reutilização em outros locais |
| `nome` | texto | Sem espaços externos; apresentação em Title Case onde não contrariar a marca |
| `bairro` | texto | Preservar o bairro da fonte, com acentuação |
| `categoria` | texto | Uma de `reciclaveis`, `eletronicos`, `medicamentos`, `oleo`, `pilhas`, `entulho`, `outros` |
| `categorias` | lista de textos | Cada valor pertence ao conjunto de filtros reconhecidos pelo site |
| `endereco` | texto | Nome, via e número conforme a fonte; evitar mudar sem evidência |
| `materiais` | texto | Materiais atribuídos pela fonte, sem deduzir recebimento por profissão da loja |
| `horario` | texto | Registrar horários conforme levantamento, sem extrapolar |
| `lat`, `lng` | números decimais | Latitude e longitude (nessa ordem); sem strings ou valores fictícios |
| `telefone` | texto | DDD + número ou 0800; central deve ter rótulo claro |
| `link_maps` | URL HTTPS | Apenas domínios reconhecidos de Google Maps |

## Proveniência recomendada

Os campos de proveniência podem ser mantidos em **`dados/controle_fontes.csv`**, para não aumentar o JSON da interface: fonte das coordenadas, origem do telefone, tipo de telefone, status de conferência, observações, data da pesquisa. O controle guarda **distinções de evidência**:

1. **Coordenada presente/plausível:** tipo e faixa coerentes; não garante localização exata.
2. **Origem rastreável:** foi obtida de documento ou cadastro identificado.
3. **Conferência visual:** endereço e posição do pino foram comparados e registrados por uma pessoa.
4. **Confirmação local:** contato ou visita ao serviço, anotando data e resultado.

O validador automatiza (1) e parte de (2). **Não afirma (3) ou (4)**. Coordenadas de serviços móveis referem-se ao endereço indicado no levantamento e não rastreiam veículos.

## Regras de revisão

- Não substituir telefone de estabelecimento por telefone genérico sem identificar `tipo_telefone`.
- Não inventar latitude, longitude ou telefones de serviços.
- Não deduplicar lojas pelo nome comercial: franquias podem ter várias unidades.
- Não corrigir nome comercial apenas pela capitalização sem comparar com fonte.
- Cada edição futura no JSON deve gerar comparação de IDs, categorias, materiais e links; não alterar a `main` sem PR.
