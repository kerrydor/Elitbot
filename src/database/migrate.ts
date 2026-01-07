/** Standalone migration script */
import { runMigrations } from './migrations';
import { logger } from '../utils/logger';
import { config } from '../config/settings';

runMigrations()
  .then(() => {
    logger.info('Migrations completed');
    process.exit(0);
  })
  .catch((error: any) => {
    logger.error('Migration failed', error);
    
    // Provide helpful error messages
    if (error.code === '28P01') {
      console.error('\n❌ Database Authentication Failed');
      console.error(`   User: ${config.database.user}`);
      console.error(`   Database: ${config.database.database}`);
      console.error('\n💡 Solutions:');
      console.error('   1. Check your .env file has correct DB_PASSWORD');
      console.error('   2. Verify the user exists: sudo -u postgres psql -c "\\du"');
      console.error('   3. Reset password: ALTER USER ' + config.database.user + ' WITH PASSWORD \'new_password\';');
      console.error('   4. See doc/TROUBLESHOOTING.md for detailed help\n');
    } else if (error.code === '3D000') {
      console.error('\n❌ Database Does Not Exist');
      console.error(`   Database: ${config.database.database}`);
      console.error('\n💡 Solution:');
      console.error('   sudo -u postgres psql -c "CREATE DATABASE ' + config.database.database + ';"\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Cannot Connect to Database');
      console.error(`   Host: ${config.database.host}:${config.database.port}`);
      console.error('\n💡 Solution:');
      console.error('   sudo systemctl start postgresql\n');
    }
    
    process.exit(1);
  });

