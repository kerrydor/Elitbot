# Nginx Setup Guide for ElitBot

This guide explains how to set up Nginx as a reverse proxy with SSL for ElitBot.

## Overview

- **Bot runs on**: HTTP localhost:8443 (internal)
- **Nginx handles**: HTTPS on port 443 (external)
- **Domain**: elitbot.ddns.net

## Quick Setup

Run the automated setup script:

```bash
sudo ./script/setup-nginx.sh
```

This will:
1. Install Nginx and Certbot
2. Configure Nginx reverse proxy
3. Set up SSL certificate (Let's Encrypt)
4. Enable and start services

## Manual Setup

### Step 1: Install Nginx and Certbot

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Step 2: Configure Nginx

1. **Copy configuration file:**
   ```bash
   sudo cp nginx/elitbot.conf /etc/nginx/sites-available/elitbot
   ```

2. **Update domain** (if different):
   ```bash
   sudo nano /etc/nginx/sites-available/elitbot
   # Change elitbot.ddns.net to your domain
   ```

3. **Enable site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/elitbot /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default  # Remove default site
   ```

4. **Test configuration:**
   ```bash
   sudo nginx -t
   ```

5. **Start Nginx:**
   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

### Step 3: Set Up SSL Certificate

**Important:** Make sure your domain `elitbot.ddns.net` points to your server's IP address first!

```bash
sudo certbot --nginx -d elitbot.ddns.net
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose redirect HTTP to HTTPS (option 2)

### Step 4: Update .env File

```env
WEBHOOK_URL=https://elitbot.ddns.net
WEBHOOK_PORT=8443
WEBHOOK_SECRET=your_secure_secret_here
```

**Note:** Don't set SSL_CERT_PATH and SSL_KEY_PATH - Nginx handles SSL, not the bot.

### Step 5: Restart Services

```bash
# Reload Nginx
sudo systemctl reload nginx

# Restart bot
pm2 restart elitbot
# or
npm run dev
```

## Verify Setup

1. **Check Nginx status:**
   ```bash
   sudo systemctl status nginx
   ```

2. **Check SSL certificate:**
   ```bash
   sudo certbot certificates
   ```

3. **Test health endpoint:**
   ```bash
   curl https://elitbot.ddns.net/health
   ```

4. **Check bot logs:**
   ```bash
   pm2 logs elitbot
   # or check console output
   ```

You should see:
```
✅ Webhook set successfully: https://elitbot.ddns.net/webhook/your_secret
```

## Architecture

```
Internet (HTTPS:443)
    ↓
Nginx (SSL Termination)
    ↓
Bot Server (HTTP:8443)
    ↓
Express App
```

## Firewall Configuration

Make sure ports are open:

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Bot port (8443) should NOT be exposed externally
# Only accessible from localhost via Nginx
```

## Troubleshooting

### Nginx won't start

```bash
# Check configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Bot not receiving updates

1. **Check webhook URL:**
   ```bash
   curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
   ```

2. **Check Nginx logs:**
   ```bash
   sudo tail -f /var/log/nginx/access.log
   ```

3. **Verify bot is running:**
   ```bash
   curl http://localhost:8443/health
   ```

### Domain not resolving

- Check DNS settings for `elitbot.ddns.net`
- Verify it points to your server's public IP
- Wait for DNS propagation (can take up to 24 hours)

## Renewal

Let's Encrypt certificates expire every 90 days. Certbot sets up automatic renewal, but you can test it:

```bash
# Test renewal
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew
```

## Security Notes

- ✅ Bot runs on localhost only (not exposed)
- ✅ Nginx handles SSL/TLS
- ✅ Security headers configured
- ✅ Only webhook endpoint is accessible
- ✅ Firewall blocks direct access to port 8443

## Maintenance

**Restart Nginx after config changes:**
```bash
sudo systemctl reload nginx
```

**View Nginx logs:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

