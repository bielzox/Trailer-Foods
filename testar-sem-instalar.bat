@echo off
title Servidor da Lanchonete (teste)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0servidor.ps1"
pause
