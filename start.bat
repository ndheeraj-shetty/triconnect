@echo off
title TriConnect - One Click Launcher
echo ===================================================
echo   Starting TriConnect (Frontend & Backend Server)  
echo ===================================================
echo.
echo Launching local servers...
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo.
start "" "http://localhost:3000"
npm run dev
pause
