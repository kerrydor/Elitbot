#!/bin/bash

# ElitBot Database Setup Script
# This script helps set up the PostgreSQL database for ElitBot

set -e

echo "=== ElitBot Database Setup ==="
echo ""

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql 2>/dev/null; then
    echo "⚠️  PostgreSQL doesn't appear to be running."
    echo "   Starting PostgreSQL..."
    sudo systemctl start postgresql || {
        echo "❌ Failed to start PostgreSQL. Please start it manually."
        exit 1
    }
fi

echo "✅ PostgreSQL is running"
echo ""

# Get database credentials
read -p "Database name [elitbot]: " DB_NAME
DB_NAME=${DB_NAME:-elitbot}

read -p "Database user [elitbot_user]: " DB_USER
DB_USER=${DB_USER:-elitbot_user}

read -sp "Database password: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Password cannot be empty"
    exit 1
fi

echo ""
echo "Creating database and user..."

# Create database and user
sudo -u postgres psql << EOF
-- Create database if it doesn't exist
SELECT 'CREATE DATABASE $DB_NAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Create user if it doesn't exist, otherwise update password
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    ELSE
        ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📝 Update your .env file with these values:"
echo ""
echo "DB_HOST=localhost"
echo "DB_PORT=5432"
echo "DB_NAME=$DB_NAME"
echo "DB_USER=$DB_USER"
echo "DB_PASSWORD=$DB_PASSWORD"
echo ""
echo "Then run: npm run migrate"

