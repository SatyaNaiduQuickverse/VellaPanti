#!/bin/bash

# Production startup script for ecommerce app
# This script properly loads environment variables and starts both applications

set -e

echo "🚀 Starting E-commerce Application in Production Mode..."

# Navigate to project root
cd "$(dirname "$0")"

# Load API environment variables
if [ -f "apps/api/.env" ]; then
    echo "📋 Loading API environment variables..."
    export $(grep -v '^#' apps/api/.env | xargs)
else
    echo "❌ API .env file not found!"
    exit 1
fi

# Verify critical environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set!"
    exit 1
fi

echo "✅ Environment variables loaded successfully"
echo "   - DATABASE_URL: ${DATABASE_URL:0:30}..."
echo "   - HOST: $HOST"
echo "   - PORT: $PORT"
echo "   - CORS_ORIGIN: $CORS_ORIGIN"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd packages/database
pnpm run db:generate
cd ../..

# Build applications
echo "🏗️  Building applications..."
pnpm run build

echo "🚀 Starting applications..."

# Start API in background
cd apps/api
echo "🔌 Starting API on $HOST:$PORT..."
pnpm run start &
API_PID=$!
cd ../..

# Start frontend in background  
cd apps/web
echo "🌐 Starting Frontend on 0.0.0.0:3061..."
pnpm run start &
WEB_PID=$!
cd ../..

echo "✅ Applications started successfully!"
echo "   - API PID: $API_PID"
echo "   - Frontend PID: $WEB_PID"
echo "   - Frontend: http://80.225.231.66:3061"
echo "   - API: http://80.225.231.66:3062"

# Wait for both processes
wait $API_PID $WEB_PID