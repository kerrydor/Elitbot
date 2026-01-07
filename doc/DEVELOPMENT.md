# Development Guide

## Running Without SSL (Development)

Yes! The bot can work without SSL certificates for development and testing. The code automatically detects if SSL certificates are provided and falls back to HTTP if they're not.

### How It Works

The server checks for SSL certificates in your `.env` file:
- **If SSL certificates are provided**: Uses HTTPS (production mode)
- **If SSL certificates are NOT provided**: Uses HTTP (development mode)

### Important Note About Telegram Webhooks

⚠️ **Telegram requires HTTPS for webhooks in production.** However, for development you have several options:

#### Option 1: Use ngrok (Recommended for Testing)

ngrok provides a secure HTTPS tunnel to your local HTTP server:

```bash
# Install ngrok
# Download from https://ngrok.com/download

# Start your bot (HTTP mode)
npm run dev

# In another terminal, create HTTPS tunnel
ngrok http 8443

# Use the ngrok HTTPS URL in your .env:
# WEBHOOK_URL=https://your-random-id.ngrok.io
```

#### Option 2: Use Long Polling (No Webhook Needed)

For pure local development, you can modify the bot to use long polling instead of webhooks. This doesn't require HTTPS.

#### Option 3: Local Development with ngrok

1. **Start bot in HTTP mode** (no SSL in .env):
   ```bash
   npm run dev
   ```

2. **Create ngrok tunnel**:
   ```bash
   ngrok http 8443
   ```

3. **Update .env** with ngrok URL:
   ```env
   WEBHOOK_URL=https://abc123.ngrok.io
   ```

4. **Restart bot** - it will use the ngrok HTTPS URL

### Development Setup

1. **Create .env file** (without SSL paths):
   ```env
   BOT_TOKEN=your_bot_token
   WEBHOOK_URL=https://your-ngrok-url.ngrok.io  # or leave empty for long polling
   WEBHOOK_PORT=8443
   WEBHOOK_SECRET=your_secret
   
   # Database (you've already set this up)
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=elitbot
   DB_USER=elitbot_user
   DB_PASSWORD=your_password
   
   # Leave SSL paths empty for development
   # SSL_CERT_PATH=
   # SSL_KEY_PATH=
   ```

2. **Run migrations** (you've done this ✅):
   ```bash
   npm run migrate
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

   You should see:
   ```
   HTTP webhook server listening on port 8443
   Running without SSL. Set SSL_CERT_PATH and SSL_KEY_PATH for production.
   ```

### Testing Locally

If you're testing on localhost without ngrok, you can:

1. **Use long polling** (modify bot.ts temporarily):
   ```typescript
   // In bot.ts, comment out webhook setup
   // bot.setWebHook(...)
   ```

2. **Or use ngrok** for HTTPS tunnel (recommended)

### Production Setup

When ready for production:

1. **Get SSL certificates** (Let's Encrypt recommended):
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

2. **Update .env**:
   ```env
   SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
   SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
   WEBHOOK_URL=https://yourdomain.com
   ```

3. **Restart bot** - it will automatically use HTTPS

### Quick Development Checklist

- ✅ Database migrated (you've done this)
- ⬜ .env file configured (without SSL for dev)
- ⬜ Bot token set in .env
- ⬜ Run `npm run dev` to start
- ⬜ Use ngrok for HTTPS tunnel (if testing webhooks)

### Troubleshooting

**Bot not receiving updates?**
- Check webhook URL is correct
- Verify ngrok tunnel is running (if using)
- Check bot logs: `pm2 logs elitbot` or check console

**Port already in use?**
- Change `WEBHOOK_PORT` in .env to another port (e.g., 3000)
- Update ngrok command: `ngrok http 3000`

**Database connection issues?**
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

