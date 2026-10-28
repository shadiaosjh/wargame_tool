@echo off
chcp 65001 >nul
setlocal
title 庙算本地兵棋辅助工具

rem ============ config ============
rem Port can be overridden: run this bat with an argument, e.g. 8001
set "PORT=8000"
if not "%~1"=="" set "PORT=%~1"

rem ============ switch to data folder (relative to this file) ============
cd /d "%~dp0data"
if errorlevel 1 (
    echo [ERROR] "data" folder not found next to this bat file.
    pause
    exit /b 1
)

rem ============ locate python without hard-coded absolute paths ============
set "PY="
python -c "import sys" >nul 2>nul
if not errorlevel 1 set "PY=python"

if defined PY goto :verify

for %%C in (
    "%USERPROFILE%\anaconda3\python.exe"
    "%USERPROFILE%\miniconda3\python.exe"
    "%USERPROFILE%\Anaconda3\python.exe"
    "%ProgramData%\anaconda3\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python3*\python.exe"
) do if not defined PY if exist "%%~fC" set "PY=%%~fC"

:verify
if not defined PY goto :nopy
"%PY%" -c "import sys" >nul 2>nul
if errorlevel 1 set "PY="
if not defined PY goto :nopy
goto :run

:nopy
echo [ERROR] Python was not found.
echo Install Python, or add it to PATH, then try again.
pause
exit /b 1

:run
rem percent signs must be doubled inside a bat, otherwise cmd treats them as variables
set "URL=http://127.0.0.1:%PORT%/%%E5%%8F%%AF%%E8%%A7%%86%%E5%%8C%%96.html"

echo Server root : %CD%
echo Python      : %PY%
echo URL         : %URL%
echo Press Ctrl+C to stop the server.
echo.

rem open the browser shortly after the server starts
start "" /b cmd /c "ping -n 3 127.0.0.1 >nul & start "" %URL%"

"%PY%" -m http.server %PORT% --bind 127.0.0.1
