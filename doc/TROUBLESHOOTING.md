# Troubleshooting Guide

## Database Connection Issues

### Error: "password authentication failed for user"

This error occurs when the database credentials in your `.env` file don't match your PostgreSQL setup.

#### Solution 1: Verify Database User Exists

```bash
# Check if user exists
sudo -u postgres psql -c "\du"

# If user doesn't exist, create it:
sudo -u postgres psql
CREATE USER elitbot_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE elitbot TO elitbot_user;
\q
```

#### Solution 2: Check .env Configuration

Ensure your `.env` file has the correct credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elitbot
DB_USER=elitbot_user
DB_PASSWORD=your_actual_password_here
```

**Important:** 
- The password in `.env` must match the password you set when creating the user
- User name in `.env` must match the PostgreSQL user name exactly (case-sensitive)

#### Solution 3: Reset User Password

If you need to reset the password:

```bash
sudo -u postgres psql
ALTER USER elitbot_user WITH PASSWORD 'new_password';
\q
```

Then update your `.env` file with the new password.

#### Solution 4: Use Default Postgres User (Development Only)

For development, you can use the default postgres user:

```env
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

**Warning:** Don't use the postgres superuser in production!

### Error: "database does not exist"

Create the database:

```bash
sudo -u postgres psql
CREATE DATABASE elitbot;
GRANT ALL PRIVILEGES ON DATABASE elitbot TO elitbot_user;
\q
```

### Error: "connection refused"

This means PostgreSQL is not running:

```bash
# Check status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Enable auto-start
sudo systemctl enable postgresql
```

### Verify Connection

Test your connection manually:

```bash
# Test connection with psql
psql -h localhost -U elitbot_user -d elitbot

# Or test with environment variables
export PGPASSWORD='your_password'
psql -h localhost -U elitbot_user -d elitbot
```

## Common Issues

### Migration Fails

1. **Check database exists:**
   ```bash
   sudo -u postgres psql -l | grep elitbot
   ```

2. **Check user permissions:**
   ```bash
   sudo -u postgres psql -d elitbot -c "\dp"
   ```

3. **Run migrations manually:**
   ```bash
   npm run build
   npm run migrate
   ```

### Environment Variables Not Loading

1. **Verify .env file exists:**
   ```bash
   ls -la .env
   ```

2. **Check file permissions:**
   ```bash
   chmod 600 .env  # Secure permissions
   ```

3. **Verify .env is in project root:**
   The `.env` file must be in the same directory as `package.json`

### TypeScript Build Errors

1. **Clean and rebuild:**
   ```bash
   rm -rf dist/
   npm run build
   ```

2. **Check for type errors:**
   ```bash
   npx tsc --noEmit
   ```

## Getting Help

If issues persist:

1. Check logs: `pm2 logs elitbot` or `error.log`
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check firewall settings if connecting remotely

