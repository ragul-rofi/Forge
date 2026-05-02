# Quick Setup Checklist

## ✅ Already Done

- [x] Installed Resend SDK (`npm install resend`)
- [x] Created `server/lib/resend.js` with `sendQuizResultEmail()` function
- [x] Updated `server/routes/email.js` to use Resend (fire-and-forget)
- [x] Added `RESEND_API_KEY` to `server/.env`
- [x] Fixed signup loop in `client/src/pages/Result.jsx`
- [x] Quiz result emails sending from `no-reply@tryforge.site` ✅

## 🔧 To Do: Configure Supabase SMTP

### 1. Get Resend SMTP Credentials
- Go to: https://resend.com/ → Settings → SMTP
- Note: Host, Port, Username, Password (your API key)

### 2. Configure Supabase
- Go to: https://supabase.com/dashboard → Your Project
- Navigate to: **Settings → Authentication → SMTP Settings**
- Enable Custom SMTP:
  ```
  Sender: no-reply@tryforge.site
  Name: FORGE
  Host: smtp.resend.com
  Port: 587 (TLS)
  Username: resend
  Password: [Your Resend API Key]
  ```
- Save

### 3. Verify Domain
- Resend Dashboard → Domains
- Ensure `tryforge.site` is verified
- Add DNS records if needed (SPF, DKIM, DMARC)

### 4. Update Email Templates
- Supabase Dashboard → Authentication → Email Templates
- Copy templates from `assets/supabase-email-templates.md`
- Update "Confirm signup" and "Reset password"

### 5. Configure URLs
- Supabase Dashboard → Authentication → URL Configuration
- Site URL: `http://localhost:5173` (dev) or `https://tryforge.site` (prod)
- Add Redirect URLs:
  - `http://localhost:5173/reset-password`
  - `http://localhost:5173/dashboard`
  - `https://tryforge.site/reset-password`
  - `https://tryforge.site/dashboard`

## 🧪 Test

1. **Signup**: Complete quiz → Enter email/password → See success message → Check email
2. **Confirm**: Click confirmation link → Sign in → Access dashboard
3. **Reset**: Forgot password → Check email → Reset → Sign in

## 📧 Expected Emails

All from `no-reply@tryforge.site`:
- Quiz result email (via backend Resend integration)
- Signup confirmation (via Supabase SMTP → Resend)
- Password reset (via Supabase SMTP → Resend)

## 🆘 Quick Fixes

**Emails not sending?**
- Check SMTP credentials in Supabase
- Verify domain in Resend
- Check Resend dashboard logs

**Signup loop?**
- Clear localStorage
- Restart dev server
- Check browser console

**Confirmation link broken?**
- Verify redirect URLs in Supabase
- Check Site URL matches your app

---

**Full details**: See `COMPLETE_EMAIL_SETUP_GUIDE.md`
