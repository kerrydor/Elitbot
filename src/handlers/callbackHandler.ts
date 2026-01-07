/** Callback query handler */
import TelegramBot from 'node-telegram-bot-api';
import { userRepository } from '../database/userRepository';
import { getText, Language } from '../config/texts';
import { config } from '../config/settings';
import { checkRateLimit } from '../utils/rateLimiter';
import { logger } from '../utils/logger';
import { showMainMenu } from './menuHandler';
import { formatPromotions } from '../config/promotions';

// Export handler functions for use in other handlers
export async function handleBonusRequest(
  bot: TelegramBot,
  userId: number,
  language: Language
): Promise<void> {
  const keyboard = {
    keyboard: [[
      {
        text: getText(language, 'bonus_share_button'),
        request_contact: true,
      }
    ]],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
  
  await bot.sendMessage(
    userId,
    `${getText(language, 'bonus_request_title')}\n\n\n${getText(language, 'bonus_request_message')}`,
    { reply_markup: keyboard, parse_mode: 'Markdown' }
  );
}

export async function handlePromotions(
  bot: TelegramBot,
  userId: number,
  language: Language
): Promise<void> {
  const promoText = await formatPromotions(language);
  const keyboard = {
    inline_keyboard: [[
      {
        text: getText(language, 'promotions_button'),
        callback_data: 'menu_bonus_request',
      }
    ]]
  };
  
  await bot.sendMessage(
    userId,
    promoText,
    { reply_markup: keyboard, parse_mode: 'Markdown' }
  );
}

export async function handleLiveSupport(
  bot: TelegramBot,
  userId: number,
  language: Language
): Promise<void> {
  const keyboard = {
    inline_keyboard: [[
      {
        text: getText(language, 'menu_live_support'),
        web_app: { url: config.urls.liveSupport },
      }
    ]]
  };

  await bot.sendMessage(
    userId,
    getText(language, 'live_support_opening'),
    { reply_markup: keyboard }
  );
}

export function setupCallbackHandler(bot: TelegramBot): void {
  bot.on('callback_query', async (query) => {
    try {
      const userId = query.from.id;
      const data = query.data;
      
      if (!data) return;
      
      // Rate limiting
      if (!checkRateLimit(userId)) {
        await bot.answerCallbackQuery(query.id, {
          text: getText('en', 'error_rate_limit'),
          show_alert: true,
        });
        return;
      }
      
      // Get user
      let user = await userRepository.findById(userId);
      if (!user) {
        await userRepository.createOrUpdate({
          user_id: userId,
          username: query.from.username,
          first_name: query.from.first_name,
          last_name: query.from.last_name,
        });
        user = await userRepository.findById(userId);
      }
      
      if (!user) return;
      
      const language: Language = user.language;
      
      // Handle different callback actions
      switch (data) {
        case 'verify_user':
          await handleVerification(bot, userId, query.id, language);
          break;
          
        case 'select_language_tr':
          await userRepository.updateLanguage(userId, 'tr');
          await bot.answerCallbackQuery(query.id, {
            text: getText('tr', 'language_selected'),
          });
          await showMainMenu(bot, userId, 'tr');
          break;
          
        case 'select_language_en':
          await userRepository.updateLanguage(userId, 'en');
          await bot.answerCallbackQuery(query.id, {
            text: getText('en', 'language_selected'),
          });
          await showMainMenu(bot, userId, 'en');
          break;
          
        case 'menu_current_access':
          await handleCurrentAccess(bot, userId, language);
          break;
          
        case 'menu_bonus_request':
          await handleBonusRequest(bot, userId, language);
          break;
          
        case 'menu_promotions':
          await handlePromotions(bot, userId, language);
          break;
          
        case 'menu_live_support':
          await handleLiveSupport(bot, userId, language);
          break;
          
        case 'menu_sports':
          await handleSports(bot, userId, language);
          break;
          
        case 'menu_elitwin_tv':
          await handleElitWinTV(bot, userId, language);
          break;
          
        default:
          await bot.answerCallbackQuery(query.id);
      }
    } catch (error) {
      logger.error('Error in callback handler', error);
    }
  });
}

async function handleVerification(
  bot: TelegramBot,
  userId: number,
  queryId: string,
  language: Language
): Promise<void> {
  await userRepository.verifyUser(userId);
  await bot.answerCallbackQuery(queryId, { text: '✓' });
  
  // Show language selection
  const keyboard = {
    inline_keyboard: [[
      { text: getText('tr', 'language_turkish'), callback_data: 'select_language_tr' },
      { text: getText('en', 'language_english'), callback_data: 'select_language_en' },
    ]]
  };
  
  await bot.sendMessage(
    userId,
    'Lütfen dilinizi seçin',
    { reply_markup: keyboard }
  );
}

async function handleCurrentAccess(
  bot: TelegramBot,
  userId: number,
  language: Language
): Promise<void> {
  const keyboard = {
    inline_keyboard: [[
      {
        text: getText(language, 'current_access_button'),
        url: config.urls.currentAccess,
      }
    ]]
  };
  
  await bot.sendMessage(
    userId,
    getText(language, 'current_access_message'),
    { reply_markup: keyboard }
  );
}


async function handleSports(
  bot: TelegramBot,
  userId: number,
  language: Language
): Promise<void> {
  const keyboard = {
    inline_keyboard: [[
      {
        text: getText(language, 'sports_button'),
        url: config.urls.sports,
      }
    ]]
  };
  
  await bot.sendMessage(
    userId,
    getText(language, 'sports_coming_soon'),
    { reply_markup: keyboard }
  );
}

async function handleElitWinTV(
  bot: TelegramBot,
  userId: number,
  language: Language
): Promise<void> {
  const keyboard = {
    inline_keyboard: [[
      {
        text: getText(language, 'elitwin_tv_button'),
        url: config.urls.elitwinTv,
      }
    ]]
  };
  
  await bot.sendMessage(
    userId,
    getText(language, 'elitwin_tv_coming_soon'),
    { reply_markup: keyboard, parse_mode: 'Markdown' }
  );
}

