# Complete Email Setup Guide - Resend Integration

## Overview
This guide covers the complete setup to fix the signup loop issue and configure all emails (quiz results + auth emails) to use Resend with `no-reply@tryforge.site`.

---

## Part 1: Quiz Result Emails (✅ Already Done)

Quiz result emails are now sent via Resend using the custom integration.

**Files Modified:**
- `server/lib/resend.js` - Resend email service
- `server/routes/email.js` - Fire-and-forget email sending
- `server/.env` - Added `RESEND_API_KEY`
- `server/package.json` - Added `resend` dependency

**Status**: ✅ Working (you confirmed emails are sending properly)

---

## Part 2: Fix Signup Loop (✅ Just Fixed)

The signup loop was caused by Supabase requiring email confirmation before creating a session.

**Files Modified:**
- `client/src/pages/Result.jsx`
  - Added `successMessage` state
  - Updated `handleSaveRoadmap` to detect email confirmation requirement
  - Shows success message instead of redirecting when confirmation needed
  - Stores `pendingSessionId` for post-confirmation access

**Changes Made:**
1. Detects when `data.user` exists but `data.session` is null (confirmation required)
2. Shows green success message: "Account created! Check your email..."
3. Disables submit button after successful signup
4. Stores session ID in localStorage for later access

**Status**: ✅ Fixed in code

---

## Part 3: Configure Supabase to Use Resend for Auth Emails

This is the final step to complete the integration.

### Step 1: Get Resend SMTP Credentials

1. Go to **Resend Dashboard**: https://resend.com/
2. Navigate to **Settings → SMTP**
3. Note your credentials:
   ```
   Host: smtp.resend.com
   Port: 587 (TLS) or 465 (SSL)
   Username: resend
   Password: [Your Resend API Key - starts with re_]
   ```

### Step 2: Configure Supabase SMTP

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your **Forge** project
3. Navigate to: **Settings → Authentication → SMTP Settings**
4. Enable **"Enable Custom SMTP"**
5. Fill in:
   ```
   Sender email: no-reply@tryforge.site
   Sender name: FORGE
   
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Your Resend API Key]
   
   Minimum interval between emails: 60
   ```
6. Select **TLS** encryption (not SSL)
7. Click **Save**

### Step 3: Verify Domain in Resend

1. Go to **Resend Dashboard → Domains**
2. Ensure `tryforge.site` is added and verified
3. If not verified:
   - Click on the domain
   - Add the DNS records (SPF, DKIM, DMARC) to your domain provider
   - Wait for verification (5-10 minutes)

### Step 4: Update Supabase Email Templates

Your templates are already prepared in `assets/supabase-email-templates.md`.

1. Go to **Supabase Dashboard → Authentication → Email Templates**

2. **Confirm Signup Template**:
   - Click "Confirm signup"
   - Subject: `Confirm your Forge account`
   - Copy HTML from `assets/supabase-email-templates.md` (Template 1)
   - Save

3. **Reset Password Template**:
   - Click "Reset password"  
   - Subject: `Reset your Forge password`
   - Copy HTML from `assets/supabase-email-templates.md` (Template 2)
   - Save

### Step 5: Configure URL Settings

1. Go to **Supabase Dashboard → Authentication → URL Configuration**

2. **Site URL**:
   - Development: `http://localhost:5173`
   - Production: `https://tryforge.site`

3. **Redirect URLs** (add all):
   ```
   http://localhost:5173/reset-password
   http://localhost:5173/dashboard
   https://tryforge.site/reset-password
   https://tryforge.site/dashboard
   ```

4. Save changes

---

## Testing the Complete Setup

### Test 1: Signup Flow with Email Confirmation

1. **Complete the quiz**:
   - Go to `http://localhost:5173`
   - Take the quiz
   - Reach the results page

2. **Sign up**:
   - Enter email and password
   - Click "Save My Roadmap"
   - Should see green success message: "Account created! Check your email..."

3. **Check emails** (you should receive 2):
   - **Quiz Result Email** (from Resend via backend)
     - From: `no-reply@tryforge.site`
     - Subject: "Your FORGE result — [Domain] awaits"
     - Contains: Profile, domain, roadmap phases
   
   - **Confirmation Email** (from Resend via Supabase)
     - From: `no-reply@tryforge.site`
     - Subject: "Confirm your Forge account"
     - Contains: Confirmation button

4. **Confirm email**:
   - Click "Confirm Email →" button in confirmation email
   - Should redirect to your app (dashboard or login)

5. **Sign in**:
   - Go to `http://localhost:5173/login`
   - Enter your email and password
   - Should land on dashboard with your roadmap

### Test 2: Password Reset Flow

1. **Request reset**:
   - Go to `http://localhost:5173/forgot-password`
   - Enter your email
   - Click "Send Reset Link"

2. **Check email**:
   - Should receive "Reset your Forge password" email
   - From: `no-reply@tryforge.site`
   - Click "Reset Password →" button

3. **Reset password**:
   - Should land on `/reset-password` page
   - Enter new password
   - Submit
   - Should be able to sign in with new password

### Test 3: Existing User

1. **Complete quiz again** with same email
2. **Try to sign up**:
   - Should see: "Account already exists. Please sign in with your password."
3. **Enter password** and submit
4. Should land on dashboard immediately (no email needed)

---

## Verification Checklist

- [ ] Resend API key added to `server/.env`
- [ ] Resend SMTP configured in Supabase dashboard
- [ ] Domain `tryforge.site` verified in Resend
- [ ] Email templates updated in Supabase
- [ ] URL configuration set in Supabase
- [ ] Redirect URLs added to allowlist
- [ ] Quiz result email sends from `no-reply@tryforge.site`
- [ ] Signup confirmation email sends from `no-reply@tryforge.site`
- [ ] Password reset email sends from `no-reply@tryforge.site`
- [ ] No signup loop (shows success message instead)
- [ ] Can access dashboard after email confirmation

---

## Troubleshooting

### Issue: Emails not sending from Supabase

**Solution**:
- Verify SMTP credentials are correct in Supabase dashboard
- Check port is 587 with TLS (not 465 with SSL)
- Ensure Resend API key has sending permissions
- Check Resend dashboard for error logs

### Issue: Domain not verified in Resend

**Solution**:
- Add all DNS records (SPF, DKIM, DMARC)
- Wait 5-10 minutes for DNS propagation
- Use `dig` or online DNS checker to verify records
- Contact Resend support if verification fails after 24 hours

### Issue: Confirmation link not working

**Solution**:
- Verify Site URL matches your app URL
- Check redirect URLs are in allowlist
- Ensure link hasn't expired (24 hours for signup, 1 hour for reset)
- Check browser console for errors

### Issue: Still seeing signup loop

**Solution**:
- Clear browser localStorage: `localStorage.clear()`
- Clear Supabase session: Sign out completely
- Verify code changes were saved in `Result.jsx`
- Check browser console for JavaScript errors
- Restart development server

### Issue: Emails going to spam

**Solution**:
- Ensure domain is fully verified in Resend
- Add DMARC policy to DNS with `p=quarantine` or `p=reject`
- Warm up sending domain gradually (start with small volume)
- Check email content for spam triggers
- Use Resend's email testing tools

---

## Environment Variables Summary

### Server `.env`
```env
# Resend (for quiz result emails)
RESEND_API_KEY=re_your_actual_key_here

# Supabase
SUPABASE_URL=https://alcmyyzmfkmpwglndppp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Other
PORT=3001
CLIENT_URL=http://localhost:5173
```

### Client `.env`
```env
VITE_SUPABASE_URL=https://alcmyyzmfkmpwglndppp.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Note**: Supabase auth emails use SMTP configured in dashboard, not environment variables.

---

## What's Next?

After completing this setup:

1. **Test thoroughly** in development
2. **Update production environment**:
   - Set production Site URL in Supabase
   - Add production redirect URLs
   - Update `CLIENT_URL` in production server
3. **Monitor email delivery** in Resend dashboard
4. **Set up email analytics** (optional)
5. **Configure email rate limits** if needed

---

## Summary

✅ **Quiz result emails**: Sent via Resend backend integration (fire-and-forget)  
✅ **Signup loop**: Fixed by detecting email confirmation requirement  
⏳ **Auth emails**: Configure Supabase SMTP to use Resend (follow Part 3)  

All emails will use `no-reply@tryforge.site` once Supabase SMTP is configured.
