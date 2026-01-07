/** Export all handlers */
import TelegramBot from 'node-telegram-bot-api';
import { setupStartHandler } from './startHandler';
import { setupCallbackHandler } from './callbackHandler';
import { setupMessageHandler } from './messageHandler';
import { setupAdminHandler } from './adminHandler';
import { setupInlineQueryHandler } from './inlineQueryHandler';
import { setupHelpHandler } from './helpHandler';

export function setupHandlers(bot: TelegramBot): void {
  // Setup admin handler FIRST to ensure admin commands are checked before user commands
  // This prevents conflicts like /bonus matching /bonus_requests
  setupAdminHandler(bot);
  setupStartHandler(bot);
  setupHelpHandler(bot);
  setupCallbackHandler(bot);
  setupMessageHandler(bot);
  setupInlineQueryHandler(bot);
}

