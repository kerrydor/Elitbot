#!/bin/bash

# ElitBot Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting ElitBot deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Run migrations
echo "🗄️  Running database migrations..."
npm run migrate

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Restart or start with PM2
echo "🔄 Restarting bot with PM2..."
if pm2 list | grep -q "elitbot"; then
    pm2 restart elitbot
else
    pm2 start dist/index.js --name elitbot
    pm2 save
fi

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Bot Status:"
pm2 status elitbot
echo ""
echo "📝 View logs: pm2 logs elitbot"
echo "🔄 Restart: pm2 restart elitbot"
echo "⏹️  Stop: pm2 stop elitbot"

