@echo off
title Colégio Faculdade Hiperativo - Servidor
cd /d "%~dp0"

echo.
echo  ============================================
echo   Colégio Faculdade Hiperativo - Portal
echo  ============================================
echo.
echo  Iniciando servidor...
echo.

start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

npm run dev

pause
