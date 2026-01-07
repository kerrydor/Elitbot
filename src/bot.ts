/** Telegram Bot initialization */
import TelegramBot from 'node-telegram-bot-api';
import { config } from './config/settings';
import { setupHandlers } from './handlers';
import { logger } from './utils/logger';
import fs from 'fs';

export async function createBot(): Promise<TelegramBot> {
  // Create bot without webhook config (we'll set it up in server)
  const bot = new TelegramBot(config.bot.token);
  
  // Set bot description and short description (shown in bot profile)
  try {
    await bot.setMyDescription({ description: config.botDescription.description });
    logger.info('Bot description set');
  } catch (error) {
    logger.warn('Failed to set bot description', error);
  }

  try {
    await bot.setMyShortDescription({ short_description: config.botDescription.shortDescription });
    logger.info('Bot short description set');
  } catch (error) {
    logger.warn('Failed to set bot short description', error);
  }

  // Set bot commands menu (shown when user types /)
  // More commands = better discoverability
  try {
    await bot.setMyCommands([
      { command: 'start', description: 'Botu başlat / Start the bot' },
      { command: 'menu', description: 'Ana menüyü göster / Show main menu' },
      { command: 'bonus', description: 'Bonus talep et / Request bonus' },
      { command: 'promo', description: 'Promosyonlar / Promotions' },
      { command: 'support', description: 'Canlı destek / Live support' },
      { command: 'help', description: 'Yardım / Help' },
    ]);
    logger.info('Bot commands menu set');
  } catch (error) {
    logger.warn('Failed to set bot commands', error);
  }

  // Set bot profile photo if provided (Note: This requires special permissions)
  // Profile photos are typically set via BotFather, but we can try programmatically
  if (config.botDescription.profilePhoto && fs.existsSync(config.botDescription.profilePhoto)) {
    try {
      // Note: setChatPhoto is for group/channel photos, not bot profile photos
      // Bot profile photos must be set via BotFather manually
      // However, we can log this for manual setup
      logger.info(`Profile photo found at: ${config.botDescription.profilePhoto}`);
      logger.info('Note: Bot profile photos must be set manually via @BotFather');
      logger.info('  1. Send /setuserpic to @BotFather');
      logger.info('  2. Select your bot');
      logger.info('  3. Upload the image from:', config.botDescription.profilePhoto);
    } catch (error) {
      logger.warn('Profile photo setup note logged', error);
    }
  }
  
  // Setup all handlers
  setupHandlers(bot);
  
  logger.info('Bot handlers initialized');
  
  return bot;
}

