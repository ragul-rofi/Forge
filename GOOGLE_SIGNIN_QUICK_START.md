# Google Sign-In Quick Start

## ✅ What's Been Implemented

Google Sign-In buttons have been added to:
- **Login Page** (`/login`) - For both sign up and sign in
- **Quiz Results Page** (`/result/:sessionId`) - To save roadmap with Google

### Features:
- One-click authentication with Google
- Automatic account creation
- Quiz session linking for Google users
- Profile picture and name from Google account
- Works alongside email/password authentication

---

## 🔧 Configuration Required

You need to set up Google OAuth in 2 places:

### 1. Google Cloud Console (5 minutes)

**Create OAuth Credentials**:
1. Go to: https://console.cloud.google.com/
2. Create new project: "FORGE"
3. Enable Google+ API
4. Configure OAuth consent screen
5. Create OAuth Client ID (Web application)
6. Add redirect URI: `https://[YOUR-SUPABASE-REF].supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret

**Find your Supabase reference**:
- Go to Supabase Dashboard → Settings → API
- Look at Project URL: `https://alcmyyzmfkmpwglndppp.supabase.co`
- Your ref is: `alcmyyzmfkmpwglndppp`
- So redirect URI is: `https://alcmyyzmfkmpwglndppp.supabase.co/auth/v1/callback`

### 2. Supabase Dashboard (2 minutes)

**Enable Google Provider**:
1. Go to: https://supabase.com/dashboard
2. Select your FORGE project
3. Navigate to: Authentication → Providers
4. Find "Google" and toggle ON
5. Paste Client ID and Client Secret from Google Console
6. Save

**Configure URLs**:
1. Go to: Authentication → URL Configuration
2. Site URL: `http://localhost:5173` (dev) or `https://tryforge.site` (prod)
3. Add Redirect URLs:
   - `http://localhost:5173/dashboard`
   - `https://tryforge.site/dashboard`
4. Save

---

## 🧪 Testing

### Test Sign Up with Google:
1. Go to `http://localhost:5173/login`
2. Click "Continue with Google"
3. Select your Google account
4. Should redirect to `/dashboard`
5. Check Supabase → Table Editor → `students` to see your account

### Test from Quiz Results:
1. Complete quiz at `http://localhost:5173/quiz`
2. On results page, click "Continue with Google"
3. Authenticate
4. Should redirect to `/dashboard` with quiz data saved

---

## 🎨 UI Preview

### Login Page:
```
┌─────────────────────────────────┐
│  [Email input]                  │
│  [Password input]               │
│  [Sign In Button]               │
│                                 │
│  ────────── OR ──────────       │
│                                 │
│  [🔵 Continue with Google]      │
└─────────────────────────────────┘
```

### Result Page (Save Roadmap):
```
┌─────────────────────────────────┐
│  Your roadmap disappears...     │
│                                 │
│  [Email input]                  │
│  [Password input]               │
│  [Save My Roadmap →]            │
│                                 │
│  ────────── OR ──────────       │
│                                 │
│  [🔵 Continue with Google]      │
│                                 │
│  Already have an account? →     │
└─────────────────────────────────┘
```

---

## 📋 Configuration Checklist

- [ ] Create Google Cloud project
- [ ] Enable Google+ API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth Client ID
- [ ] Add redirect URI: `https://[YOUR-REF].supabase.co/auth/v1/callback`
- [ ] Copy Client ID and Secret
- [ ] Enable Google provider in Supabase
- [ ] Paste credentials in Supabase
- [ ] Configure Site URL in Supabase
- [ ] Add redirect URLs in Supabase
- [ ] Test sign-in flow
- [ ] Test quiz result flow

---

## 🆘 Common Issues

### "redirect_uri_mismatch"
- Check redirect URI matches exactly
- Format: `https://[YOUR-REF].supabase.co/auth/v1/callback`
- No trailing slash
- Wait 5 minutes after adding

### "Access blocked"
- Complete OAuth consent screen
- Add authorized domains: `tryforge.site`, `supabase.co`
- Add scopes: `userinfo.email`, `userinfo.profile`

### Not redirecting after sign-in
- Check Site URL in Supabase
- Verify redirect URLs are in allowlist
- Clear browser cookies and try again

---

## 📚 Full Documentation

For detailed setup instructions, see:
- **`GOOGLE_OAUTH_SETUP.md`** - Complete step-by-step guide
- **`COMPLETE_EMAIL_SETUP_GUIDE.md`** - Email configuration

---

## 🚀 What Happens After Configuration

Once configured, users can:
1. **Sign up** with Google (no password needed)
2. **Sign in** with Google (one click)
3. **Link quiz results** to Google account automatically
4. **Use either** email/password or Google to sign in
5. **Get profile picture** from Google account

The integration is seamless and secure!
