@echo off
setlocal
REM Execute a partir da raiz do repositório ou dê duplo clique no BAT.
cd /d "%~dp0\..\..\..\.."
set "FERR=docs\rafael\qualidade\ferramentas\executar_qualidade.py"
set "CONTROLE=docs\rafael\qualidade\dados\controle_fontes.csv"
set "DEST=docs\rafael\qualidade\saida_local_nao_publicar"
where py >nul 2>&1
if %errorlevel%==0 (
  py -3 "%FERR%" --dados assets\data\pontos.json --controle "%CONTROLE%" --saida "%DEST%"
) else (
  python "%FERR%" --dados assets\data\pontos.json --controle "%CONTROLE%" --saida "%DEST%"
)
echo.
echo Auditoria concluida. Verifique a pasta %DEST%.
pause
