/** Multilingual text content for the bot */
export type Language = 'tr' | 'en';

export interface TextKeys {
  // Start & Security
  welcome: string;
  verify_button: string;
  video_caption: string;
  
  // Language Selection
  language_turkish: string;
  language_english: string;
  language_selected: string;
  
  // Main Menu
  menu_current_access: string;
  menu_bonus_request: string;
  menu_promotions: string;
  menu_live_support: string;
  menu_sports: string;
  menu_elitwin_tv: string;
  
  // Current Access
  current_access_message: string;
  current_access_button: string;
  
  // Bonus Request
  bonus_request_title: string;
  bonus_request_message: string;
  bonus_share_button: string;
  bonus_phone_received: string;
  bonus_request_pending: string;
  bonus_request_already_pending: string;
  bonus_request_cooldown: string;
  
  // Promotions
  promotions_header: string;
  promotions_empty: string;
  promotions_button: string;
  
  // Live Support
  live_support_opening: string;
  
  // Sports & ElitWin TV
  sports_coming_soon: string;
  sports_button: string;
  elitwin_tv_coming_soon: string;
  elitwin_tv_button: string;
  
  // Errors
  error_generic: string;
  error_not_verified: string;
  error_rate_limit: string;
  
  // Admin
  admin_broadcast_sent: string;
  admin_stats: string;
}

export const texts: Record<Language, TextKeys> = {
  tr: {
    // Start & Security
    welcome: "👋 ElitWin Telegram Botuna Hoş Geldin!\n\nDevam edebilmek için lütfen robot olmadığınızı doğrulayınız.",
    verify_button: "Ben Robot Değilim",
    video_caption: "ElitWin Resmi Telegram Botuna Hoş Geldin! 🎉\n\nGüncel giriş linkine hızlıca ulaşabilir, bonus talep edebilir ve işlemlerini kolayca halledebilirsin 🔥\n\nBaşlamak için botu çalıştır ⬇️",
    
    // Language Selection
    language_turkish: "🇹🇷 Türkçe",
    language_english: "🇬🇧 English",
    language_selected: "Dil seçiminiz kaydedildi.",
    
    // Main Menu
    menu_current_access: "🔗 Güncel Giriş",
    menu_bonus_request: "🎁 Bonus Talep Et",
    menu_promotions: "🔥 Promosyonlar",
    menu_live_support: "💬 Canlı Destek",
    menu_sports: "⚽ Spor",
    menu_elitwin_tv: "📺 ElitWin TV",
    
    // Current Access
    current_access_message: "ElitWin'e güncel giriş için aşağıdaki butonu kullanabilirsiniz.",
    current_access_button: "Güncel Girişe Git",
    
    // Bonus Request
    bonus_request_title: "*📞 Telefon Numaranı Paylaşarak Devam Et*",
    bonus_request_message: "Bonus talebini değerlendirebilmemiz için üyeliğini doğrulamamız gerekiyor.\n\nAşağıdaki '' *📲 Numaramı Paylaş* '' butonunu kullanarak güvenli şekilde devam edebilirsin.\n\n\n*🔒 Gizlilik Garantisi:*\n\nTelefon numaran yalnızca sistemdeki üyeliğinle eşleştirme ve destek süreçleri için kullanılır.\n\n\n*🎁 Hesabın doğrulandıktan sonra, uygun bonus ve kampanya durumu kontrol edilir.*\n\n\n*👉 Devam etmek için numaranı paylaşman yeterlidir.*",
    bonus_share_button: "📲 Numaramı Paylaş",
    bonus_phone_received: "Telefon numaranız alındı. Talebiniz değerlendirilmek üzere iletilmiştir.",
    bonus_request_pending: "Bonus talebiniz değerlendirme aşamasındadır.",
    bonus_request_already_pending: "⏳ Zaten bekleyen bir bonus talebiniz var. Lütfen mevcut talebinizin değerlendirilmesini bekleyin.",
    bonus_request_cooldown: "⏰ Çok sık bonus talebi gönderiyorsunuz. Lütfen {minutes} dakika sonra tekrar deneyin.",
    
    // Promotions
    promotions_header: "🎁 ElitWin Güncel Promosyonlar\n\n🔥 ElitWin'de kazanç fırsatları hız kesmeden devam ediyor!\n\nAşağıdaki özel bonuslardan hemen yararlanabilirsin 👇\n\n\n🍀 *%300 Hoş Geldin Bonusu*\n\n\n🌙 *%50 Gece Bonusu*\n\n\n🎉 *%40 Hafta Sonu Bonusu*\n\n\n🔁 *%30 Kayıp Bonusu*\n\n\n🎰 *%15 EGT Digital Özel Bonus*\n\n\n💸 *%10 Çevrimsiz Yatırım Bonusu*\n\n\n🛡 *%5 Haftalık Telafi Bonusu*",
    promotions_empty: "Şu anda aktif promosyon bulunmamaktadır.",
    promotions_button: "🎁 Bonus İstiyorum",
    
    // Live Support
    live_support_opening: "👋 Yardıma mı ihtiyacınız var?\n\nCanlı destek ekibimizle görüşmek için aşağıdaki butona dokunun 😊",
    
    // Sports & ElitWin TV
    sports_coming_soon: "⚽ ElitWin Spor Bahisleri\n\nBüyük maçlar, güçlü oranlar ve anlık bahis fırsatları seni bekliyor!\n\nFutbol, basketbol, tenis ve daha fazlasında kazanç şimdi başlıyor.\n\n🔥 Canlı maçlarda anında bahis\n📊 Yüksek oranlar & özel karşılaşmalar\n💰 Hızlı kazanç, hızlı çekim\n\n🎯 Favori maçını seç, kuponunu oluştur ve oyuna gir!",
    sports_button: "⚽ Spor Bahislerine Git",
    elitwin_tv_coming_soon: "*ElitWin TV 📺*\n\nMaçları donmadan canlı izlemek için üyelerimiz, ücretsiz ElitWin TV'yi kullanıyor.\n\n*Canlı maçları kaçırmamak için ElitWin TV'yi kullanabilirsiniz.*",
    elitwin_tv_button: "ElitWin TV İZLE",
    
    // Errors
    error_generic: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
    error_not_verified: "Devam etmek için lütfen doğrulamayı tamamlayın.",
    error_rate_limit: "Çok fazla istek gönderdiniz. Lütfen bir süre bekleyin.",
    
    // Admin
    admin_broadcast_sent: "Yayın gönderildi: {sent}/{total} kullanıcıya ulaştı.",
    admin_stats: "📊 Bot İstatistikleri\n\n👥 Toplam Kullanıcı: {total_users}\n🆕 Bugün Yeni Kullanıcı: {daily_new}\n✅ Doğrulanmış Kullanıcı: {verified_users}\n📱 Telefon Paylaşan: {phone_shared}",
  },
  en: {
    // Start & Security
    welcome: "👋 Welcome to ElitWin Telegram Bot!\n\nPlease verify that you are not a robot to continue.",
    verify_button: "I'm Not a Robot",
    video_caption: "Welcome to ElitWin Official Telegram Bot! 🎉\n\nYou can quickly access current login links, request bonuses and easily handle your transactions 🔥\n\nRun the bot to get started ⬇️",
    
    // Language Selection
    language_turkish: "🇹🇷 Türkçe",
    language_english: "🇬🇧 English",
    language_selected: "Your language preference has been saved.",
    
    // Main Menu
    menu_current_access: "🔗 Current Access",
    menu_bonus_request: "🎁 Request Bonus",
    menu_promotions: "🔥 Promotions",
    menu_live_support: "💬 Live Support",
    menu_sports: "⚽ Sports",
    menu_elitwin_tv: "📺 ElitWin TV",
    
    // Current Access
    current_access_message: "You can use the button below for current access to ElitWin.",
    current_access_button: "Go to Current Access",
    
    // Bonus Request
    bonus_request_title: "*📞 Continue by Sharing Your Phone Number*",
    bonus_request_message: "To review your bonus request, we need to verify your account.\n\nPlease use the *📲 Share My Number* button below to proceed securely.\n\n\n*🔒 Privacy Guarantee:*\n\nYour phone number is used only for account verification and support purposes.\n\n\n*🎁 Once verified, your account's bonus eligibility will be checked.*\n\n\n*👉 Share your number below to continue.*",
    bonus_share_button: "📲 Share My Number",
    bonus_phone_received: "Your phone number has been received. Your request has been forwarded for review.",
    bonus_request_pending: "Your bonus request is under review.",
    bonus_request_already_pending: "⏳ You already have a pending bonus request. Please wait for your current request to be reviewed.",
    bonus_request_cooldown: "⏰ You are requesting bonuses too frequently. Please try again in {minutes} minutes.",
    
    // Promotions
    promotions_header: "🎁 ElitWin Current Promotions\n\n\n🔥 Winning opportunities at ElitWin continue without slowing down!\n\nYou can immediately benefit from the special bonuses below 👇\n\n🍀 %300 Welcome Bonus\n\n🌙 %50 Night Bonus\n\n🎉 %40 Weekend Bonus\n\n🔁 %30 Loss Bonus\n\n🎰 %15 EGT Digital Special Bonus\n\n💸 %10 No-Wager Deposit Bonus\n\n🛡 %5 Weekly Compensation Bonus",
    promotions_empty: "There are currently no active promotions.",
    promotions_button: "🎁 I Want Bonus",
    
    // Live Support
    live_support_opening: "👋 Need help?\n\nTouch the button below to talk to our live support team 😊",
    
    // Sports & ElitWin TV
    sports_coming_soon: "⚽ ElitWin Sports Betting\n\nBig matches, strong odds and instant betting opportunities await you!\n\nWinnings start now in football, basketball, tennis and more.\n\n🔥 Instant betting on live matches\n📊 High odds & special matches\n💰 Fast winnings, fast withdrawal\n\n🎯 Choose your favorite match, create your coupon and join the game!",
    sports_button: "⚽ Go to Sports Betting",
    elitwin_tv_coming_soon: "ElitWin TV 📺\n\nOur members use free ElitWin TV to watch matches live without freezing.\n\nYou can use ElitWin TV to not miss live matches.",
    elitwin_tv_button: "Watch ElitWin TV",
    
    // Errors
    error_generic: "An error occurred. Please try again later.",
    error_not_verified: "Please complete the verification to continue.",
    error_rate_limit: "Too many requests. Please wait a moment.",
    
    // Admin
    admin_broadcast_sent: "Broadcast sent: reached {sent}/{total} users.",
    admin_stats: "📊 Bot Statistics\n\n👥 Total Users: {total_users}\n🆕 New Users Today: {daily_new}\n✅ Verified Users: {verified_users}\n📱 Phone Shared: {phone_shared}",
  },
};

export function getText(language: Language, key: keyof TextKeys, params?: Record<string, string | number>): string {
  const lang = language in texts ? language : 'en';
  let text = texts[lang][key];
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      text = text.replace(`{${key}}`, String(value));
    });
  }
  
  return text;
}

