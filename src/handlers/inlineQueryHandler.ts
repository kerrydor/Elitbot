/** Inline query handler */
import TelegramBot from 'node-telegram-bot-api';
import { getText, Language } from '../config/texts';
import { userRepository } from '../database/userRepository';
import { checkRateLimit } from '../utils/rateLimiter';
import { logger } from '../utils/logger';
import { config } from '../config/settings';

export function setupInlineQueryHandler(bot: TelegramBot): void {
  bot.on('inline_query', async (query) => {
    try {
      const userId = query.from.id;
      
      // Rate limiting
      if (!checkRateLimit(userId)) {
        return;
      }
      
      // Get user's language
      const user = await userRepository.findById(userId);
      const language: Language = user?.language || 'en';
      
      const queryText = query.query.toLowerCase().trim();
      
      // Define inline results
      const results: TelegramBot.InlineQueryResult[] = [];
      
      // If query is empty or matches common terms, show main options
      if (!queryText || queryText.length === 0 || 
          queryText.includes('menu') || queryText.includes('menü') ||
          queryText.includes('help') || queryText.includes('yardım')) {
        
        results.push({
          type: 'article',
          id: '1',
          title: getText(language, 'menu_current_access'),
          description: getText(language, 'current_access_message'),
          input_message_content: {
            message_text: getText(language, 'current_access_message'),
          },
          reply_markup: {
            inline_keyboard: [[
              {
                text: getText(language, 'current_access_button'),
                url: config.urls.currentAccess,
              }
            ]]
          }
        });
        
        results.push({
          type: 'article',
          id: '2',
          title: getText(language, 'menu_promotions'),
          description: 'View current promotions',
          input_message_content: {
            message_text: getText(language, 'promotions_header'),
          }
        });
        
        results.push({
          type: 'article',
          id: '3',
          title: getText(language, 'menu_live_support'),
          description: 'Get live support',
          input_message_content: {
            message_text: getText(language, 'live_support_opening'),
          },
          reply_markup: {
            inline_keyboard: [[
              {
                text: getText(language, 'menu_live_support'),
                url: config.urls.liveSupport,
              }
            ]]
          }
        });
      }
      
      // Search functionality for promotions
      if (queryText.includes('promo') || queryText.includes('bonus') || 
          queryText.includes('kampanya') || queryText.includes('promosyon')) {
        const { formatPromotions } = await import('../config/promotions');
        const promoText = formatPromotions(language);
        
        results.push({
          type: 'article',
          id: 'promo',
          title: getText(language, 'menu_promotions'),
          description: 'Current promotions and bonuses',
          input_message_content: {
            message_text: promoText,
          }
        });
      }
      
      // Answer inline query
      await bot.answerInlineQuery(query.id, results, {
        cache_time: 300, // Cache for 5 minutes
        is_personal: true,
      });
    } catch (error) {
      logger.error('Error in inline query handler', error);
    }
  });
}

