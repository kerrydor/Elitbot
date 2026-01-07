/** User repository for database operations */
import { pool } from './connection';
import { Language } from '../config/texts';
import { logger } from '../utils/logger';

export interface User {
  user_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language: Language;
  is_verified: boolean;
  phone_number?: string;
  bonus_requested: boolean;
  bonus_status: 'pending' | 'approved' | 'rejected';
  bonus_request_count: number;
  last_bonus_request_at?: Date;
  created_at: Date;
  last_active: Date;
}

export interface CreateUserData {
  user_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export class UserRepository {
  async createOrUpdate(data: CreateUserData): Promise<User> {
    const query = `
      INSERT INTO users (user_id, username, first_name, last_name, last_active)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        last_active = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      data.user_id,
      data.username,
      data.first_name,
      data.last_name,
    ]);
    
    return this.mapRowToUser(result.rows[0]);
  }
  
  async findById(userId: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(result.rows[0]);
  }
  
  async updateLanguage(userId: number, language: Language): Promise<void> {
    const query = 'UPDATE users SET language = $1 WHERE user_id = $2';
    await pool.query(query, [language, userId]);
  }
  
  async verifyUser(userId: number): Promise<void> {
    const query = 'UPDATE users SET is_verified = TRUE WHERE user_id = $1';
    await pool.query(query, [userId]);
  }
  
  async updatePhoneNumber(userId: number, phoneNumber: string): Promise<void> {
    const query = `
      UPDATE users 
      SET phone_number = $1, 
          bonus_requested = TRUE, 
          bonus_request_count = bonus_request_count + 1,
          last_bonus_request_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
    `;
    await pool.query(query, [phoneNumber, userId]);
  }
  
  async hasPendingBonusRequest(userId: number): Promise<boolean> {
    const query = 'SELECT bonus_requested, bonus_status FROM users WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return false;
    }
    
    const user = result.rows[0];
    return user.bonus_requested === true && user.bonus_status === 'pending';
  }
  
  async getBonusRequestCount(userId: number): Promise<number> {
    const query = 'SELECT bonus_request_count FROM users WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return 0;
    }
    
    return parseInt(result.rows[0].bonus_request_count || '0', 10);
  }
  
  async canRequestBonus(userId: number, cooldownMinutes: number): Promise<{ canRequest: boolean; reason?: string; waitMinutes?: number }> {
    const query = `
      SELECT bonus_requested, bonus_status, last_bonus_request_at 
      FROM users 
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return { canRequest: true };
    }
    
    const user = result.rows[0];
    
    // Check if user has a pending request
    if (user.bonus_requested === true && user.bonus_status === 'pending') {
      return { 
        canRequest: false, 
        reason: 'pending' 
      };
    }
    
    // Check cooldown period
    if (user.last_bonus_request_at) {
      const lastRequest = new Date(user.last_bonus_request_at);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastRequest.getTime()) / (1000 * 60));
      
      if (diffMinutes < cooldownMinutes) {
        const waitMinutes = cooldownMinutes - diffMinutes;
        return { 
          canRequest: false, 
          reason: 'cooldown',
          waitMinutes 
        };
      }
    }
    
    return { canRequest: true };
  }
  
  async getTotalUsers(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count, 10);
  }
  
  async getDailyNewUsers(): Promise<number> {
    const result = await pool.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    return parseInt(result.rows[0].count, 10);
  }
  
  async getVerifiedUsers(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_verified = TRUE');
    return parseInt(result.rows[0].count, 10);
  }
  
  async getPhoneSharedUsers(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) as count FROM users WHERE phone_number IS NOT NULL');
    return parseInt(result.rows[0].count, 10);
  }
  
  async getAllUserIds(): Promise<number[]> {
    const result = await pool.query('SELECT user_id FROM users');
    return result.rows.map(row => row.user_id);
  }
  
  async getPendingBonusRequests(): Promise<User[]> {
    const query = `
      SELECT * FROM users 
      WHERE bonus_requested = TRUE 
      AND bonus_status = 'pending'
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows.map(row => this.mapRowToUser(row));
  }
  
  async updateBonusStatus(userId: number, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    const query = 'UPDATE users SET bonus_status = $1 WHERE user_id = $2';
    await pool.query(query, [status, userId]);
  }
  
  async clearBonusRequest(userId: number): Promise<void> {
    const query = `
      UPDATE users 
      SET bonus_requested = FALSE, bonus_status = 'pending', phone_number = NULL 
      WHERE user_id = $1
    `;
    await pool.query(query, [userId]);
  }
  
  async clearAllPendingBonusRequests(): Promise<number> {
    const query = `
      UPDATE users 
      SET bonus_requested = FALSE, bonus_status = 'pending', phone_number = NULL 
      WHERE bonus_requested = TRUE AND bonus_status = 'pending'
    `;
    const result = await pool.query(query);
    return result.rowCount || 0;
  }
  
  private mapRowToUser(row: any): User {
    return {
      user_id: row.user_id,
      username: row.username,
      first_name: row.first_name,
      last_name: row.last_name,
      language: row.language || 'en',
      is_verified: row.is_verified || false,
      phone_number: row.phone_number,
      bonus_requested: row.bonus_requested || false,
      bonus_status: row.bonus_status || 'pending',
      bonus_request_count: row.bonus_request_count || 0,
      last_bonus_request_at: row.last_bonus_request_at,
      created_at: row.created_at,
      last_active: row.last_active,
    };
  }
}

export const userRepository = new UserRepository();

