/** Start command handler */
import TelegramBot from 'node-telegram-bot-api';
import { userRepository } from '../database/userRepository';
import { getText, Language } from '../config/texts';
import { checkRateLimit } from '../utils/rateLimiter';
import { logger } from '../utils/logger';
import { config } from '../config/settings';
import fs from 'fs';

export function setupStartHandler(bot: TelegramBot): void {
  bot.onText(/\/start/, async (msg) => {
    try {
      const userId = msg.from?.id;
      if (!userId) return;
      
      // Rate limiting
      if (!checkRateLimit(userId)) {
        await bot.sendMessage(userId, getText('en', 'error_rate_limit'));
        return;
      }
      
      // Create or update user
      await userRepository.createOrUpdate({
        user_id: userId,
        username: msg.from?.username,
        first_name: msg.from?.first_name,
        last_name: msg.from?.last_name,
      });
      
      // Always use Turkish for initial welcome message
      const language: Language = 'tr';
      
      // Send welcome message with verification button
      const keyboard = {
        inline_keyboard: [[
          {
            text: getText('tr', 'verify_button'),
            callback_data: 'verify_user',
          }
        ]]
      };
      
      await bot.sendMessage(
        userId,
        getText('tr', 'welcome'),
        { reply_markup: keyboard }
      );
    } catch (error) {
      logger.error('Error in start handler', error);
    }
  });
}

