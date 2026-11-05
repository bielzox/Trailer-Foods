@echo off
setlocal
cd /d "%~dp0.."
title Gerar instalador - Lanchonete Admin

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado. Instale a versao LTS em https://nodejs.org
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando dependencias ^(so na primeira vez^)...
  call npm install
  if errorlevel 1 goto erro
)
call npm run dist-admin
if errorlevel 1 goto erro
echo.
echo PRONTO! Instalador em: %cd%\instalador-admin
start "" "%cd%\instalador-admin"
pause
exit /b 0

:erro
echo.
echo [ERRO] Algo falhou. Se citar "symbolic link"/"winCodeSign", rode como Administrador
echo ou ative o Modo de Desenvolvedor do Windows.
pause
exit /b 1
