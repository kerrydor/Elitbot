# Admin Guide - ElitBot

This guide covers admin features and commands for managing the ElitBot.

## Admin Setup

To become an admin, add your Telegram user ID to the `ADMIN_USER_IDS` environment variable in `.env`:

```env
ADMIN_USER_IDS=123456789,987654321
```

**How to find your Telegram user ID:**
1. Start a chat with [@userinfobot](https://t.me/userinfobot) on Telegram
2. It will reply with your user ID
3. Add that number to `ADMIN_USER_IDS` (comma-separated for multiple admins)

After updating `.env`, restart the bot:
```bash
pm2 restart elitbot
```

## Admin Commands

### `/stats`

View bot statistics including:
- Total users
- Daily new users
- Verified users
- Users who shared phone numbers

**Usage:**
```
/stats
```

**Example Response:**
```
📊 Bot Statistics

👥 Total Users: 1250
🆕 New Users Today: 45
✅ Verified Users: 980
📱 Phone Shared: 320
```

### `/broadcast <message>`

Send a message to all registered users. The bot will:
1. Send the message to all users
2. Show progress (sent/total)
3. Report any failures

**Usage:**
```
/broadcast Hello everyone! New promotion available.
```

**Features:**
- Automatic rate limiting (50ms delay between messages)
- Error handling for failed deliveries
- Progress reporting
- Queue-based delivery

**Example Response:**
```
Broadcast sent: reached 1245/1250 users.
⚠️ Failed to send to 5 users.
```

### `/notify_access <new_url>`

Notify all users about a current access link change. The bot will:
1. Update the access link
2. Send a notification to all users in their preferred language
3. Use the queue system for safe delivery

**Usage:**
```
/notify_access https://new-elitwin-link.com
```

**Example Response:**
```
✅ Access link updated and notification sent to 1250 users.
```

### `/announce <announcement_message>`

Send a campaign announcement to all users. This is a specialized broadcast with a campaign prefix.

**Usage:**
```
/announce Special weekend bonus! 50% extra on all deposits this weekend.
```

### `/add_promo <tr|en> <title>|<description>|<details>`

Add a new promotion to the database. Promotions are stored per language and can be managed dynamically.

**Usage:**
```
/add_promo tr Hoş Geldin Bonusu|Yeni üyelere özel %100 bonus|İlk yatırımınızda %100 bonus kazanın
```

**Format:** `title|description|details` (separated by `|`)

**Example Response:**
```
✅ Promotion added:

Title: Hoş Geldin Bonusu
Language: tr
ID: 1
```

### `/list_promos [tr|en]`

List all promotions for a specific language. If no language is specified, defaults to English.

**Usage:**
```
/list_promos tr
/list_promos en
/list_promos
```

**Example Response:**
```
📋 Promotions (tr):

1. ✅ [ID: 1]
   Title: Hoş Geldin Bonusu
   Description: Yeni üyelere özel %100 hoş geldin bonusu!...

2. ✅ [ID: 2]
   Title: Haftalık Cashback
   Description: Her hafta %10 cashback kazanın!...
```

### `/clear_promos <tr|en>`

Clear all promotions for a specific language. **Use with caution!**

**Usage:**
```
/clear_promos tr
```

**Example Response:**
```
✅ All promotions cleared for language: tr
```

### `/bonus_requests`

View all pending bonus requests from users who shared their phone numbers.

**Usage:**
```
/bonus_requests
```

**Example Response:**
```
📋 Pending Bonus Requests (3):

1. 👤 John Doe (@johndoe)
   📱 Phone: +905551234567
   📅 Requested: 12/15/2024, 10:30:45 AM
   /approve_bonus 123456789 | /reject_bonus 123456789

2. 👤 Jane Smith (ID: 987654321)
   📱 Phone: +905559876543
   📅 Requested: 12/15/2024, 11:15:20 AM
   /approve_bonus 987654321 | /reject_bonus 987654321
```

**Features:**
- Shows all users with pending bonus requests
- Displays user name, username/ID, phone number, and request date
- Includes quick action commands for each request
- Automatically notifies all admins when a new bonus request is made

### `/approve_bonus <user_id>`

Approve a bonus request for a specific user.

**Usage:**
```
/approve_bonus 123456789
```

**Example Response:**
```
✅ Bonus request approved for user 123456789

User: John Doe
Phone: +905551234567
```

**Features:**
- Updates the user's bonus status to "approved"
- Sends a notification to the user (in their preferred language)
- Prevents duplicate approvals

### `/reject_bonus <user_id>`

Reject a bonus request for a specific user.

**Usage:**
```
/reject_bonus 123456789
```

**Example Response:**
```
❌ Bonus request rejected for user 123456789

User: John Doe
Phone: +905551234567
```

**Features:**
- Updates the user's bonus status to "rejected"
- Sends a notification to the user (in their preferred language)
- Prevents duplicate rejections

**Note:** When a user shares their phone number for a bonus request, all admins automatically receive a notification with the user's details and quick action commands.

### `/clear_bonus <user_id>`

Clear/remove a specific user's bonus request data from the database. This will:
- Set `bonus_requested` to `FALSE`
- Reset `bonus_status` to `pending`
- Remove the phone number from the database

**Usage:**
```
/clear_bonus 123456789
```

**Example Response:**
```
🗑️ Bonus request cleared for user 123456789

User: {user}
Phone: {phone number} (removed)
Status: Reset to pending
```

**Use Cases:**
- Remove test data
- Clear invalid requests
- Remove duplicate entries

### `/clear_all_bonus`

Clear all pending bonus requests from the database. **Use with caution!** This will remove all pending bonus requests and their associated phone numbers.

**Usage:**
```
/clear_all_bonus
```

**Example Response:**
```
🗑️ Cleared 5 pending bonus request(s) from the database.

All phone numbers and bonus request data have been removed.
```

**Warning:** This action cannot be undone. Make sure you want to clear all pending requests before using this command.

## Best Practices

### Broadcasting

1. **Test First**: Send a test message to yourself before broadcasting
2. **Timing**: Avoid broadcasting during peak hours if possible
3. **Content**: Keep messages clear and concise
4. **Frequency**: Don't spam users with too many broadcasts

### Monitoring

Regularly check:
- `/stats` to monitor user growth
- PM2 logs: `pm2 logs elitbot`
- Error logs: `error.log` file

### User Management

- Users are automatically created on `/start`
- User data is stored in PostgreSQL
- Language preferences are saved per user
- Verification status is tracked

## Database Queries

For advanced queries, connect to PostgreSQL:

```bash
sudo -u postgres psql -d elitbot
```

**Useful queries:**

```sql
-- View all users
SELECT user_id, username, language, is_verified, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Count users by language
SELECT language, COUNT(*) 
FROM users 
GROUP BY language;

-- Users who shared phone
SELECT user_id, username, phone_number, bonus_status 
FROM users 
WHERE phone_number IS NOT NULL;

-- Daily user growth
SELECT DATE(created_at) as date, COUNT(*) as new_users
FROM users
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

## Updating Promotions

Promotions are stored in `src/config/promotions.ts`. To update:

1. Edit the file
2. Rebuild: `npm run build`
3. Restart: `pm2 restart elitbot`

**Future Enhancement:** Consider adding an admin command to update promotions dynamically.

## Troubleshooting

### Command Not Working

1. Verify you're in the admin list in `.env`
2. Restart bot after changing `.env`
3. Check bot logs for errors

### Broadcast Failing

1. Check bot token is valid
2. Verify users exist in database
3. Check rate limits (Telegram allows ~30 messages/second)
4. Review error logs

### Statistics Not Accurate

1. Ensure migrations ran: `npm run migrate`
2. Check database connection
3. Verify PostgreSQL is running

## Security

- Keep admin user IDs private
- Don't share `.env` file
- Regularly rotate bot token if compromised
- Monitor for unauthorized admin access

## Support

For technical issues:
1. Check logs: `pm2 logs elitbot`
2. Review error.log file
3. Check database connectivity
4. Verify environment variables

