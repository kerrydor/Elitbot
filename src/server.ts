/** Express webhook server */
import express, { Request, Response } from 'express';
import TelegramBot from 'node-telegram-bot-api';
import https from 'https';
import fs from 'fs';
import { config } from './config/settings';
import { logger } from './utils/logger';

export function setupWebhookServer(bot: TelegramBot): void {
  const app = express();
  
  // Security middleware
  app.use(express.json());
  
  // Webhook endpoint
  app.post(`/webhook/${config.bot.webhookSecret}`, (req: Request, res: Response) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
  
  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Start server
  if (config.ssl.certPath && config.ssl.keyPath) {
    // HTTPS server for production
    try {
      const options = {
        key: fs.readFileSync(config.ssl.keyPath),
        cert: fs.readFileSync(config.ssl.certPath),
      };
      
      const server = https.createServer(options, app);
      server.listen(config.bot.webhookPort, () => {
        logger.info(`HTTPS webhook server listening on port ${config.bot.webhookPort}`);
      });
    } catch (error) {
      logger.error('Failed to read SSL certificates', error);
      logger.warn('Falling back to HTTP server');
      app.listen(config.bot.webhookPort, () => {
        logger.info(`HTTP webhook server listening on port ${config.bot.webhookPort}`);
      });
    }
  } else {
    // HTTP server for development
    app.listen(config.bot.webhookPort, () => {
      logger.info(`HTTP webhook server listening on port ${config.bot.webhookPort}`);
      logger.warn('Running without SSL. Set SSL_CERT_PATH and SSL_KEY_PATH for production.');
    });
  }
  
  // Set webhook URL if configured
  if (config.bot.webhookUrl && config.bot.webhookSecret) {
    const webhookUrl = config.bot.webhookUrl.startsWith('http') 
      ? config.bot.webhookUrl 
      : `https://${config.bot.webhookUrl}`;
    
    // Ensure URL ends without trailing slash
    const cleanUrl = webhookUrl.replace(/\/$/, '');
    const fullWebhookUrl = `${cleanUrl}/webhook/${config.bot.webhookSecret}`;
    
    // Check if URL is HTTPS (required by Telegram)
    if (!fullWebhookUrl.startsWith('https://')) {
      logger.warn('⚠️  Telegram requires HTTPS for webhooks.');
      logger.warn('   For development, you can:');
      logger.warn('   1. Use ngrok: ngrok http 8443');
      logger.warn('   2. Leave WEBHOOK_URL empty to skip webhook setup');
      logger.warn('   3. Set up Nginx with SSL (see doc/NGINX_SETUP.md)');
      logger.warn(`   Current URL: ${fullWebhookUrl}`);
      logger.warn('   Webhook setup skipped. Bot will not receive updates via webhook.');
      return;
    }
    
    bot.setWebHook(fullWebhookUrl)
      .then(() => {
        logger.info(`✅ Webhook set to: ${fullWebhookUrl}`);
      })
      .catch((error: any) => {
        logger.error('Failed to set webhook', error);
        if (error.response?.body?.description) {
          logger.error(`Telegram error: ${error.response.body.description}`);
        }
      });
  } else {
    logger.warn('Webhook URL not configured. Bot will not receive updates.');
    logger.info('💡 For development without SSL, consider using ngrok or leave webhook empty.');
  }
}

