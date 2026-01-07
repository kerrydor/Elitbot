# Features Implementation Guide

This document outlines all implemented features and their technical details.

## User-Side Features

### 1. Start Command (`/start`)
- **Location**: `src/handlers/startHandler.ts`
- **Functionality**:
  - Creates/updates user in database
  - Shows welcome message with verification button
  - Supports both TR/EN languages
- **Flow**: User → Verification → Language Selection → Main Menu

### 2. Help Command (`/help`)
- **Location**: `src/handlers/helpHandler.ts`
- **Functionality**:
  - Shows help message in user's selected language
  - Displays available commands
  - Shows main menu if user is verified

### 3. Button-Based Menus
- **Location**: `src/handlers/menuHandler.ts`
- **Features**:
  - Inline keyboard buttons
  - Main menu with 6 options
  - Language-aware button labels

### 4. Text Command Handling
- **Location**: `src/handlers/messageHandler.ts`
- **Features**:
  - Handles regular text messages
  - Shows main menu for verified users
  - Processes contact sharing (phone numbers)

### 5. Inline Queries
- **Location**: `src/handlers/inlineQueryHandler.ts`
- **Functionality**:
  - Supports inline search
  - Shows quick access to main features
  - Cached results (5 minutes)
  - Language-aware responses

### 6. User Registration/Logging
- **Location**: `src/database/userRepository.ts`
- **Stored Data**:
  - user_id (primary key)
  - username, first_name, last_name
  - language preference
  - verification status
  - phone number (if shared)
  - bonus request status
  - timestamps (created_at, last_active)

## Admin-Side Features

### 1. Admin Commands
- **Location**: `src/handlers/adminHandler.ts`
- **Commands**:
  - `/stats` - View bot statistics
  - `/broadcast <message>` - Broadcast to all users

### 2. Broadcast System
- **Location**: `src/utils/broadcastQueue.ts`
- **Features**:
  - Queue-based processing
  - Batch sending (25 messages per batch)
  - Rate limiting (respects Telegram's 30/sec limit)
  - Retry logic with exponential backoff
  - Failure tracking
  - Progress reporting

**Technical Details**:
- Batch size: 25 messages (under 30/sec limit)
- Delay between batches: 1 second
- Delay between messages: 50ms
- Max retries: 3 attempts
- Exponential backoff: 1s, 2s, 4s

### 3. User Statistics
- **Metrics Tracked**:
  - Total users
  - Daily new users
  - Verified users
  - Users who shared phone numbers

## Technical Features

### 1. Webhook Architecture
- **Location**: `src/server.ts`
- **Features**:
  - Express.js server
  - HTTPS support (production)
  - HTTP fallback (development)
  - Health check endpoint
  - Secure webhook secret

### 2. Rate Limiting
- **Location**: `src/utils/rateLimiter.ts`
- **Implementation**:
  - Per-user rate limiting
  - Configurable limit (default: 10/minute)
  - Automatic cleanup of old entries

### 3. Database
- **Location**: `src/database/`
- **Features**:
  - PostgreSQL connection pooling
  - Automatic migrations
  - User repository pattern
  - Broadcast tracking table

### 4. Logging
- **Location**: `src/utils/logger.ts`
- **Features**:
  - Winston logger
  - File logging (combined.log, error.log)
  - Console logging (development)
  - Structured JSON logs

### 5. Multilingual Support
- **Location**: `src/config/texts.ts`
- **Languages**: Turkish (tr), English (en)
- **Features**:
  - Centralized text management
  - Easy to add new languages
  - Parameter substitution support

## Security Features

1. **Environment Variables**: All sensitive data in `.env`
2. **Webhook Secret**: Protected webhook endpoint
3. **Admin Verification**: Admin commands check user ID
4. **Rate Limiting**: Prevents abuse
5. **Input Validation**: All inputs validated

## Extension Points

### Adding New Features

1. **New Handler**:
   - Create file in `src/handlers/`
   - Register in `src/handlers/index.ts`

2. **New Text**:
   - Add to `TextKeys` interface in `src/config/texts.ts`
   - Add translations for both languages

3. **New Database Table**:
   - Add migration in `src/database/migrations.ts`
   - Create repository in `src/database/`

4. **New Admin Command**:
   - Add handler in `src/handlers/adminHandler.ts`
   - Update `ADMIN_GUIDE.md`

## Performance Considerations

- **Broadcast Queue**: Processes in background, doesn't block webhook
- **Database Pooling**: Reuses connections efficiently
- **Rate Limiting**: Prevents API abuse
- **Caching**: Inline query results cached for 5 minutes
- **Batch Processing**: Optimized for Telegram's rate limits

## Monitoring

- **Logs**: Check `combined.log` and `error.log`
- **PM2**: Use `pm2 logs elitbot` for real-time logs
- **Health Endpoint**: `/health` for uptime monitoring
- **Database**: Query user statistics directly

