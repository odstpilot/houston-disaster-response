@echo off
echo Starting Houston Disaster Response App...
echo.
echo Trying different methods to start a local server:
echo.

REM Try Python first (most common)
python --version >nul 2>&1
if %errorlevel%==0 (
    echo [1/3] Found Python - Starting server on http://localhost:8000
    echo.
    echo ^> python -m http.server 8000
    echo.
    echo Press Ctrl+C to stop the server
    echo Open your browser to: http://localhost:8000
    echo.
    python -m http.server 8000
    goto :end
)

REM Try Node.js
node --version >nul 2>&1
if %errorlevel%==0 (
    echo [2/3] Found Node.js - Starting server on http://localhost:8000
    echo.
    echo ^> npx http-server -p 8000 -c-1
    echo.
    echo Press Ctrl+C to stop the server
    echo Open your browser to: http://localhost:8000
    echo.
    npx http-server -p 8000 -c-1
    goto :end
)

REM Try PHP
php --version >nul 2>&1
if %errorlevel%==0 (
    echo [3/3] Found PHP - Starting server on http://localhost:8000
    echo.
    echo ^> php -S localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo Open your browser to: http://localhost:8000
    echo.
    php -S localhost:8000
    goto :end
)

echo ERROR: No suitable server found!
echo.
echo Please install one of the following:
echo 1. Python (recommended): https://python.org/downloads
echo 2. Node.js: https://nodejs.org/downloads
echo 3. PHP: https://php.net/downloads
echo.
echo Then run this script again.
pause

:end
echo.
echo Server stopped.
pause
