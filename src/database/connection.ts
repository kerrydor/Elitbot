/** PostgreSQL database connection */
import { Pool, PoolConfig } from 'pg';
import { config } from '../config/settings';
import { logger } from '../utils/logger';

const poolConfig: PoolConfig = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

// Test connection (only if not in migration script)
if (require.main !== module) {
  pool.query('SELECT NOW()')
    .then(() => {
      logger.info('Database connection established');
    })
    .catch((err) => {
      logger.error('Database connection failed', err);
      logger.error(`Connection details: host=${config.database.host}, port=${config.database.port}, database=${config.database.database}, user=${config.database.user}`);
      process.exit(1);
    });
}

