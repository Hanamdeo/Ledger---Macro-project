@echo off
title Ledger - Local Development Server
cd /d "%~dp0"
echo ======================================================================
echo   Starting Ledger Personal Finance & Expense Management System...
echo ======================================================================
echo.
python serve.py
pause
