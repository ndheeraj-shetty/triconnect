#!/usr/bin/env bash
echo "==================================================="
echo "  Starting TriConnect (Frontend & Backend Server)  "
echo "==================================================="
echo ""
echo "Launching local servers..."
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo ""

if command -v open &> /dev/null; then
    open "http://localhost:3000"
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000"
fi

npm run dev
