# Guia de conferência das 51 localizações

O arquivo de referência com 51 coordenadas permite **prévia do mapa**, não aprovação cartográfica.

## Procedimento por local

1. Abrir `mapa_conferencia.html` (pasta de resultados) e selecionar o ID.
2. Abrir o link Google Maps indicado no cartão, mantendo o nome, o endereço e o número do imóvel em evidência.
3. Comparar a posição do marcador de referência com a entrada real do estabelecimento ou lote. Documentar diferenças.
4. No `checklist_pinos.csv`, marcar `CONFERIDO`, `DIVERGENTE` ou `PRECISA DE CONTATO` na coluna `revisao_manual`, adicionar data, observação e responsável (fora do GitHub público se contiver informações pessoais).
5. Para redes com mesmo nome, conferir por **endereço e número**, nunca pelo nome isolado.
6. Para os IDs 42 e 43 (serviços móveis), validar se existe ponto físico de recebimento antes de anunciar o endereço como local de descarte. A coordenada representa referência, não veículo.
7. Comparar especificamente IDs **21 e 43**: os registros possuem coordenadas a cerca de **6 m** uma da outra. Podem ser locais relacionados, mas a posição precisa ser conferida.
8. Conferir os contatos dos 10 postos de saúde com base na cartilha **de 2025**; a data do documento não garante atualidade em 2026.
9. Para os 11 ecopontos, o número 0800 é **central CSO**, não telefone exclusivo da unidade.
10. Depois de preencher todos os registros, fazer revisão por outra pessoa e anexar o checklist ao relatório da equipe.

## Resultados e publicação

- A planilha `controle_fontes.csv` preserva as fontes dos dados; não atualizá-la com status `conferido` sem evidência.
- Para o site, qualquer atualização de `assets/data/pontos.json` exige PR separado e teste com o JavaScript atual; não sobrescrever o PR [#16](https://github.com/ondecosalto/ondeco/pull/16).
- Não mover nem modificar os documentos da Isabella ou de outros colegas. Dúvidas devem ser anotadas para discussão com a equipe.
