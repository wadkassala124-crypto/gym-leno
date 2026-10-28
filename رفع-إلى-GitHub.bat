@echo off
chcp 65001 >nul
title رفع مشروع Gym & Leno إلى GitHub
echo ========================================================
echo         GYM & LENO - رفع الموقع إلى GitHub
echo ========================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0push-to-github.ps1"
pause
