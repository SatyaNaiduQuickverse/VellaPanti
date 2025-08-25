#!/bin/bash

# Development startup script for ecommerce app
# This script properly loads environment variables and starts both applications in development mode

set -e

echo "🚀 Starting E-commerce Application in Development Mode..."

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

echo "🚀 Starting applications in development mode..."

# Use turbo to start both applications
pnpm run dev