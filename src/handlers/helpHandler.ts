/** Help command handler */
import TelegramBot from 'node-telegram-bot-api';
import { userRepository } from '../database/userRepository';
import { getText, Language } from '../config/texts';
import { checkRateLimit } from '../utils/rateLimiter';
import { logger } from '../utils/logger';
import { showMainMenu } from './menuHandler';
import { handleBonusRequest, handlePromotions, handleLiveSupport } from './callbackHandler';

export function setupHelpHandler(bot: TelegramBot): void {
  bot.onText(/\/help/, async (msg) => {
    try {
      const userId = msg.from?.id;
      if (!userId) return;
      
      // Rate limiting
      if (!checkRateLimit(userId)) {
        await bot.sendMessage(userId, getText('en', 'error_rate_limit'));
        return;
      }
      
      // Get user's language
      const user = await userRepository.findById(userId);
      const language: Language = user?.language || 'en';
      
      const helpText = language === 'tr' 
        ? `📖 ElitWin Bot Yardım\n\n` +
          `Bu bot aracılığıyla:\n` +
          `• Güncel giriş linkine erişebilirsiniz\n` +
          `• Bonus talebinde bulunabilirsiniz\n` +
          `• Promosyonları görüntüleyebilirsiniz\n` +
          `• Canlı destek alabilirsiniz\n\n` +
          `Komutlar:\n` +
          `/start - Botu başlat\n` +
          `/help - Bu yardım mesajını göster\n\n` +
          `Ana menüyü görmek için /start komutunu kullanın.`
        : `📖 ElitWin Bot Help\n\n` +
          `Through this bot you can:\n` +
          `• Access current login link\n` +
          `• Request bonuses\n` +
          `• View promotions\n` +
          `• Get live support\n\n` +
          `Commands:\n` +
          `/start - Start the bot\n` +
          `/help - Show this help message\n\n` +
          `Use /start command to see the main menu.`;
      
      await bot.sendMessage(userId, helpText);
      
      // Show main menu if user is verified
      if (user?.is_verified) {
        await showMainMenu(bot, userId, language);
      }
    } catch (error) {
      logger.error('Error in help handler', error);
    }
  });
  
  // Bonus command - quick access to bonus request
  // Use ^ and $ to match exactly /bonus, not /bonus_requests
  bot.onText(/^\/bonus$/, async (msg) => {
    try {
      const userId = msg.from?.id;
      if (!userId) return;
      
      if (!checkRateLimit(userId)) {
        await bot.sendMessage(userId, getText('en', 'error_rate_limit'));
        return;
      }
      
      const user = await userRepository.findById(userId);
      if (!user || !user.is_verified) {
        await bot.sendMessage(userId, getText('en', 'error_not_verified'));
        return;
      }
      
      await handleBonusRequest(bot, userId, user.language);
    } catch (error) {
      logger.error('Error in bonus command handler', error);
    }
  });
  
  // Promo command - quick access to promotions
  bot.onText(/\/promo/, async (msg) => {
    try {
      const userId = msg.from?.id;
      if (!userId) return;
      
      if (!checkRateLimit(userId)) {
        await bot.sendMessage(userId, getText('en', 'error_rate_limit'));
        return;
      }
      
      const user = await userRepository.findById(userId);
      if (!user || !user.is_verified) {
        await bot.sendMessage(userId, getText('en', 'error_not_verified'));
        return;
      }
      
      await handlePromotions(bot, userId, user.language);
    } catch (error) {
      logger.error('Error in promo command handler', error);
    }
  });
  
  // Support command - quick access to live support
  bot.onText(/\/support/, async (msg) => {
    try {
      const userId = msg.from?.id;
      if (!userId) return;
      
      if (!checkRateLimit(userId)) {
        await bot.sendMessage(userId, getText('en', 'error_rate_limit'));
        return;
      }
      
      const user = await userRepository.findById(userId);
      if (!user || !user.is_verified) {
        await bot.sendMessage(userId, getText('en', 'error_not_verified'));
        return;
      }
      
      await handleLiveSupport(bot, userId, user.language);
    } catch (error) {
      logger.error('Error in support command handler', error);
    }
  });
}

