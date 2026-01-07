/** Promotions configuration - can be updated without changing core logic */
import { Language, getText } from './texts';
import { promotionRepository, Promotion as DBPromotion } from '../database/promotionRepository';

export interface Promotion {
  title: string;
  description: string;
  details: string;
}

// Fallback promotions (used if database is empty)
const fallbackPromotions: Record<Language, Promotion[]> = {
  tr: [
    {
      title: "Hoş Geldin Bonusu",
      description: "Yeni üyelere özel %100 hoş geldin bonusu!",
      details: "İlk yatırımınızda %100 bonus kazanın. Minimum yatırım: 100 TL"
    },
    {
      title: "Haftalık Cashback",
      description: "Her hafta %10 cashback kazanın!",
      details: "Haftalık kayıplarınızın %10'unu geri kazanın. Maksimum cashback: 500 TL"
    }
  ],
  en: []
};

export async function getPromotions(language: Language): Promise<Promotion[]> {
  try {
    const dbPromotions = await promotionRepository.getAll(language, true);
    if (dbPromotions.length > 0) {
      return dbPromotions.map(p => ({
        title: p.title,
        description: p.description,
        details: p.details,
      }));
    }
  } catch (error) {
    // Fallback to static promotions if database error
    console.error('Error fetching promotions from database:', error);
  }
  
  return fallbackPromotions[language] || fallbackPromotions.en;
}

export async function formatPromotions(language: Language): Promise<string> {
  // Use the header directly for both Turkish and English (it contains all promotions)
  return getText(language, 'promotions_header');
}

