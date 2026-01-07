/** Promotion repository for database operations */
import { pool } from './connection';
import { Language } from '../config/texts';
import { logger } from '../utils/logger';

export interface Promotion {
  id: number;
  language: Language;
  title: string;
  description: string;
  details: string;
  is_active: boolean;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePromotionData {
  language: Language;
  title: string;
  description: string;
  details: string;
  display_order?: number;
}

export class PromotionRepository {
  async getAll(language: Language, activeOnly: boolean = true): Promise<Promotion[]> {
    const query = activeOnly
      ? 'SELECT * FROM promotions WHERE language = $1 AND is_active = TRUE ORDER BY display_order, id'
      : 'SELECT * FROM promotions WHERE language = $1 ORDER BY display_order, id';
    
    const result = await pool.query(query, [language]);
    return result.rows.map(this.mapRowToPromotion);
  }
  
  async create(data: CreatePromotionData): Promise<Promotion> {
    const query = `
      INSERT INTO promotions (language, title, description, details, display_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      data.language,
      data.title,
      data.description,
      data.details,
      data.display_order || 0,
    ]);
    
    return this.mapRowToPromotion(result.rows[0]);
  }
  
  async update(id: number, data: Partial<CreatePromotionData>): Promise<Promotion> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (data.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.details !== undefined) {
      updates.push(`details = $${paramCount++}`);
      values.push(data.details);
    }
    if (data.display_order !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(data.display_order);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `
      UPDATE promotions
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Promotion with id ${id} not found`);
    }
    
    return this.mapRowToPromotion(result.rows[0]);
  }
  
  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM promotions WHERE id = $1', [id]);
  }
  
  async setActive(id: number, isActive: boolean): Promise<void> {
    await pool.query(
      'UPDATE promotions SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [isActive, id]
    );
  }
  
  async clearAll(language: Language): Promise<void> {
    await pool.query('DELETE FROM promotions WHERE language = $1', [language]);
  }
  
  private mapRowToPromotion(row: any): Promotion {
    return {
      id: row.id,
      language: row.language,
      title: row.title,
      description: row.description,
      details: row.details,
      is_active: row.is_active,
      display_order: row.display_order || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export const promotionRepository = new PromotionRepository();

