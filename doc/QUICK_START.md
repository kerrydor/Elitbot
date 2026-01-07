# Quick Start Guide

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node -v

# Check PostgreSQL
sudo systemctl status postgresql

# Check if you have a domain and SSL ready
```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE elitbot;
CREATE USER elitbot_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE elitbot TO elitbot_user;
\q
```

### 3. Configure Environment

```bash
cp .env.example .env
nano .env  # Edit with your values
```

**Minimum required values:**
- `BOT_TOKEN` - Get from @BotFather on Telegram
- `WEBHOOK_URL` - Your domain (e.g., `https://yourdomain.com`)
- `DB_*` - Database credentials from step 2
- `ADMIN_USER_IDS` - Your Telegram user ID (get from @userinfobot)

### 4. SSL Certificates (Production)

**Option A: Let's Encrypt**
```bash
sudo apt update
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
# Update .env with paths:
# SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
# SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

**Option B: Existing Certificates**
Update `.env` with your certificate paths.

### 5. Build and Deploy

```bash
# Build TypeScript
npm run build

# Run migrations
npm run migrate

# Deploy (installs PM2 if needed and starts bot)
./script/deploy.sh
# Or use npm script:
npm run deploy:script
```

### 6. Verify

```bash
# Check bot status
pm2 status

# Check logs
pm2 logs elitbot

# Test webhook
curl https://yourdomain.com/health
```

### 7. Test Bot

1. Open Telegram
2. Search for your bot
3. Send `/start`
4. Complete verification
5. Test menu options

## Common Issues

**Bot not responding:**
- Check `pm2 logs elitbot`
- Verify webhook URL is correct
- Check SSL certificates are valid
- Ensure firewall allows port 8443

**Database errors:**
- Verify PostgreSQL is running
- Check connection details in `.env`
- Ensure database and user exist

**Webhook errors:**
- Verify SSL certificates exist and are readable
- Check webhook URL is accessible
- Review bot logs for specific errors

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Read [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for admin features

**Note:** All documentation files are in the `doc/` folder.
- Customize promotions in `src/config/promotions.ts`

