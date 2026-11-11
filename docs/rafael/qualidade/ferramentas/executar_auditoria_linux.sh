#!/bin/sh
set -eu
DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPO="$(CDPATH= cd -- "$DIR/../../../../" && pwd)"
python3 "$DIR/executar_qualidade.py" --dados "$REPO/assets/data/pontos.json" --controle "$DIR/../dados/controle_fontes.csv" --saida "$DIR/../saida_local_nao_publicar"
