/** Main menu handler */
import TelegramBot from 'node-telegram-bot-api';
import { getText, Language } from '../config/texts';

export async function showMainMenu(
  bot: TelegramBot,
  userId: number,
  language: Language
): Promise<void> {
  const keyboard = {
    inline_keyboard: [
      [
        { text: getText(language, 'menu_current_access'), callback_data: 'menu_current_access' },
        { text: getText(language, 'menu_bonus_request'), callback_data: 'menu_bonus_request' },
      ],
      [
        { text: getText(language, 'menu_promotions'), callback_data: 'menu_promotions' },
        { text: getText(language, 'menu_live_support'), callback_data: 'menu_live_support' },
      ],
      [
        { text: getText(language, 'menu_sports'), callback_data: 'menu_sports' },
        { text: getText(language, 'menu_elitwin_tv'), callback_data: 'menu_elitwin_tv' },
      ],
    ]
  };
  
  const menuMessage = language === 'tr' 
    ? "💙ElitWin Özel Telegram Botu\n\n🎁 250 FreeSpin Hoş Geldin Bonusu Seni Bekliyor!\n\n⚡️ Hemen katıl, kazanmaya başla.\n\n👋 Hoş geldin!\n\nBu bot üzerinden bonus taleplerini hızlıca iletebilir, güncel giriş adreslerine ulaşabilir ve destek ekibimizle anında iletişime geçebilirsin.\n\n🔹 Bonus Talep Et\nNumaranı paylaşarak bonus talebini kolayca oluştur.\n\n🎯 Güncel Giriş\nElitWin'e en güncel ve sorunsuz erişim linklerini görüntüle.\n\n💬 Canlı Destek\nSoruların mı var? Mesaj yazarak destek ekibimize hemen ulaş.\n\n🚀 Hazırsan başlayalım!\n\nMenüden devam edebilirsin."
    : "💙ElitWin Special Telegram Bot\n\n🎁 250 FreeSpin Welcome Bonus Awaits You!\n\n⚡️ Join now, start winning.\n\n👋 Welcome!\n\nThrough this bot you can quickly submit bonus requests, access current login addresses and instantly contact our support team.\n\n🔹 Request Bonus\nEasily create your bonus request by sharing your number.\n\n🎯 Current Access\nView the most current and trouble-free access links to ElitWin.\n\n💬 Live Support\nHave questions? Reach our support team immediately by sending a message.\n\n🚀 Ready? Let's start!\n\nYou can continue from the menu.";
  
  await bot.sendMessage(
    userId,
    menuMessage,
    { reply_markup: keyboard }
  );
}

