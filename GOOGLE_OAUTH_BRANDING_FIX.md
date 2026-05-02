# Google OAuth Branding - Complete Setup

## Issue
Google OAuth consent screen shows "to continue to alcmyyzmfkmpwglndppp.supabase.co" instead of FORGE branding.

## Why This Happens
When using Supabase Auth, the redirect URI domain (Supabase) is shown in the consent screen. This is **normal and expected** behavior. You cannot change this text without using a custom domain (requires Supabase Pro plan).

## Solution: Improve Branding (What You CAN Control)

Even though the Supabase domain will show, you can still make the OAuth screen look professional with your branding.

---

## Step 1: Upload Your Logo

1. **Prepare your logo**:
   - Go to `assets/` folder
   - Use `Favicon.svg` or `LOGO-White-Bg.svg`
   - Convert to PNG or JPG (120x120px recommended)
   - Must be under 1MB

2. **Upload to Google Cloud Console**:
   - Go to: https://console.cloud.google.com/
   - Navigate to: **APIs & Services → OAuth consent screen**
   - Click **"EDIT APP"**
   - Under **App logo**, click **"Upload"** or **"Change logo"**
   - Select your logo file
   - Click **"Save"**

---

## Step 2: Complete OAuth Consent Screen

Fill in all required fields:

### App Information
```
App name: FORGE
User support email: raguloff567n@gmail.com
```

### App Domain
```
Application home page: https://tryforge.site
Application privacy policy link: https://tryforge.site/privacy
Application terms of service link: https://tryforge.site/terms
```

### Authorized Domains
```
Authorized domain 1: tryforge.site
Authorized domain 2: supabase.co
```

### Developer Contact
```
Email addresses: raguloff567n@gmail.com
```

Click **"SAVE AND CONTINUE"**

---

## Step 3: Configure Scopes

1. Click **"ADD OR REMOVE SCOPES"**
2. Select these scopes:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
3. Click **"UPDATE"**
4. Click **"SAVE AND CONTINUE"**

---

## Step 4: Add Test Users (Optional)

If your app is in "Testing" mode:
1. Click **"ADD USERS"**
2. Add your email: `raguloff567n@gmail.com`
3. Add any other test emails
4. Click **"SAVE AND CONTINUE"**

---

## Step 5: Review and Publish

1. Review all settings
2. Click **"BACK TO DASHBOARD"**
3. **Optional**: Change publishing status to "In production" (removes "This app isn't verified" warning)

---

## Step 6: Test Privacy and Terms Pages

Your app now has these pages:
- `http://localhost:5173/privacy`
- `http://localhost:5173/terms`

Test them:
1. Go to `http://localhost:5173/privacy`
2. Should see Privacy Policy page with FORGE branding
3. Go to `http://localhost:5173/terms`
4. Should see Terms of Service page with FORGE branding

---

## What the OAuth Screen Will Look Like

### Before (Current):
```
┌─────────────────────────────────────┐
│ Sign in with Google                 │
│                                     │
│ Choose an account                   │
│ to continue to                      │
│ alcmyyzmfkmpwglndppp.supabase.co   │
└─────────────────────────────────────┘
```

### After (With Branding):
```
┌─────────────────────────────────────┐
│ Sign in with Google                 │
│                                     │
│ [FORGE LOGO]                        │
│                                     │
│ FORGE wants to access your          │
│ Google Account                      │
│                                     │
│ This will allow FORGE to:           │
│ • See your email address            │
│ • See your personal info            │
│                                     │
│ to continue to                      │
│ alcmyyzmfkmpwglndppp.supabase.co   │
│                                     │
│ [Cancel] [Continue]                 │
└─────────────────────────────────────┘
```

**Note**: The Supabase domain text will remain, but users will see your FORGE logo and app name prominently.

---

## Important Notes

### The Supabase Domain is Normal
- ✅ This is expected when using Supabase Auth
- ✅ It's secure and professional
- ✅ Users understand it's the authentication provider
- ✅ Your branding (logo + name) is what matters most

### To Remove Supabase Domain (Not Recommended)
You would need:
- Supabase Pro plan ($25/month)
- Custom domain setup (e.g., auth.tryforge.site)
- SSL certificates
- Complex configuration

**Not worth it** just to change the OAuth screen text.

---

## Verification Checklist

After completing all steps:

- [ ] Logo uploaded to Google Cloud Console
- [ ] App name set to "FORGE"
- [ ] Support email added
- [ ] Home page URL: `https://tryforge.site`
- [ ] Privacy policy URL: `https://tryforge.site/privacy`
- [ ] Terms of service URL: `https://tryforge.site/terms`
- [ ] Authorized domains: `tryforge.site` and `supabase.co`
- [ ] Scopes: `userinfo.email` and `userinfo.profile`
- [ ] Developer contact email added
- [ ] Privacy page works: `http://localhost:5173/privacy`
- [ ] Terms page works: `http://localhost:5173/terms`
- [ ] Test OAuth flow shows FORGE logo

---

## Testing

1. **Clear browser cache** (important!)
2. Go to `http://localhost:5173/login`
3. Click **"Continue with Google"**
4. Should see:
   - ✅ FORGE logo
   - ✅ "FORGE wants to access your Google Account"
   - ✅ Professional consent screen
   - ⚠️ "to continue to alcmyyzmfkmpwglndppp.supabase.co" (this is normal)

---

## Troubleshooting

### Logo not showing
- Wait 5-10 minutes for changes to propagate
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Verify logo is under 1MB and correct format (PNG/JPG)

### Privacy/Terms links not working
- Verify routes added to `App.jsx`
- Check files exist: `client/src/pages/Privacy.jsx` and `Terms.jsx`
- Restart development server
- Check browser console for errors

### "This app isn't verified" warning
- This is normal for apps in "Testing" mode
- Users can click "Advanced" → "Go to FORGE (unsafe)"
- To remove: Submit app for Google verification (takes 1-2 weeks)
- Or keep in testing mode with added test users

---

## Summary

✅ **Logo**: Upload to Google Cloud Console  
✅ **App name**: Set to "FORGE"  
✅ **Privacy/Terms**: Pages created and routes added  
✅ **Authorized domains**: Added `tryforge.site` and `supabase.co`  
✅ **Scopes**: Email and profile configured  
⚠️ **Supabase domain**: Will remain (this is normal)  

Your OAuth screen will now show professional FORGE branding even though the Supabase domain appears in the text!
