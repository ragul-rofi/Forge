# Resend Email Integration

## Overview
Integrated Resend email service into the FORGE backend for sending quiz result emails.

## Implementation Details

### 1. Dependencies
- Installed `resend` package (v6.12.2)
- Added to `server/package.json`

### 2. New Module: `server/lib/resend.js`
Created a reusable email service module with:
- **Function**: `sendQuizResultEmail(toEmail, data)`
- **Parameters**:
  - `toEmail`: Recipient email address
  - `data`: Object containing `{ name, domain, sessionId, profile, roadmap }`
- **Returns**: Resend response object with email ID
- **From Address**: `no-reply@tryforge.site`

### 3. Updated Route: `server/routes/email.js`
Modified the `/api/send-result-email` endpoint to:
- Use Resend instead of Mailtrap
- Implement **fire-and-forget** pattern (async, non-blocking)
- Return immediate response without waiting for email delivery
- Log success/failure asynchronously
- Update Supabase `email_sent` flag after successful send

### 4. Environment Configuration
Added to `server/.env`:
```env
RESEND_API_KEY=your_resend_api_key_here
```

## Usage Flow

1. Client submits quiz results to `/api/send-result-email`
2. Server validates request and fetches session data
3. Server triggers email send (fire-and-forget)
4. Server responds immediately with `{ success: true, emailQueued: true }`
5. Email sends asynchronously in background
6. On success: logs email ID and updates Supabase
7. On failure: logs error (doesn't affect API response)

## Key Features

✅ **Non-blocking**: API responds immediately without waiting for email delivery  
✅ **Modular**: `sendQuizResultEmail()` is exportable and reusable  
✅ **Clean**: Minimal code, no unnecessary abstractions  
✅ **Resilient**: Email failures don't break the API response  
✅ **Logged**: Success/failure logged for monitoring  

## Testing

To test the integration:
1. Set your actual Resend API key in `server/.env`
2. Ensure domain `tryforge.site` is verified in Resend dashboard
3. Submit a quiz result through the client app
4. Check server logs for `[Resend] Email sent successfully: <id>`
5. Verify email delivery in Resend dashboard

## Migration Notes

- Old Mailtrap implementation remains in `server/lib/mailtrap.js` (not removed)
- Other email functions (digest, abandonment, post-call) still use Mailtrap
- Can migrate those functions to Resend later if needed
