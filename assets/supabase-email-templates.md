# Forge — Supabase Email Templates

Paste these into **Supabase Dashboard → Authentication → Email Templates**.

---

## 1. Confirm Signup (Email Confirmation)

**Subject:** `Confirm your Forge account`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm your Forge account</title>
</head>
<body style="margin:0;padding:0;background-color:#101014;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#101014;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#f0ece4;">
                ⬡ Forge
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#18181c;border:1px solid #2a2a30;border-radius:18px;padding:40px 36px;">

              <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#f0ece4;letter-spacing:-0.5px;">
                Confirm your email
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#78787e;line-height:1.6;">
                Welcome to Forge. One quick step — confirm your email address to activate your account and access your career roadmap.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background-color:#818cf8;">
                    <a
                      href="{{ .ConfirmationURL }}"
                      style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#101014;text-decoration:none;border-radius:12px;letter-spacing:0.2px;"
                    >
                      Confirm Email →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:12px;color:#4a4a52;line-height:1.6;">
                If you didn't create a Forge account, you can safely ignore this email.
                This link expires in <strong style="color:#78787e;">24 hours</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:11px;color:#3a3a42;">
                © Forge · Student Career Profiler
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Reset Password (Forgot Password)

**Subject:** `Reset your Forge password`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your Forge password</title>
</head>
<body style="margin:0;padding:0;background-color:#101014;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#101014;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#f0ece4;">
                ⬡ Forge
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#18181c;border:1px solid #2a2a30;border-radius:18px;padding:40px 36px;">

              <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#f0ece4;letter-spacing:-0.5px;">
                Reset your password
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#78787e;line-height:1.6;">
                We received a request to reset your Forge password. Click the button below to choose a new one.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background-color:#818cf8;">
                    <a
                      href="{{ .ConfirmationURL }}"
                      style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#101014;text-decoration:none;border-radius:12px;letter-spacing:0.2px;"
                    >
                      Reset Password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security note -->
              <table style="margin-top:28px;" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background-color:#222228;border:1px solid #2a2a30;border-radius:10px;padding:14px 16px;">
                    <p style="margin:0;font-size:12px;color:#9a9aa0;line-height:1.6;">
                      🔒 &nbsp;This link expires in <strong style="color:#f0ece4;">1 hour</strong>.
                      If you didn't request a password reset, no action is needed — your account is safe.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:11px;color:#3a3a42;">
                © Forge · Student Career Profiler
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## How to Apply

1. Go to **Supabase Dashboard → Authentication → Email Templates**
2. Select **"Confirm signup"** → paste Template 1, set the subject line
3. Select **"Reset password"** → paste Template 2, set the subject line
4. Make sure your **Site URL** (Authentication → URL Configuration) points to your deployed domain, e.g. `https://yourapp.vercel.app`
5. Add `/reset-password` to the **Redirect URLs** allowlist so the reset link lands on the correct page

> The `{{ .ConfirmationURL }}` placeholder is automatically replaced by Supabase with the real link — do not change it.
