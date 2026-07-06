@echo off
rem Double-click launcher for Windows.
rem First run installs Electron (~1 min), after that it starts instantly.
cd /d "%~dp0"
if not exist node_modules (
  echo First run: installing Electron...
  call npm install --no-audit --no-fund
)
call npm start
