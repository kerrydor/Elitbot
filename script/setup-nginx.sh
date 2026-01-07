#!/bin/bash

# Nginx Setup Script for ElitBot
# This script sets up Nginx as a reverse proxy with SSL

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

DOMAIN="elitbot.ddns.net"
BOT_PORT="8443"

echo "=== ElitBot Nginx Setup ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run with sudo"
    exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get update
    apt-get install -y nginx
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    apt-get install -y certbot python3-certbot-nginx
fi

# Create webroot directory for Let's Encrypt
mkdir -p /var/www/html
chown -R www-data:www-data /var/www/html

# Copy Nginx configuration (HTTP only first, certbot will add SSL)
echo "📝 Setting up Nginx configuration..."
if [ ! -f "$PROJECT_ROOT/nginx/elitbot-http.conf" ]; then
    echo "❌ Error: nginx/elitbot-http.conf not found in project root"
    echo "   Expected: $PROJECT_ROOT/nginx/elitbot-http.conf"
    exit 1
fi
cp "$PROJECT_ROOT/nginx/elitbot-http.conf" /etc/nginx/sites-available/elitbot

# Replace domain in config if needed
sed -i "s/elitbot.ddns.net/$DOMAIN/g" /etc/nginx/sites-available/elitbot

# Enable site
if [ ! -L /etc/nginx/sites-enabled/elitbot ]; then
    ln -s /etc/nginx/sites-available/elitbot /etc/nginx/sites-enabled/
fi

# Remove default site if exists
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Check if Apache is running on port 80
if systemctl is-active --quiet apache2 2>/dev/null; then
    echo "⚠️  Apache is running on port 80"
    echo "   Nginx needs port 80 for webhooks"
    echo ""
    read -p "Stop Apache and use Nginx instead? (y/n): " STOP_APACHE
    if [[ "$STOP_APACHE" =~ ^[Yy]$ ]]; then
        echo "🛑 Stopping Apache..."
        systemctl stop apache2
        systemctl disable apache2
        echo "✅ Apache stopped"
    else
        echo "❌ Cannot proceed. Apache must be stopped for Nginx to use port 80."
        echo "   You can stop Apache manually: sudo systemctl stop apache2"
        exit 1
    fi
fi

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

# Start Nginx
echo "🚀 Starting Nginx..."
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo "   Nginx is already running, reloading configuration..."
    systemctl reload nginx
else
    systemctl start nginx
    systemctl enable nginx
fi

# Configure firewall
echo ""
echo "🔥 Configuring firewall..."
if command -v ufw &> /dev/null; then
    echo "   Opening ports 80 and 443..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "   Firewall configured"
elif command -v firewall-cmd &> /dev/null; then
    echo "   Opening ports 80 and 443 (firewalld)..."
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
    echo "   Firewall configured"
else
    echo "   ⚠️  No firewall manager detected (ufw/firewalld)"
    echo "   Please manually open ports 80 and 443"
fi

# Get SSL certificate
echo ""
echo "🔒 Setting up SSL certificate..."
echo "   Make sure your domain $DOMAIN points to this server's IP address!"
echo "   Current server IP: $(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo "   Waiting 5 seconds for you to verify DNS and firewall..."
sleep 5

# Get email for Let's Encrypt
read -p "Enter email for Let's Encrypt notifications: " EMAIL
if [ -z "$EMAIL" ]; then
    EMAIL="admin@$DOMAIN"
fi

echo "   Using email: $EMAIL"
echo "   Obtaining SSL certificate (this may take a minute)..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email "$EMAIL" --redirect

# Reload Nginx
systemctl reload nginx

echo ""
echo "✅ Nginx setup complete!"
echo ""
echo "📝 Update your .env file:"
echo "   WEBHOOK_URL=https://$DOMAIN"
echo ""
echo "🔍 Verify setup:"
echo "   - Check Nginx: sudo systemctl status nginx"
echo "   - Check SSL: sudo certbot certificates"
echo "   - Test webhook: curl https://$DOMAIN/health"
echo ""

