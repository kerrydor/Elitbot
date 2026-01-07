# ElitBot - Production Telegram Bot

A production-ready Telegram bot for ElitWin built with Node.js, TypeScript, and PostgreSQL. Features webhook architecture, multilingual support (TR/EN), admin features, and modular design for easy expansion.

## Features

- ✅ Webhook-based architecture (no long polling)
- ✅ PostgreSQL database
- ✅ Multilingual support (Turkish/English)
- ✅ User verification system
- ✅ Main menu with all features
- ✅ Current Access link
- ✅ Bonus request flow with phone sharing
- ✅ Promotions system (configurable)
- ✅ Live Support webview redirect
- ✅ Admin commands (stats, broadcast)
- ✅ Rate limiting protection
- ✅ Secure token handling
- ✅ Modular and extensible codebase
- ✅ Comprehensive logging

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- SSL certificate (for production webhook)
- VPS with root access
- PM2 (for process management)

## Installation

### 1. Clone and Install Dependencies

```bash
cd /root/Elitbot
npm install
```

### 2. Database Setup

Create PostgreSQL database:

```bash
sudo -u postgres psql
CREATE DATABASE elitbot;
CREATE USER elitbot_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE elitbot TO elitbot_user;
\q
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
nano .env
```

Required variables:
- `BOT_TOKEN`: Your Telegram bot token from @BotFather
- `WEBHOOK_URL`: Your domain URL (e.g., `https://yourdomain.com`)
- `DB_*`: PostgreSQL connection details
- `ADMIN_USER_IDS`: Comma-separated Telegram user IDs
- `SSL_CERT_PATH` and `SSL_KEY_PATH`: Paths to SSL certificates

### 4. Build and Run Migrations

```bash
npm run build
npm run migrate
```

### 5. SSL Certificate Setup

For production, you need SSL certificates. Options:

**Option A: Let's Encrypt (Recommended)**
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
# Certificates will be in /etc/letsencrypt/live/yourdomain.com/
```

**Option B: Existing Certificates**
Place your `cert.pem` and `key.pem` files and update `.env`.

### 6. Deploy with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the bot
npm run deploy

# Or manually:
pm2 start dist/index.js --name elitbot
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

### 7. Configure Nginx (Optional but Recommended)

Create `/etc/nginx/sites-available/elitbot`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location /webhook/ {
        proxy_pass http://localhost:8443;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /health {
        proxy_pass http://localhost:8443;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/elitbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Usage

### User Commands

- `/start` - Start the bot and verify
- `/help` - Show help message and commands

### Admin Commands

- `/stats` - View bot statistics
- `/broadcast <message>` - Broadcast message to all users

Example:
```
/broadcast Hello! This is a test message.
```

## Project Structure

```
Elitbot/
├── doc/                  # Documentation
│   ├── README.md         # Complete documentation
│   ├── ADMIN_GUIDE.md    # Admin guide
│   ├── QUICK_START.md    # Quick start guide
│   ├── FEATURES.md       # Features documentation
│   └── IMPLEMENTATION_SUMMARY.md
├── script/               # Scripts
│   └── deploy.sh         # Deployment script
├── src/                  # Source code
│   ├── config/           # Configuration files
│   │   ├── settings.ts   # Environment settings
│   │   ├── texts.ts      # Multilingual texts
│   │   └── promotions.ts # Promotions content
│   ├── database/         # Database layer
│   │   ├── connection.ts # PostgreSQL connection
│   │   ├── migrations.ts # Database migrations
│   │   ├── userRepository.ts # User data operations
│   │   ├── promotionRepository.ts # Promotion operations
│   │   └── migrate.ts    # Migration script
│   ├── handlers/         # Bot handlers
│   │   ├── startHandler.ts
│   │   ├── helpHandler.ts
│   │   ├── callbackHandler.ts
│   │   ├── messageHandler.ts
│   │   ├── menuHandler.ts
│   │   ├── inlineQueryHandler.ts
│   │   ├── adminHandler.ts
│   │   └── index.ts
│   ├── utils/            # Utilities
│   │   ├── logger.ts     # Winston logger
│   │   ├── rateLimiter.ts # Rate limiting
│   │   └── broadcastQueue.ts # Broadcast queue
│   ├── bot.ts            # Bot initialization
│   ├── server.ts         # Webhook server
│   └── index.ts          # Entry point
├── dist/                 # Compiled JavaScript
├── .env                  # Environment variables (not in git)
├── env.example           # Example environment file
├── package.json
├── tsconfig.json
└── README.md             # Root README
```

## Extension Points

### Adding New Features

1. **New Handler**: Create in `src/handlers/` and register in `handlers/index.ts`
2. **New Text**: Add to `config/texts.ts` in both languages
3. **New Database Table**: Add migration in `database/migrations.ts`
4. **New Admin Command**: Add to `handlers/adminHandler.ts`

### Updating Promotions

Edit `src/config/promotions.ts` and rebuild:

```bash
npm run build
pm2 restart elitbot
```

Or create an admin command to update from database.

### Adding New Languages

1. Add language code to `Language` type in `config/texts.ts`
2. Add translations object in `texts` object
3. Update language selection in handlers

## Monitoring

### PM2 Commands

```bash
pm2 status              # Check status
pm2 logs elitbot        # View logs
pm2 restart elitbot     # Restart bot
pm2 stop elitbot        # Stop bot
pm2 monit               # Monitor resources
```

### Logs

- Application logs: `combined.log` and `error.log`
- PM2 logs: `pm2 logs elitbot`

## Troubleshooting

### Webhook Not Working

1. Check SSL certificates are valid
2. Verify `WEBHOOK_URL` in `.env` is correct
3. Check firewall allows port 8443
4. Verify bot token is correct

### Database Connection Issues

1. Verify PostgreSQL is running: `sudo systemctl status postgresql`
2. Check connection details in `.env`
3. Verify database and user exist
4. Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`

### Rate Limiting

If users report rate limit errors, increase `RATE_LIMIT_PER_MINUTE` in `.env`.

## Security Notes

- Never commit `.env` file
- Keep SSL certificates secure
- Regularly update dependencies: `npm audit` and `npm update`
- Use strong database passwords
- Restrict admin user IDs

## Development

For development with auto-reload:

```bash
npm run dev
```

This uses `ts-node-dev` for hot reloading.

## License

ISC

## Support

For issues or questions, check logs first:
- Application: `combined.log`, `error.log`
- PM2: `pm2 logs elitbot`
- System: `journalctl -u nginx` (if using Nginx)

