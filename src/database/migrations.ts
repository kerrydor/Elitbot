/** Database migrations */
import { pool } from './connection';
import { logger } from '../utils/logger';

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id BIGINT PRIMARY KEY,
        username VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        language VARCHAR(2) DEFAULT 'en',
        is_verified BOOLEAN DEFAULT FALSE,
        phone_number VARCHAR(20),
        bonus_requested BOOLEAN DEFAULT FALSE,
        bonus_status VARCHAR(20) DEFAULT 'pending',
        bonus_request_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add bonus_request_count column if it doesn't exist (for existing databases)
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'bonus_request_count'
        ) THEN
          ALTER TABLE users ADD COLUMN bonus_request_count INTEGER DEFAULT 0;
        END IF;
      END $$;
    `);
    
    // Add last_bonus_request_at column if it doesn't exist (for existing databases)
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'last_bonus_request_at'
        ) THEN
          ALTER TABLE users ADD COLUMN last_bonus_request_at TIMESTAMP;
        END IF;
      END $$;
    `);
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
      CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
    `);
    
    // Create broadcasts table for tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS broadcasts (
        id SERIAL PRIMARY KEY,
        admin_user_id BIGINT NOT NULL,
        message_text TEXT,
        sent_count INTEGER DEFAULT 0,
        total_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);
    
    // Create promotions table for dynamic promotion management
    await client.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        language VARCHAR(2) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        details TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create index for promotions
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_promotions_language ON promotions(language, is_active);
    `);
    
    await client.query('COMMIT');
    logger.info('Database migrations completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Migration failed', error);
    throw error;
  } finally {
    client.release();
  }
}

