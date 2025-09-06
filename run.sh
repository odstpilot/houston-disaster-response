#!/bin/bash

echo "Starting Houston Disaster Response App..."
echo ""
echo "Trying different methods to start a local server:"
echo ""

# Try Python first (most common)
if command -v python3 &> /dev/null; then
    echo "[1/3] Found Python3 - Starting server on http://localhost:8000"
    echo ""
    echo "> python3 -m http.server 8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "Open your browser to: http://localhost:8000"
    echo ""
    python3 -m http.server 8000
    exit 0
elif command -v python &> /dev/null; then
    echo "[1/3] Found Python - Starting server on http://localhost:8000"
    echo ""
    echo "> python -m http.server 8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "Open your browser to: http://localhost:8000"
    echo ""
    python -m http.server 8000
    exit 0
fi

# Try Node.js
if command -v node &> /dev/null; then
    echo "[2/3] Found Node.js - Starting server on http://localhost:8000"
    echo ""
    echo "> npx http-server -p 8000 -c-1"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "Open your browser to: http://localhost:8000"
    echo ""
    npx http-server -p 8000 -c-1
    exit 0
fi

# Try PHP
if command -v php &> /dev/null; then
    echo "[3/3] Found PHP - Starting server on http://localhost:8000"
    echo ""
    echo "> php -S localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "Open your browser to: http://localhost:8000"
    echo ""
    php -S localhost:8000
    exit 0
fi

echo "ERROR: No suitable server found!"
echo ""
echo "Please install one of the following:"
echo "1. Python (recommended): https://python.org/downloads"
echo "2. Node.js: https://nodejs.org/downloads"
echo "3. PHP: https://php.net/downloads"
echo ""
echo "Then run this script again."
