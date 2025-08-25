#!/bin/bash

set -e

echo "🚀 Starting E-commerce Application in Development Mode..."

# Check if setup was run
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Run setup first:"
    echo "./scripts/setup.sh"
    exit 1
fi

# Start both frontend and backend concurrently
echo "🌐 Starting frontend (port 3061) and backend (port 3062)..."
echo ""
echo "Frontend: http://localhost:3061"
echo "Backend:  http://localhost:3062"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Use pnpm to start both applications
pnpm run dev