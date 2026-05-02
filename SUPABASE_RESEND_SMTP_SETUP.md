# Configure Supabase to Use Resend for Auth Emails

## Problem
Supabase is currently using its default email service for authentication emails (signup confirmation, password reset). We need to configure it to use Resend with `no-reply@tryforge.site`.

## Solution: Configure Custom SMTP in Supabase

### Step 1: Get Resend SMTP Credentials

1. Log in to your **Resend Dashboard**: https://resend.com/
2. Go to **Settings → SMTP**
3. You'll see your SMTP credentials:
   ```
   Host: smtp.resend.com
   Port: 465 (SSL) or 587 (TLS)
   Username: resend
   Password: re_xxxxxxxxxx (your API key)
   ```

### Step 2: Configure Supabase SMTP Settings

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: **Forge**
3. Navigate to: **Settings → Authentication → SMTP Settings**
4. Enable **"Enable Custom SMTP"**
5. Fill in the following details:

   ```
   Sender email: no-reply@tryforge.site
   Sender name: FORGE
   
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Your Resend API Key - starts with re_]
   
   Minimum interval between emails: 60 (seconds)
   ```

6. **Important**: Select **TLS** (not SSL) for port 587
7. Click **Save**

### Step 3: Verify Domain in Resend

Make sure `tryforge.site` is verified in your Resend dashboard:

1. Go to **Resend Dashboard → Domains**
2. If not added, click **Add Domain**
3. Add `tryforge.site`
4. Add the DNS records (SPF, DKIM, DMARC) to your domain provider
5. Wait for verification (usually takes a few minutes)

### Step 4: Update Supabase Email Templates

The email templates are already prepared in `assets/supabase-email-templates.md`.

1. Go to **Supabase Dashboard → Authentication → Email Templates**
2. Update **"Confirm signup"** template:
   - Subject: `Confirm your Forge account`
   - Copy HTML from the markdown file
3. Update **"Reset password"** template:
   - Subject: `Reset your Forge password`
   - Copy HTML from the markdown file
4. Update **"Magic Link"** template (if using):
   - Subject: `Your Forge sign-in link`
   - Use similar styling

### Step 5: Configure URL Settings

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Set **Site URL**: 
   - Development: `http://localhost:5173`
   - Production: `https://tryforge.site`
3. Add **Redirect URLs**:
   ```
   http://localhost:5173/reset-password
   https://tryforge.site/reset-password
   http://localhost:5173/dashboard
   https://tryforge.site/dashboard
   ```

### Step 6: Test the Configuration

1. **Test Signup Flow**:
   - Go to your app: `http://localhost:5173/signup`
   - Create a new account with a test email
   - Check that you receive the confirmation email from `no-reply@tryforge.site`
   - Verify the email styling matches your templates

2. **Test Password Reset**:
   - Go to: `http://localhost:5173/forgot-password`
   - Enter your email
   - Check that you receive the reset email from `no-reply@tryforge.site`
   - Click the link and verify it redirects to `/reset-password`

3. **Check Resend Dashboard**:
   - Go to **Resend Dashboard → Emails**
   - Verify that auth emails are appearing in the logs
   - Check delivery status

## Troubleshooting

### Issue: Emails not sending
- Verify SMTP credentials are correct
- Check that port 587 with TLS is selected (not SSL)
- Ensure your Resend API key has sending permissions
- Check Resend dashboard for error logs

### Issue: Domain not verified
- Add all required DNS records (SPF, DKIM, DMARC)
- Wait 5-10 minutes for DNS propagation
- Use `dig` or `nslookup` to verify DNS records are live

### Issue: Confirmation link not working
- Verify Site URL matches your app's URL
- Check that redirect URLs are in the allowlist
- Ensure the link hasn't expired (24 hours for signup, 1 hour for reset)

### Issue: Emails going to spam
- Ensure domain is fully verified in Resend
- Add DMARC policy to your DNS
- Warm up your sending domain gradually
- Check email content for spam triggers

## Environment Variables

No changes needed to your `.env` files. The SMTP configuration is handled entirely in the Supabase dashboard.

Your existing setup:
```env
# server/.env
RESEND_API_KEY=your_resend_api_key_here  # Used for quiz result emails

# Supabase SMTP uses the same Resend account but configured in dashboard
```

## What This Fixes

✅ Signup confirmation emails now sent via Resend  
✅ Password reset emails now sent via Resend  
✅ All auth emails use `no-reply@tryforge.site`  
✅ Consistent branding across all emails  
✅ No more looping after signup (proper email confirmation)  
✅ Better deliverability with verified domain  

## Notes

- Supabase SMTP settings apply to **all authentication emails**
- Quiz result emails continue to use the custom Resend integration we built
- Both use the same Resend account and sender email
- Email templates can be customized in Supabase dashboard
- SMTP changes take effect immediately (no restart needed)
