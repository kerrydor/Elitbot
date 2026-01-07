/** Admin command handlers */
import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config/settings';
import { userRepository } from '../database/userRepository';
import { promotionRepository } from '../database/promotionRepository';
import { getText, Language } from '../config/texts';
import { logger } from '../utils/logger';
import { broadcastQueue } from '../utils/broadcastQueue';

export function setupAdminHandler(bot: TelegramBot): void {
  // Admin stats command
  bot.onText(/\/stats/, async (msg) => {
    try {
      const userId = msg.from?.id;
      if (!userId || !isAdmin(userId)) {
        return;
      }
      
      const [totalUsers, dailyNew, verifiedUsers, phoneShared] = await Promise.all([
        userRepository.getTotalUsers(),
        userRepository.getDailyNewUsers(),
        userRepository.getVerifiedUsers(),
        userRepository.getPhoneSharedUsers(),
      ]);
      
      const statsMessage = getText('en', 'admin_stats', {
        total_users: totalUsers.toString(),
        daily_new: dailyNew.toString(),
        verified_users: verifiedUsers.toString(),
        phone_shared: phoneShared.toString(),
      });
      
      await bot.sendMessage(userId, statsMessage);
    } catch (error) {
      logger.error('Error in admin stats handler', error);
    }
  });
  
  // Admin broadcast command
  bot.onText(/\/broadcast (.+)/, async (msg, match) => {
    try {
      const userId = msg.from?.id;
      if (!userId || !isAdmin(userId)) {
        return;
      }
      
      if (!match || !match[1]) {
        await bot.sendMessage(userId, 'Usage: /broadcast <message>');
        return;
      }
      
      const message = match[1];
      await sendBroadcast(bot, userId, message);
    } catch (error) {
      logger.error('Error in admin broadcast handler', error);
    }
  });
  
  // Admin command: Notify about current access link change
  bot.onText(/\/notify_access (.+)/, async (msg, match) => {
    try {
      const userId = msg.from?.id;
      if (!userId || !isAdmin(userId)) {
        return;
      }
      
      if (!match || !match[1]) {
        await bot.sendMessage(userId, 'Usage: /notify_access <new_url>');
        return;
      }
      
      const newUrl = match[1];
      await notifyAccessLinkChange(bot, userId, newUrl);
    } catch (error) {
      logger.error('Error in notify access handler', error);
    }
  });
  
  // Admin command: Campaign announcement
  bot.onText(/\/announce (.+)/, async (msg, match) => {
    try {
      const userId = msg.from?.id;
      if (!userId || !isAdmin(userId)) {
        return;
      }
      
      if (!match || !match[1]) {
        await bot.sendMessage(userId, 'Usage: /announce <announcement_message>');
        return;
      }
      
      const message = match[1];
      await sendCampaignAnnouncement(bot, userId, message);
    } catch (error) {
      logger.error('Error in announce handler', error);
    }
  });
  
  // Admin command: Add promotion
  bot.onText(/\/add_promo (tr|en) (.+)/, async (msg, match) => {
    try {
      const userId = msg.from?.id;
      if (!userId || !isAdmin(userId)) {
        return;
      }
      
      if (!match || !match[1] || !match[2]) {
        await bot.sendMessage(userId, 'Usage: /add_promo <tr|en> <title>|<description>|<details>');
        return;
      }
      
      const language = match[1] as 'tr' | 'en';
      const parts = match[2].split('|');
      
      if (parts.length < 3) {
        await bot.sendMessage(userId, 'Format: title|description|details');
        return;
      }
      
      await addPromotion(bot, userId, language, parts[0], parts[1], parts[2]);
    } catch (error) {
      logger.error('Error in add promo handler', error);
    }
  });
  
  // Admin command: List promotions
  bot.onText(/\/list_promos (tr|en)?/, async (msg, match) => {
    try {
      const userId = msg.from?.id;
      if (!userId || !isAdmin(userId)) {
        return;
      }
      
      const language = (match && match[1]) ? match[1] as 'tr' | 'en' : 'en';
      await listPromotions(bot, userId, language);
    } catch (error) {
      logger.error('Error in list promos handler', error);
    }
  });
  
  // Admin command: Clear promotions
  bot.onText(/\/clear_promos (tr|en)/, async (msg, match) => {
    try {
      const userId = msg.from?.id;
      if (!userId || !isAdmin(userId)) {
        return;
      }
      
      if (!match || !match[1]) {
        await bot.sendMessage(userId, 'Usage: /clear_promos <tr|en>');
        return;
      }
      
      const language = match[1] as 'tr' | 'en';
      await clearPromotions(bot, userId, language);
    } catch (error) {
      logger.error('Error in clear promos handler', error);
    }
  });
  
  // Admin command: View pending bonus requests
  bot.onText(/\/bonus_requests/, async (msg) => {
    try {
      const userId = msg.from?.id;
      if (!userId || !isAdmin(userId)) {
        return;
      }
      
      await listBonusRequests(bot, userId);
    } catch (error) {
      logger.error('Error in bonus requests handler', error);
    }
  });
  
  // Admin command: Approve bonus request
  bot.onText(/\/approve_bonus (\d+)/, async (msg, match) => {
    try {
      const userId = msg.from?.id;
      if (!userId || !isAdmin(userId)) {
        return;
      }
      
      if (!match || !match[1]) {
        await bot.sendMessage(userId, 'Usage: /approve_bonus <user_id>');
        return;
      }
      
      const targetUserId = parseInt(match[1], 10);
      await updateBonusStatus(bot, userId, targetUserId, 'approved');
    } catch (error) {
      logger.error('Error in approve bonus handler', error);
    }
  });
  
  // Admin command: Reject bonus request
  bot.onText(/\/reject_bonus (\d+)/, async (msg, match) => {
    try {
      const userId = msg.from?.id;
      if (!userId || !isAdmin(userId)) {
        return;
      }
      
      if (!match || !match[1]) {
        await bot.sendMessage(userId, 'Usage: /reject_bonus <user_id>');
        return;
      }
      
      const targetUserId = parseInt(match[1], 10);
      await updateBonusStatus(bot, userId, targetUserId, 'rejected');
    } catch (error) {
      logger.error('Error in reject bonus handler', error);
    }
  });
  
  // Admin command: Clear specific bonus request
  bot.onText(/\/clear_bonus (\d+)/, async (msg, match) => {
    try {
      const userId = msg.from?.id;
      if (!userId || !isAdmin(userId)) {
        return;
      }
      
      if (!match || !match[1]) {
        await bot.sendMessage(userId, 'Usage: /clear_bonus <user_id>');
        return;
      }
      
      const targetUserId = parseInt(match[1], 10);
      await clearBonusRequest(bot, userId, targetUserId);
    } catch (error) {
      logger.error('Error in clear bonus handler', error);
    }
  });
  
  // Admin command: Clear all pending bonus requests
  bot.onText(/\/clear_all_bonus/, async (msg) => {
    try {
      const userId = msg.from?.id;
      if (!userId || !isAdmin(userId)) {
        return;
      }
      
      await clearAllBonusRequests(bot, userId);
    } catch (error) {
      logger.error('Error in clear all bonus handler', error);
    }
  });
}

function isAdmin(userId: number): boolean {
  return config.admin.userIds.includes(userId);
}

async function sendBroadcast(
  bot: TelegramBot,
  adminUserId: number,
  message: string
): Promise<void> {
  try {
    const userIds = await userRepository.getAllUserIds();
    const total = userIds.length;
    
    if (total === 0) {
      await bot.sendMessage(adminUserId, 'No users found to broadcast to.');
      return;
    }
    
    // Notify admin that broadcast is starting
    await bot.sendMessage(
      adminUserId,
      `📢 Starting broadcast to ${total} users...\nThis may take a few minutes.`
    );
    
    // Track results
    let sent = 0;
    let failed = 0;
    
    // Set up the send function for the queue
    broadcastQueue.setSendMessageFunction(async (userId: number, msg: string) => {
      try {
        await bot.sendMessage(userId, msg);
        sent++;
      } catch (error: any) {
        failed++;
        // Re-throw to trigger retry logic
        throw error;
      }
    });
    
    // Add all jobs to queue
    broadcastQueue.addJobs(userIds, message, 3); // Max 3 retries
    
    // Wait for queue to process (with timeout)
    const maxWaitTime = 10 * 60 * 1000; // 10 minutes max
    const startTime = Date.now();
    
    while (broadcastQueue.getStatus().processing || broadcastQueue.getStatus().pending > 0) {
      if (Date.now() - startTime > maxWaitTime) {
        logger.warn('Broadcast timeout reached');
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Send final report
    const resultMessage = getText('en', 'admin_broadcast_sent', {
      sent: sent.toString(),
      total: total.toString(),
    });
    
    await bot.sendMessage(adminUserId, resultMessage);
    
    if (failed > 0) {
      await bot.sendMessage(
        adminUserId,
        `⚠️ Failed to send to ${failed} users. Check logs for details.`
      );
    }
  } catch (error) {
    logger.error('Error in broadcast function', error);
    await bot.sendMessage(adminUserId, 'Error sending broadcast. Check logs.');
  }
}

async function notifyAccessLinkChange(
  bot: TelegramBot,
  adminUserId: number,
  newUrl: string
): Promise<void> {
  try {
    // Update config (note: this is in-memory only, should persist to .env in production)
    config.urls.currentAccess = newUrl;
    
    // Create notification message in both languages
    const trMessage = `🔔 Güncel Giriş Linki Güncellendi!\n\nYeni giriş linki:\n${newUrl}\n\nGüncel giriş menüsünden erişebilirsiniz.`;
    const enMessage = `🔔 Current Access Link Updated!\n\nNew access link:\n${newUrl}\n\nYou can access it from the Current Access menu.`;
    
    const userIds = await userRepository.getAllUserIds();
    
    if (userIds.length === 0) {
      await bot.sendMessage(adminUserId, 'No users found to notify.');
      return;
    }
    
    // Get users and group by language
    const users = await Promise.all(
      userIds.map(id => userRepository.findById(id))
    );
    
    const trUserIds: number[] = [];
    const enUserIds: number[] = [];
    
    for (let i = 0; i < userIds.length; i++) {
      const user = users[i];
      if (user?.language === 'tr') {
        trUserIds.push(userIds[i]);
      } else {
        enUserIds.push(userIds[i]);
      }
    }
    
    // Track results
    let sent = 0;
    let failed = 0;
    
    broadcastQueue.setSendMessageFunction(async (userId: number, msg: string) => {
      try {
        await bot.sendMessage(userId, msg);
        sent++;
      } catch (error: any) {
        failed++;
        throw error;
      }
    });
    
    // Add jobs for Turkish users
    if (trUserIds.length > 0) {
      broadcastQueue.addJobs(trUserIds, trMessage, 2);
    }
    
    // Add jobs for English users
    if (enUserIds.length > 0) {
      broadcastQueue.addJobs(enUserIds, enMessage, 2);
    }
    
    // Wait for queue to process
    const maxWaitTime = 10 * 60 * 1000; // 10 minutes max
    const startTime = Date.now();
    
    while (broadcastQueue.getStatus().processing || broadcastQueue.getStatus().pending > 0) {
      if (Date.now() - startTime > maxWaitTime) {
        logger.warn('Notification timeout reached');
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await bot.sendMessage(
      adminUserId,
      `✅ Access link updated and notification sent to ${sent} users.${failed > 0 ? ` Failed: ${failed}` : ''}`
    );
  } catch (error) {
    logger.error('Error in notify access link change', error);
    await bot.sendMessage(adminUserId, 'Error notifying users. Check logs.');
  }
}

async function sendCampaignAnnouncement(
  bot: TelegramBot,
  adminUserId: number,
  message: string
): Promise<void> {
  // Campaign announcement is essentially a broadcast with a prefix
  const announcementMessage = `🎉 Campaign Announcement\n\n${message}`;
  await sendBroadcast(bot, adminUserId, announcementMessage);
}

async function addPromotion(
  bot: TelegramBot,
  adminUserId: number,
  language: Language,
  title: string,
  description: string,
  details: string
): Promise<void> {
  try {
    const promotion = await promotionRepository.create({
      language,
      title: title.trim(),
      description: description.trim(),
      details: details.trim(),
    });
    
    await bot.sendMessage(
      adminUserId,
      `✅ Promotion added:\n\nTitle: ${promotion.title}\nLanguage: ${language}\nID: ${promotion.id}`
    );
  } catch (error) {
    logger.error('Error adding promotion', error);
    await bot.sendMessage(adminUserId, 'Error adding promotion. Check logs.');
  }
}

async function listPromotions(
  bot: TelegramBot,
  adminUserId: number,
  language: Language
): Promise<void> {
  try {
    const promotions = await promotionRepository.getAll(language, false);
    
    if (promotions.length === 0) {
      await bot.sendMessage(adminUserId, `No promotions found for language: ${language}`);
      return;
    }
    
    let message = `📋 Promotions (${language}):\n\n`;
    promotions.forEach((promo, index) => {
      message += `${index + 1}. ${promo.is_active ? '✅' : '❌'} [ID: ${promo.id}]\n`;
      message += `   Title: ${promo.title}\n`;
      message += `   Description: ${promo.description.substring(0, 50)}...\n\n`;
    });
    
    await bot.sendMessage(adminUserId, message);
  } catch (error) {
    logger.error('Error listing promotions', error);
    await bot.sendMessage(adminUserId, 'Error listing promotions. Check logs.');
  }
}

async function clearPromotions(
  bot: TelegramBot,
  adminUserId: number,
  language: Language
): Promise<void> {
  try {
    await promotionRepository.clearAll(language);
    await bot.sendMessage(adminUserId, `✅ All promotions cleared for language: ${language}`);
  } catch (error) {
    logger.error('Error clearing promotions', error);
    await bot.sendMessage(adminUserId, 'Error clearing promotions. Check logs.');
  }
}

async function listBonusRequests(
  bot: TelegramBot,
  adminUserId: number
): Promise<void> {
  try {
    const requests = await userRepository.getPendingBonusRequests();
    
    if (requests.length === 0) {
      await bot.sendMessage(adminUserId, '📋 No pending bonus requests.');
      return;
    }
    
    let message = `📋 Pending Bonus Requests (${requests.length}):\n\n`;
    
    for (let i = 0; i < requests.length; i++) {
      const user = requests[i];
      const userName = user.first_name || user.username || 'Unknown';
      const userLink = user.username ? `@${user.username}` : `ID: ${user.user_id}`;
      const requestDate = new Date(user.created_at).toLocaleString();
      
      message += `${i + 1}. 👤 ${userName} (${userLink})\n`;
      message += `   📱 Phone: ${user.phone_number || 'N/A'}\n`;
      message += `   📅 Requested: ${requestDate}\n`;
      message += `   /approve_bonus ${user.user_id} | /reject_bonus ${user.user_id}\n\n`;
    }
    
    // Split message if too long (Telegram limit is 4096 characters)
    if (message.length > 4000) {
      const chunks = message.match(/.{1,4000}/g) || [];
      for (const chunk of chunks) {
        await bot.sendMessage(adminUserId, chunk, { parse_mode: 'HTML' });
      }
    } else {
      await bot.sendMessage(adminUserId, message, { parse_mode: 'HTML' });
    }
  } catch (error) {
    logger.error('Error listing bonus requests', error);
    await bot.sendMessage(adminUserId, 'Error listing bonus requests. Check logs.');
  }
}

async function updateBonusStatus(
  bot: TelegramBot,
  adminUserId: number,
  targetUserId: number,
  status: 'approved' | 'rejected'
): Promise<void> {
  try {
    const user = await userRepository.findById(targetUserId);
    
    if (!user) {
      await bot.sendMessage(adminUserId, `❌ User not found: ${targetUserId}`);
      return;
    }
    
    if (user.bonus_status !== 'pending') {
      await bot.sendMessage(
        adminUserId,
        `⚠️ User ${targetUserId} bonus status is already: ${user.bonus_status}`
      );
      return;
    }
    
    await userRepository.updateBonusStatus(targetUserId, status);
    
    const statusEmoji = status === 'approved' ? '✅' : '❌';
    await bot.sendMessage(
      adminUserId,
      `${statusEmoji} Bonus request ${status} for user ${targetUserId}\n\n` +
      `User: ${user.first_name || user.username || 'Unknown'}\n` +
      `Phone: ${user.phone_number || 'N/A'}`
    );
    
    // Optionally notify the user
    try {
      const userLanguage = user.language;
      const notificationMessage = status === 'approved'
        ? (userLanguage === 'tr' 
          ? '✅ Bonus talebiniz onaylandı! Hesabınızı kontrol edin.'
          : '✅ Your bonus request has been approved! Please check your account.')
        : (userLanguage === 'tr'
          ? '❌ Bonus talebiniz reddedildi. Daha fazla bilgi için destek ekibimizle iletişime geçin.'
          : '❌ Your bonus request has been rejected. Please contact our support team for more information.');
      
      await bot.sendMessage(targetUserId, notificationMessage);
    } catch (error) {
      logger.warn(`Could not notify user ${targetUserId} about bonus status`, error);
    }
  } catch (error) {
    logger.error('Error updating bonus status', error);
    await bot.sendMessage(adminUserId, 'Error updating bonus status. Check logs.');
  }
}

async function clearBonusRequest(
  bot: TelegramBot,
  adminUserId: number,
  targetUserId: number
): Promise<void> {
  try {
    const user = await userRepository.findById(targetUserId);
    
    if (!user) {
      await bot.sendMessage(adminUserId, `❌ User not found: ${targetUserId}`);
      return;
    }
    
    if (!user.bonus_requested) {
      await bot.sendMessage(
        adminUserId,
        `⚠️ User ${targetUserId} has no bonus request to clear.`
      );
      return;
    }
    
    await userRepository.clearBonusRequest(targetUserId);
    
    await bot.sendMessage(
      adminUserId,
      `🗑️ Bonus request cleared for user ${targetUserId}\n\n` +
      `User: ${user.first_name || user.username || 'Unknown'}\n` +
      `Phone: ${user.phone_number || 'N/A'} (removed)\n` +
      `Status: Reset to pending`
    );
  } catch (error) {
    logger.error('Error clearing bonus request', error);
    await bot.sendMessage(adminUserId, 'Error clearing bonus request. Check logs.');
  }
}

async function clearAllBonusRequests(
  bot: TelegramBot,
  adminUserId: number
): Promise<void> {
  try {
    const clearedCount = await userRepository.clearAllPendingBonusRequests();
    
    await bot.sendMessage(
      adminUserId,
      `🗑️ Cleared ${clearedCount} pending bonus request(s) from the database.\n\n` +
      `All phone numbers and bonus request data have been removed.`
    );
  } catch (error) {
    logger.error('Error clearing all bonus requests', error);
    await bot.sendMessage(adminUserId, 'Error clearing bonus requests. Check logs.');
  }
}

