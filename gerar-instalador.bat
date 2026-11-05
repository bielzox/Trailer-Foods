@echo off
setlocal
cd /d "%~dp0"
title Gerar instaladores - Lanchonete

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERRO] Node.js nao encontrado. Instale a versao LTS em https://nodejs.org e rode de novo.
  pause
  exit /b 1
)

echo.
echo  ===== INSTALADORES =====
echo.
echo   [1] Tudo (Cardapio + Admin)
echo   [2] Somente - Cardapio
echo   [3] Somente - Admin
echo.
choice /c 123 /n /m "Escolha uma opcao: "
set OP=%errorlevel%

if not exist node_modules (
  echo.
  echo Instalando dependencias ^(so na primeira vez, precisa de internet^)...
  call npm install
  if errorlevel 1 goto erro
)

if %OP%==3 goto admin

echo.
echo === Gerando instalador do CARDAPIO ^(PC^) ===
call npm run dist
if errorlevel 1 goto erro
if %OP%==2 goto fim

:admin
echo.
echo === Gerando instalador do ADMIN ^(PC^) ===
call npm run dist-admin
if errorlevel 1 goto erro
if %OP%==3 goto fim

:fim
echo.
echo  ===== PRONTO =====
if exist instalador       echo  PC Cardapio : %~dp0instalador
if exist instalador-admin echo  PC Admin    : %~dp0instalador-admin
echo.
if exist instalador       start "" "%~dp0instalador"
if exist instalador-admin start "" "%~dp0instalador-admin"
pause
exit /b 0

:erro
echo.
echo [ERRO] Algo falhou. Se a mensagem citar "symbolic link" ou "winCodeSign", rode este .bat
echo como Administrador ^(ou ative o Modo de Desenvolvedor do Windows^) e tente de novo.
pause
exit /b 1
