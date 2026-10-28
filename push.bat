@echo off
chcp 65001 >nul
cd /d "C:\Users\anwar\.gemini\antigravity\scratch\gym-leno"
echo ========================================================
echo   GYM ^& LENO - Pushing to GitHub (gem)
echo ========================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\anwar\.gemini\antigravity\scratch\gym-leno\push-to-github.ps1"
echo.
echo Press any key to close this window...
pause >nul
