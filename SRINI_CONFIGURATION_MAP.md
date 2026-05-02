# SRINI Configuration Map - Where Everything is Set

## Configuration Locations Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  VAPI DASHBOARD                             │
│           https://dashboard.vapi.ai                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SRINI Assistant Configuration                        │  │
│  │  (ID: da62ae48-9dd8-4249-8673-d5178dc7df6a)          │  │
│  │                                                        │  │
│  │  ✅ Model (Claude Haiku)                              │  │
│  │     Provider: Anthropic                               │  │
│  │     Model: claude-haiku-4-5-20251001                  │  │
│  │     Temperature: 0.7                                  │  │
│  │                                                        │  │
│  │  ✅ Voice (ElevenLabs)                                │  │
│  │     Provider: 11labs                                  │  │
│  │     Voice ID: [Your ElevenLabs Voice ID]              │  │
│  │     Model: eleven_turbo_v2_5                          │  │
│  │     Optimize Streaming Latency: 4                     │  │
│  │                                                        │  │
│  │  ✅ Transcriber (Deepgram)                            │  │
│  │     Provider: Deepgram                                │  │
│  │     Model: nova-2                                     │  │
│  │     Language: multi                                   │  │
│  │     Detect Language: true                             │  │
│  │                                                        │  │
│  │  ✅ System Prompt                                     │  │
│  │     [Full SRINI personality and rules]                │  │
│  │                                                        │  │
│  │  ✅ First Message                                     │  │
│  │     "Hey {{student_name}}, SRINI here..."            │  │
│  │                                                        │  │
│  │  ✅ Call Settings                                     │  │
│  │     Max Duration: 540 seconds                         │  │
│  │     Recording: Enabled                                │  │
│  │     Response Delay: 0 seconds                         │  │
│  │     LLM Request Delay: 0 seconds                      │  │
│  │                                                        │  │
│  │  ✅ Server URL (Webhook)                              │  │
│  │     https://your-backend.com/api/srini-webhook        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Phone Numbers (Optional)                             │  │
│  │                                                        │  │
│  │  ✅ Imported Twilio Number                            │  │
│  │     Number: +1234567890                               │  │
│  │     Assigned to: SRINI Assistant                      │  │
│  │     Phone Number ID: pn_xxxxx                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              YOUR CODE - Environment Variables              │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  client/.env                                          │  │
│  │                                                        │  │
│  │  VITE_VAPI_PUBLIC_KEY=8d29f800-8ab1-461e-ae10-...    │  │
│  │  VITE_VAPI_ASSISTANT_ID=da62ae48-9dd8-4249-8673-...  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  server/.env                                          │  │
│  │                                                        │  │
│  │  VAPI_PRIVATE_KEY=8d29f800-8ab1-461e-ae10-...        │  │
│  │  VAPI_ASSISTANT_ID=da62ae48-9dd8-4249-8673-...       │  │
│  │  ELEVENLABS_API_KEY=sk_29bbdf85e55356e4256d1522...   │  │
│  │  DEEPGRAM_API_KEY=ee18ba401c4e332ed4362b3361918...   │  │
│  │  TWILIO_ACCOUNT_SID=ACe8177e7843da3f6a614523...      │  │
│  │  TWILIO_AUTH_TOKEN=d130db01c32c1328f2142b07...       │  │
│  │  TWILIO_PHONE_NUMBER=+13507775758                    │  │
│  │  VAPI_PHONE_NUMBER_ID=a940abaa-f873-4535-83b7-...   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICE DASHBOARDS                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ElevenLabs Dashboard                                 │  │
│  │  https://elevenlabs.io                                │  │
│  │                                                        │  │
│  │  ✅ Voice Created/Selected                            │  │
│  │     Voice: Raj (or custom)                            │  │
│  │     Voice ID: [copied to Vapi]                        │  │
│  │                                                        │  │
│  │  ✅ API Key Generated                                 │  │
│  │     [copied to server/.env]                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Deepgram Dashboard                                   │  │
│  │  https://deepgram.com                                 │  │
│  │                                                        │  │
│  │  ✅ API Key Generated                                 │  │
│  │     [copied to server/.env]                           │  │
│  │                                                        │  │
│  │  Note: Model (Nova-2) configured in Vapi, not here   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Twilio Dashboard (Optional)                          │  │
│  │  https://twilio.com                                   │  │
│  │                                                        │  │
│  │  ✅ Phone Number Purchased                            │  │
│  │     Number: +13507775758                              │  │
│  │                                                        │  │
│  │  ✅ Credentials Copied                                │  │
│  │     Account SID: [copied to server/.env]              │  │
│  │     Auth Token: [copied to server/.env]               │  │
│  │                                                        │  │
│  │  Note: Number imported to Vapi, not used directly    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Anthropic Dashboard                                  │  │
│  │  https://anthropic.com                                │  │
│  │                                                        │  │
│  │  ❌ NOT USED - Vapi handles Anthropic integration    │  │
│  │                                                        │  │
│  │  Note: You don't need an Anthropic API key!          │  │
│  │  Vapi calls Claude on your behalf.                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: Where to Configure What

| Component | Where to Configure | What to Set |
|-----------|-------------------|-------------|
| **Claude Haiku** | Vapi Dashboard → Assistant → Model | Provider: Anthropic<br>Model: claude-haiku-4-5-20251001 |
| **ElevenLabs Voice** | Vapi Dashboard → Assistant → Voice | Provider: 11labs<br>Voice ID: [from ElevenLabs]<br>Model: eleven_turbo_v2_5 |
| **Deepgram STT** | Vapi Dashboard → Assistant → Transcriber | Provider: Deepgram<br>Model: nova-2<br>Language: multi |
| **System Prompt** | Vapi Dashboard → Assistant → Messages | Full SRINI personality |
| **Webhook URL** | Vapi Dashboard → Assistant → Server URL | Your backend URL |
| **Vapi Keys** | Vapi Dashboard → Settings → API Keys | Copy to .env files |
| **ElevenLabs Key** | ElevenLabs Dashboard → API Keys | Copy to server/.env |
| **Deepgram Key** | Deepgram Dashboard → API Keys | Copy to server/.env |
| **Twilio Credentials** | Twilio Dashboard | Copy to server/.env |
| **Phone Number** | Vapi Dashboard → Phone Numbers | Import from Twilio |

---

## Step-by-Step: Where You Configured Everything

### ✅ What You Already Did:

1. **Created Vapi Account** → Got Public & Private Keys
2. **Created ElevenLabs Account** → Got Voice ID & API Key
3. **Created Deepgram Account** → Got API Key
4. **Created Twilio Account** → Got credentials & phone number
5. **Created SRINI Assistant in Vapi** → This is where Claude Haiku is set!
6. **Updated .env files** → Added all API keys

### ⚠️ What You Need to Verify:

**Go to Vapi Dashboard and check:**
```
https://dashboard.vapi.ai/assistants/da62ae48-9dd8-4249-8673-d5178dc7df6a
```

Scroll to **Model** section and verify:
- Provider: `Anthropic` ✅
- Model: `claude-haiku-4-5-20251001` ⚠️ (Check this!)
- Temperature: `0.7` ✅

If the model is NOT Haiku (e.g., if it's Sonnet), change it now!

---

## Why This Matters

**Current Model = Response Speed**

| Model | Response Time | Cost/min | Use Case |
|-------|--------------|----------|----------|
| Claude Haiku | ~400-700ms | $0.02 | ✅ Voice calls (FAST) |
| Claude Sonnet | ~1-2 seconds | $0.05 | ❌ Too slow for voice |
| Claude Opus | ~3-5 seconds | $0.15 | ❌ Way too slow |

**If you're using Sonnet by mistake:**
- Students will experience 1-2 second delays
- Conversation feels sluggish
- Higher costs

**With Haiku:**
- Sub-1-second responses
- Natural conversation flow
- Lower costs

---

## How to Check Your Current Model

### Method 1: Vapi Dashboard (Recommended)
1. Go to: https://dashboard.vapi.ai/assistants
2. Click on SRINI assistant
3. Look at Model section
4. Should say: `claude-haiku-4-5-20251001`

### Method 2: Test Call and Check Logs
1. Make a test call
2. Go to: https://dashboard.vapi.ai/calls
3. Click on your call
4. Look at "Model" field in call details
5. Should show: `claude-haiku-4-5-20251001`

### Method 3: Check Latency
1. Make a test call
2. Ask SRINI a question
3. Time the response
4. Should be under 1 second
5. If it's 1-2 seconds, you're probably using Sonnet

---

## Direct Link to Your Assistant

**Your SRINI Assistant:**
https://dashboard.vapi.ai/assistants/da62ae48-9dd8-4249-8673-d5178dc7df6a

Click this link → Check Model section → Verify it's Haiku!

---

## Summary

✅ **Claude Haiku is configured in Vapi Dashboard**
✅ **NOT in your code or .env files**
✅ **Go check it now:** https://dashboard.vapi.ai/assistants
✅ **Look for Model section**
✅ **Should be:** claude-haiku-4-5-20251001
✅ **If not, change it immediately!**

This is the most important setting for SRINI's performance!
