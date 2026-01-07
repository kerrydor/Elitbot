/** Application settings and configuration */
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Telegram Bot Configuration
  bot: {
    token: process.env.BOT_TOKEN || '',
    webhookUrl: process.env.WEBHOOK_URL || '',
    webhookPort: parseInt(process.env.WEBHOOK_PORT || '8443', 10),
    webhookSecret: process.env.WEBHOOK_SECRET || '',
  },

  // PostgreSQL Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'elitbot',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  // Admin Configuration
  admin: {
    userIds: (process.env.ADMIN_USER_IDS || '')
      .split(',')
      .map(id => id.trim())
      .filter(id => id)
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id)),
  },

  // URLs
  urls: {
    currentAccess: process.env.CURRENT_ACCESS_URL || 'https://turk.pw/tgelitwin',
    liveSupport: process.env.LIVE_SUPPORT_URL || 'https://direct.lc.chat/19288057/',
    sports: process.env.SPORTS_URL || 'https://turk.pw/tgelitwin',
    elitwinTv: process.env.ELITWIN_TV_URL || 'https://turk.pw/tgelitwin',
  },

  // Rate Limiting
  rateLimit: {
    perMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '10', 10),
  },

  // Bonus Request Rate Limiting
  bonusRequest: {
    cooldownMinutes: parseInt(process.env.BONUS_REQUEST_COOLDOWN_MINUTES || '5', 10), // Default 5 minutes
  },

  // SSL Certificate Paths
  ssl: {
    certPath: process.env.SSL_CERT_PATH || '',
    keyPath: process.env.SSL_KEY_PATH || '',
  },

  // Video Configuration
  video: {
    enabled: process.env.VIDEO_ENABLED === 'true',
    path: process.env.VIDEO_PATH || '', // Local file path or URL
    caption: process.env.VIDEO_CAPTION || '',
  },

  // Bot Description Configuration (shown in bot profile before /start)
  botDescription: {
    description: process.env.BOT_DESCRIPTION || 'ElitWin Resmi Telegram Botuna Hoş Geldin! 🎉\n\nGüncel giriş linkine hızlıca ulaşabilir, bonus talep edebilir ve işlemlerini kolayca halledebilirsin 🔥\n\nBaşlamak için botu çalıştır ⬇️',
    shortDescription: process.env.BOT_SHORT_DESCRIPTION || 'ElitWin resmi bot - Bonus talep et, güncel giriş linklerine ulaş',
    profilePhoto: process.env.BOT_PROFILE_PHOTO || '', // Path to image file for bot profile photo
  },
};

// Validation
if (!config.bot.token) {
  throw new Error('BOT_TOKEN is required in .env file');
}

