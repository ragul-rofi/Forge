# Google OAuth Setup Guide

## Overview
This guide shows you how to configure Google Sign-In/Login for your FORGE application using Supabase OAuth.

---

## Part 1: Code Implementation (✅ Already Done)

The following has been implemented:

### Files Modified:
1. **`client/src/lib/supabase.js`**
   - Added `signInWithGoogle()` function
   - Handles OAuth redirect with proper configuration

2. **`client/src/pages/StudentLogin.jsx`**
   - Added "Continue with Google" button
   - Stores pending quiz session data for post-OAuth redirect
   - Handles Google sign-in flow

3. **`client/src/pages/Result.jsx`**
   - Added "Continue with Google" button to save roadmap section
   - Stores quiz session ID for linking after OAuth

4. **`client/src/pages/dashboard/StudentDashboard.jsx`**
   - Handles OAuth callback
   - Links pending quiz sessions to Google-authenticated users
   - Creates student profile with quiz data

---

## Part 2: Google Cloud Console Setup

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create or Select a Project**:
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it "FORGE" or similar
   - Click "Create"

3. **Enable Google+ API** (required for OAuth):
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" (unless you have a Google Workspace)
   - Click "Create"
   
   **Fill in the form**:
   ```
   App name: FORGE
   User support email: [your email]
   App logo: [optional - upload your logo]
   
   Application home page: https://tryforge.site
   Application privacy policy: https://tryforge.site/privacy (create if needed)
   Application terms of service: https://tryforge.site/terms (create if needed)
   
   Authorized domains:
   - tryforge.site
   - supabase.co
   
   Developer contact: [your email]
   ```
   
   - Click "Save and Continue"
   - **Scopes**: Click "Add or Remove Scopes"
     - Select: `userinfo.email`
     - Select: `userinfo.profile`
     - Click "Update" → "Save and Continue"
   - **Test users**: Add your email for testing
   - Click "Save and Continue"

5. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `FORGE Web Client`
   
   **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://tryforge.site
   ```
   
   **Authorized redirect URIs**:
   ```
   https://[YOUR-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback
   ```
   
   > **Important**: Replace `[YOUR-SUPABASE-PROJECT-REF]` with your actual Supabase project reference.
   > Find it in your Supabase project URL: `https://supabase.com/dashboard/project/[YOUR-PROJECT-REF]`
   > Or in Settings → API → Project URL: `https://[YOUR-PROJECT-REF].supabase.co`
   
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these next)

---

## Part 3: Supabase Configuration

### Step 1: Enable Google Provider

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. Select your **FORGE** project
3. Navigate to: **Authentication → Providers**
4. Find **Google** in the list
5. Toggle **Enable Sign in with Google** to ON

### Step 2: Configure Google OAuth

Fill in the following:

```
Client ID (for OAuth): [Paste from Google Cloud Console]
Client Secret (for OAuth): [Paste from Google Cloud Console]

Authorized Client IDs: [Leave empty unless using native apps]
```

### Step 3: Configure Redirect URLs

1. Go to **Authentication → URL Configuration**
2. **Site URL**:
   - Development: `http://localhost:5173`
   - Production: `https://tryforge.site`

3. **Redirect URLs** (add all):
   ```
   http://localhost:5173/dashboard
   http://localhost:5173/login
   https://tryforge.site/dashboard
   https://tryforge.site/login
   ```

4. Click **Save**

---

## Part 4: Testing

### Test 1: Sign Up with Google (New User)

1. **Go to login page**: `http://localhost:5173/login`
2. Click **"Continue with Google"**
3. Select your Google account
4. Grant permissions
5. Should redirect to `/dashboard`
6. Check that your profile is created in Supabase:
   - Go to Supabase Dashboard → Table Editor → `students`
   - Your Google account should be listed

### Test 2: Sign Up from Quiz Results

1. **Complete the quiz**: `http://localhost:5173/quiz`
2. On results page, click **"Continue with Google"**
3. Authenticate with Google
4. Should redirect to `/dashboard`
5. Verify:
   - Quiz session is linked to your account
   - Domain and profile are saved
   - Roadmap data is populated

### Test 3: Sign In with Google (Existing User)

1. **Sign out** from dashboard
2. **Go to login page**: `http://localhost:5173/login`
3. Click **"Continue with Google"**
4. Should immediately redirect to `/dashboard`
5. All your data should be intact

### Test 4: Multiple Sign-In Methods

1. **Create account with email/password**
2. **Sign out**
3. **Try to sign in with Google** using the same email
4. Should work seamlessly (Supabase links accounts automatically)

---

## Troubleshooting

### Issue: "Error 400: redirect_uri_mismatch"

**Solution**:
- Verify redirect URI in Google Cloud Console matches exactly:
  ```
  https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
  ```
- No trailing slash
- Must use your actual Supabase project reference
- Wait 5 minutes after adding URI for changes to propagate

### Issue: "Access blocked: This app's request is invalid"

**Solution**:
- Complete OAuth consent screen configuration
- Add authorized domains: `tryforge.site` and `supabase.co`
- Add required scopes: `userinfo.email` and `userinfo.profile`
- Publish the app (or add yourself as test user)

### Issue: User redirected but not signed in

**Solution**:
- Check Site URL in Supabase matches your app URL
- Verify redirect URLs are in the allowlist
- Check browser console for errors
- Clear cookies and try again

### Issue: Quiz session not linked after Google sign-in

**Solution**:
- Check browser localStorage for `pendingSessionId`
- Verify dashboard OAuth callback code is running
- Check Supabase logs for errors
- Ensure `students` table has proper permissions

### Issue: "This app isn't verified"

**Solution**:
- This is normal for apps in testing mode
- Click "Advanced" → "Go to FORGE (unsafe)"
- For production: Submit app for Google verification (takes 1-2 weeks)
- Or keep in testing mode with added test users

---

## Production Checklist

Before going live:

- [ ] Update Site URL to production domain
- [ ] Add production redirect URLs
- [ ] Update authorized JavaScript origins in Google Console
- [ ] Verify OAuth consent screen is complete
- [ ] Consider submitting for Google verification
- [ ] Test OAuth flow on production domain
- [ ] Set up proper error logging
- [ ] Add rate limiting for OAuth endpoints

---

## Security Best Practices

1. **Never commit credentials**:
   - Client ID and Secret should only be in Supabase dashboard
   - Not in code or environment variables

2. **Use HTTPS in production**:
   - Google OAuth requires HTTPS for production
   - Localhost HTTP is allowed for development

3. **Validate redirect URLs**:
   - Only add trusted domains to redirect URL allowlist
   - Supabase validates these automatically

4. **Monitor OAuth usage**:
   - Check Supabase Auth logs regularly
   - Set up alerts for suspicious activity

5. **Keep scopes minimal**:
   - Only request `email` and `profile` scopes
   - Don't request additional permissions unless needed

---

## User Experience Flow

### New User (from Quiz):
1. Takes quiz → Sees results
2. Clicks "Continue with Google"
3. Authenticates with Google
4. Redirects to dashboard
5. Quiz results automatically linked
6. Can start tracking progress

### Existing User:
1. Clicks "Continue with Google" on login
2. Authenticates with Google
3. Redirects to dashboard
4. All previous data intact

### Email + Google (Same Email):
1. User signs up with email/password
2. Later tries "Continue with Google" with same email
3. Supabase automatically links accounts
4. User can sign in with either method

---

## Additional Features

### Get User Info from Google

The Google OAuth response includes:
- `user.email` - User's email
- `user.user_metadata.full_name` - Full name
- `user.user_metadata.avatar_url` - Profile picture URL
- `user.user_metadata.email_verified` - Email verification status

You can access these in your code:
```javascript
const { data: { user } } = await supabase.auth.getUser()
console.log(user.user_metadata.full_name)
console.log(user.user_metadata.avatar_url)
```

### Display Profile Picture

Add to your dashboard:
```jsx
{user?.user_metadata?.avatar_url && (
  <img 
    src={user.user_metadata.avatar_url} 
    alt="Profile"
    className="w-10 h-10 rounded-full"
  />
)}
```

---

## Summary

✅ **Code**: Google OAuth integration complete  
⏳ **Google Console**: Create OAuth credentials  
⏳ **Supabase**: Enable Google provider and configure  
⏳ **Testing**: Verify sign-in/sign-up flows work  

Once configured, users can sign in with Google in addition to email/password!
