/** Message handler for contact sharing and commands */
import TelegramBot from 'node-telegram-bot-api';
import { userRepository } from '../database/userRepository';
import { getText, Language } from '../config/texts';
import { checkRateLimit } from '../utils/rateLimiter';
import { logger } from '../utils/logger';
import { showMainMenu } from './menuHandler';
import { config } from '../config/settings';

export function setupMessageHandler(bot: TelegramBot): void {
  // Handle contact sharing (phone number)
  bot.on('message', async (msg) => {
    try {
      const userId = msg.from?.id;
      if (!userId) return;
      
      // Rate limiting
      if (!checkRateLimit(userId)) {
        await bot.sendMessage(userId, getText('en', 'error_rate_limit'));
        return;
      }
      
      // Handle contact sharing
      if (msg.contact) {
        await handleContactShare(bot, userId, msg.contact.phone_number);
        return;
      }
      
      // Handle text commands
      if (msg.text) {
        const text = msg.text.trim();
        
        // Check if it's a command
        if (text.startsWith('/')) {
          // Commands are handled by their respective handlers
          return;
        }
        
        // Regular text messages - show main menu if user is verified
        const user = await userRepository.findById(userId);
        if (user?.is_verified) {
          await showMainMenu(bot, userId, user.language);
        }
      }
    } catch (error) {
      logger.error('Error in message handler', error);
    }
  });
}

async function handleContactShare(
  bot: TelegramBot,
  userId: number,
  phoneNumber: string
): Promise<void> {
  const user = await userRepository.findById(userId);
  if (!user) return;
  
  const language: Language = user.language;
  
  // Check if user can request bonus (pending request or cooldown)
  const canRequest = await userRepository.canRequestBonus(
    userId, 
    config.bonusRequest.cooldownMinutes
  );
  
  if (!canRequest.canRequest) {
    if (canRequest.reason === 'pending') {
      logger.info(`Bonus request blocked for user ${userId}: Already has pending request`);
      
      // Send clear notification to user
      const pendingMessage = getText(language, 'bonus_request_already_pending');
      await bot.sendMessage(
        userId,
        pendingMessage,
        { parse_mode: 'Markdown' }
      );
      
      // Also show their current request status
      const user = await userRepository.findById(userId);
      if (user) {
        const statusMessage = language === 'tr'
          ? `📋 *Mevcut Bonus Talebi Durumu*\n\n` +
            `⏳ Durum: Değerlendirme Bekleniyor\n` +
            `📱 Telefon: ${user.phone_number || 'N/A'}\n` +
            `📅 Talep Tarihi: ${user.last_bonus_request_at ? new Date(user.last_bonus_request_at).toLocaleString('tr-TR') : 'N/A'}\n\n` +
            `Lütfen mevcut talebinizin değerlendirilmesini bekleyin.`
          : `📋 *Current Bonus Request Status*\n\n` +
            `⏳ Status: Pending Review\n` +
            `📱 Phone: ${user.phone_number || 'N/A'}\n` +
            `📅 Request Date: ${user.last_bonus_request_at ? new Date(user.last_bonus_request_at).toLocaleString('en-US') : 'N/A'}\n\n` +
            `Please wait for your current request to be reviewed.`;
        
        await bot.sendMessage(
          userId,
          statusMessage,
          { parse_mode: 'Markdown' }
        );
      }
      
      await showMainMenu(bot, userId, language);
      return;
    } else if (canRequest.reason === 'cooldown' && canRequest.waitMinutes) {
      logger.info(`Bonus request blocked for user ${userId}: Cooldown active, wait ${canRequest.waitMinutes} minutes`);
      
      // Send clear notification to user
      const cooldownMessage = getText(language, 'bonus_request_cooldown', {
        minutes: canRequest.waitMinutes.toString()
      });
      await bot.sendMessage(
        userId,
        cooldownMessage,
        { parse_mode: 'Markdown' }
      );
      
      // Show when they can request again
      const user = await userRepository.findById(userId);
      if (user && user.last_bonus_request_at) {
        const lastRequest = new Date(user.last_bonus_request_at);
        const nextRequestTime = new Date(lastRequest.getTime() + (config.bonusRequest.cooldownMinutes * 60 * 1000));
        
        const nextRequestMessage = language === 'tr'
          ? `⏰ *Sonraki Talep Zamanı*\n\n` +
            `Son talebiniz: ${lastRequest.toLocaleString('tr-TR')}\n` +
            `Tekrar talep edebilirsiniz: ${nextRequestTime.toLocaleString('tr-TR')}`
          : `⏰ *Next Request Time*\n\n` +
            `Last request: ${lastRequest.toLocaleString('en-US')}\n` +
            `You can request again: ${nextRequestTime.toLocaleString('en-US')}`;
        
        await bot.sendMessage(
          userId,
          nextRequestMessage,
          { parse_mode: 'Markdown' }
        );
      }
      
      await showMainMenu(bot, userId, language);
      return;
    }
  }
  
  // Update user's phone number
  await userRepository.updatePhoneNumber(userId, phoneNumber);
  
  // Send confirmation
  await bot.sendMessage(
    userId,
    getText(language, 'bonus_phone_received')
  );
  
  // Notify all admins about the new bonus request
  await notifyAdminsOfBonusRequest(bot, userId, phoneNumber, user);
  
  // Show main menu
  await showMainMenu(bot, userId, language);
}

async function notifyAdminsOfBonusRequest(
  bot: TelegramBot,
  userId: number,
  phoneNumber: string,
  user: any
): Promise<void> {
  try {
    const { config } = await import('../config/settings');
    const userName = user.first_name || user.username || 'Unknown';
    const userLink = user.username ? `@${user.username}` : `ID: ${userId}`;
    
    const notificationMessage = 
      `🔔 New Bonus Request\n\n` +
      `👤 User: ${userName} (${userLink})\n` +
      `📱 Phone: ${phoneNumber}\n` +
      `🌐 Language: ${user.language}\n` +
      `📅 Requested: ${new Date().toLocaleString()}\n\n` +
      `Use /bonus_requests to view all pending requests\n` +
      `Use /approve_bonus ${userId} to approve\n` +
      `Use /reject_bonus ${userId} to reject`;
    
    // Notify all admins
    for (const adminId of config.admin.userIds) {
      try {
        await bot.sendMessage(adminId, notificationMessage);
      } catch (error) {
        logger.warn(`Could not notify admin ${adminId} about bonus request`, error);
      }
    }
  } catch (error) {
    logger.error('Error notifying admins about bonus request', error);
  }
}

