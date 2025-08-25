#!/bin/bash

set -e

echo "🚀 Setting up E-commerce Application..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 -U ecommerce > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running or not accessible"
    echo "Make sure PostgreSQL is running with the correct credentials:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  User: ecommerce"
    echo "  Password: ecommerce_secure_2024"
    echo "  Database: ecommerce_dev"
    echo ""
    echo "You can create the database with:"
    echo "  createdb -h localhost -U ecommerce ecommerce_dev"
    exit 1
fi

echo "✅ PostgreSQL is accessible"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd packages/database
pnpm db:generate

# Push database schema
echo "🗄️  Pushing database schema..."
pnpm db:push

# Seed database
echo "🌱 Seeding database..."
pnpm db:seed

cd ../..

echo "✅ Setup completed successfully!"
echo ""
echo "🎉 Your E-commerce Application is ready!"
echo ""
echo "To start the application:"
echo "  npm run dev        # Start both frontend and backend in development"
echo "  npm run test       # Run validation tests"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:3061"
echo "  Backend:  http://localhost:3062"
echo ""
echo "Demo accounts:"
echo "  User:  user@ecommerce.com / password123"
echo "  Admin: admin@ecommerce.com / password123"