@echo off
setlocal enabledelayedexpansion

REM Start backend server in the same terminal
start /b "" cmd /c "cd /d "%~dp0backend" && npm start"

REM Start frontend development server in the same terminal
start /b "" cmd /c "cd /d "%~dp0frontend" && npm run dev"

REM Start notification service in the same terminal
start /b "" cmd /c "cd /d "%~dp0notification" && mvn spring-boot:run"

pause
