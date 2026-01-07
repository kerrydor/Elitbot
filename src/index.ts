/** Main entry point */
import { createBot } from './bot';
import { setupWebhookServer } from './server';
import { runMigrations } from './database/migrations';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  try {
    logger.info('Starting ElitBot...');
    
    // Run database migrations
    await runMigrations();
    logger.info('Database migrations completed');
    
    // Create bot
    const bot = await createBot();
    
    // Setup webhook server
    setupWebhookServer(bot);
    
    logger.info('ElitBot started successfully');
  } catch (error) {
    logger.error('Failed to start bot', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
});

main();

