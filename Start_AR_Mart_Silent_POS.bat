@echo off
title AR Mart POS - Direct Silent Print Terminal
color 0A
cls
echo =====================================================================
echo                AR MART POS - DIRECT SILENT PRINT TERMINAL
echo =====================================================================
echo.
echo  [*] Checking backend server status...

:: Check if server is running on port 5000
netstat -ano | findstr :5000 > nul
if %errorlevel% neq 0 (
    echo  [!] Starting AR Mart POS Backend Server in background...
    start /B node server.js
    timeout /t 2 /nobreak > nul
) else (
    echo  [OK] AR Mart POS Server is online on http://localhost:5000
)

echo.
echo  [*] Launching Chrome / Edge in Silent Kiosk Printing Mode...
echo      - NO print preview dialog popup will appear
echo      - Receipts will print directly to your default thermal printer
echo.

:: 1. Try 64-bit Google Chrome
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing --app=http://localhost:5000
    exit
)

:: 2. Try 32-bit Google Chrome
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --kiosk-printing --app=http://localhost:5000
    exit
)

:: 3. Try Microsoft Edge
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --kiosk-printing --app=http://localhost:5000
    exit
)

if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --kiosk-printing --app=http://localhost:5000
    exit
)

:: Fallback
start http://localhost:5000
exit
