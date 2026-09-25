@echo off
setlocal
echo =======================================================
echo    Ledger - Personal Finance Analytics Git Uploader
echo =======================================================
echo.

set "GIT_PATH=%LOCALAPPDATA%\Programs\MinGit\cmd\git.exe"
if not exist "%GIT_PATH%" (
    where git >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Git was not found on your system.
        pause
        exit /b 1
    )
    set "GIT_PATH=git"
)

cd /d "C:\Users\Harshit Namdeo\.gemini\antigravity\scratch\personal-finance-analytics"

echo Current repository status:
"%GIT_PATH%" status
echo.

set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/ledger.git): "
if "%REPO_URL%"=="" (
    echo [ERROR] No repository URL was entered.
    pause
    exit /b 1
)

echo.
echo Removing any existing origin remote...
"%GIT_PATH%" remote remove origin >nul 2>&1

echo Adding remote origin: %REPO_URL%
"%GIT_PATH%" remote add origin %REPO_URL%

echo Ensuring branch is named main...
"%GIT_PATH%" branch -M main

echo.
echo Pushing code to GitHub...
echo (If prompted, log in via your browser or Personal Access Token)
"%GIT_PATH%" push -u origin main

if errorlevel 1 (
    echo.
    echo [NOTE] If git requested credentials, make sure you enter your GitHub username and Personal Access Token or sign in.
) else (
    echo.
    echo =======================================================
    echo    SUCCESS! Repository uploaded to GitHub!
    echo =======================================================
)

echo.
pause
