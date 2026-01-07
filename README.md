# ElitBot - Production Telegram Bot

A production-ready Telegram bot for ElitWin built with Node.js, TypeScript, and PostgreSQL.

## Quick Links

- 📖 [Complete Documentation](doc/README.md)
- 🚀 [Quick Start Guide](doc/QUICK_START.md)
- 👨‍💼 [Admin Guide](doc/ADMIN_GUIDE.md)
- 📋 [Features Documentation](doc/FEATURES.md)
- ✅ [Implementation Summary](doc/IMPLEMENTATION_SUMMARY.md)
- 🔧 [Troubleshooting Guide](doc/TROUBLESHOOTING.md)
- 💻 [Development Guide](doc/DEVELOPMENT.md)
- 🌐 [Nginx Setup Guide](doc/NGINX_SETUP.md)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Setup Database:**
   ```bash
   ./script/setup-db.sh
   ```

4. **Setup Nginx with SSL:**
   ```bash
   sudo ./script/setup-nginx.sh
   ```
   See [Nginx Setup Guide](doc/NGINX_SETUP.md) for details.

5. **Deploy:**
   ```bash
   ./script/deploy.sh
   ```

## Project Structure

```
Elitbot/
├── doc/              # Documentation
├── script/           # Deployment scripts
├── src/              # Source code
├── dist/             # Compiled JavaScript
├── env.example       # Environment template
└── package.json      # Dependencies
```

## Features

- ✅ Webhook-based architecture
- ✅ PostgreSQL database
- ✅ Multilingual support (TR/EN)
- ✅ Admin commands and broadcasts
- ✅ Queue-based message delivery
- ✅ Rate limiting and security

For complete documentation, see [doc/README.md](doc/README.md)

