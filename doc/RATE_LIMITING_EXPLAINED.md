# Bonus Request Rate Limiting - How It Works

## Overview

The bot implements rate limiting to prevent spam and abuse of the bonus request feature. This ensures:
- Users can't spam multiple bonus requests
- Admins only receive legitimate requests
- System resources are protected

## How It Works

### 1. First Request (Allowed)

When a user shares their phone number for the first time:
- ✅ Request is processed
- ✅ Phone number is saved
- ✅ `bonus_requested` = `TRUE`
- ✅ `bonus_status` = `pending`
- ✅ `last_bonus_request_at` = current timestamp
- ✅ Admin receives notification

### 2. Subsequent Requests (Blocked)

After the first request, the system checks two conditions:

#### A. Pending Request Check
- If user already has a **pending** bonus request (`bonus_status = 'pending'`)
- **Action:** Request is **blocked immediately**
- **User sees:** "⏳ Zaten bekleyen bir bonus talebiniz var..."
- **Admin:** No notification sent

#### B. Cooldown Period Check
- If user's last request was less than **5 minutes** ago (configurable)
- **Action:** Request is **blocked**
- **User sees:** "⏰ Çok sık bonus talebi gönderiyorsunuz. Lütfen {X} dakika sonra tekrar deneyin."
- **Admin:** No notification sent

### 3. After Request is Processed

Once an admin approves or rejects a request:
- `bonus_status` changes to `'approved'` or `'rejected'`
- User can request again (after cooldown period)

## Configuration

### Cooldown Period

Set in `.env` file:
```env
BONUS_REQUEST_COOLDOWN_MINUTES=5
```

**Default:** 5 minutes

**Recommendation:**
- For testing: `1` (1 minute)
- For production: `5` (5 minutes) or higher

## Expected Behavior

### Scenario: User Sends 6 Bonus Requests Rapidly

1. **Request #1:** ✅ **ALLOWED**
   - Phone number saved
   - Admin notification sent
   - Status: `pending`

2. **Request #2:** ❌ **BLOCKED** (pending request exists)
   - User sees: "Already have pending request"
   - No admin notification
   - Status: Still `pending`

3. **Request #3:** ❌ **BLOCKED** (pending request exists)
   - User sees: "Already have pending request"
   - No admin notification

4. **Request #4:** ❌ **BLOCKED** (pending request exists)
   - User sees: "Already have pending request"
   - No admin notification

5. **Request #5:** ❌ **BLOCKED** (pending request exists)
   - User sees: "Already have pending request"
   - No admin notification

6. **Request #6:** ❌ **BLOCKED** (pending request exists)
   - User sees: "Already have pending request"
   - No admin notification

**Result:** Only **1 admin notification** (from request #1) ✅

## Testing Rate Limiting

### Test 1: Pending Request Block

1. Send bonus request (share phone)
2. Immediately send another bonus request
3. **Expected:** Second request blocked with "already pending" message

### Test 2: Cooldown Block

1. Send bonus request
2. Admin approves/rejects it
3. Wait less than 5 minutes
4. Send another bonus request
5. **Expected:** Request blocked with cooldown message

### Test 3: After Cooldown

1. Send bonus request
2. Admin approves/rejects it
3. Wait more than 5 minutes
4. Send another bonus request
5. **Expected:** Request allowed ✅

## Admin View

### What Admins See

- **Only legitimate requests** (one per user until processed)
- **No spam notifications**
- **Clear request history** via `/bonus_requests`

### Checking Blocked Attempts

Blocked attempts are logged in the bot logs:
```bash
pm2 logs elitbot | grep "Bonus request blocked"
```

Example log entries:
```
info: Bonus request blocked for user 123456: Already has pending request
info: Bonus request blocked for user 123456: Cooldown active, wait 3 minutes
```

## Troubleshooting

### Issue: User Not Seeing Error Messages

**Possible causes:**
1. Bot is not responding (check PM2 status)
2. User blocked the bot
3. Network issues

**Solution:**
- Check bot logs: `pm2 logs elitbot`
- Verify bot is running: `pm2 status`
- Test with another account

### Issue: Rate Limiting Not Working

**Check:**
1. Database migration ran: `npm run migrate`
2. Bot restarted after changes: `pm2 restart elitbot`
3. `.env` file has `BONUS_REQUEST_COOLDOWN_MINUTES` set

### Issue: Too Many Notifications

**If admins receive multiple notifications:**
- Check if `canRequestBonus` is being called
- Verify database has `last_bonus_request_at` column
- Check logs for errors

## Database Schema

Relevant columns in `users` table:
- `bonus_requested` (BOOLEAN) - Has user requested bonus?
- `bonus_status` (VARCHAR) - 'pending', 'approved', 'rejected'
- `last_bonus_request_at` (TIMESTAMP) - When was last request?
- `bonus_request_count` (INTEGER) - Total requests made

## Summary

✅ **Expected Result:** Only 1 admin notification when user sends 6 requests
- First request: Processed and notified
- Remaining 5 requests: Blocked (user sees error messages)

This is **correct behavior** and prevents spam! 🎯

