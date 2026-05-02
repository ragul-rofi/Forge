# SRINI Model Configuration Guide

## Where Claude Haiku is Configured

Claude Haiku is configured in the **Vapi Dashboard**, not in your code or environment variables.

---

## How to Check/Update the Model

### Step 1: Access Vapi Dashboard
1. Go to: https://dashboard.vapi.ai/assistants
2. Log in with your Vapi account
3. Find "SRINI — FORGE Voice Guide" assistant
4. Click on it to open settings

### Step 2: Locate Model Settings
Scroll down to the **Model** section. You should see:

```
┌─────────────────────────────────────────┐
│ Model Configuration                     │
├─────────────────────────────────────────┤
│ Provider: [Anthropic ▼]                 │
│ Model: [claude-haiku-4-5-20251001 ▼]   │
│ Temperature: [0.7]                      │
│ Max Tokens: [Leave empty]               │
│ System Message: [Your SRINI prompt]    │
└─────────────────────────────────────────┘
```

### Step 3: Verify Settings

**Correct Configuration for Low Latency:**
- **Provider:** `Anthropic`
- **Model:** `claude-haiku-4-5-20251001` (or `claude-3-5-haiku-20241022`)
- **Temperature:** `0.7`
- **Response Delay:** `0` seconds
- **LLM Request Delay:** `0` seconds

**Why Haiku?**
- 3x faster than Sonnet
- ~400-700ms response time
- Perfect for voice conversations
- Lower cost ($0.02/min vs $0.05/min)

---

## Alternative Models (If Haiku Not Available)

If `claude-haiku-4-5-20251001` is not in the dropdown, try:

1. **claude-3-5-haiku-20241022** (Latest Haiku)
2. **claude-3-haiku-20240307** (Older but stable)

**DO NOT USE:**
- ❌ `claude-sonnet-4-20250514` - Too slow for voice (1-2 second latency)
- ❌ `claude-opus-*` - Way too slow and expensive

---

## How Vapi Uses Your Anthropic API

**Important:** Vapi uses its own Anthropic API integration. You don't need to provide an Anthropic API key separately.

**How it works:**
1. Vapi has a partnership with Anthropic
2. When you use Claude models in Vapi, Vapi calls Anthropic's API
3. The cost is included in your Vapi bill
4. You see it as "LLM cost" in Vapi billing

**Cost Breakdown:**
- Vapi platform: $0.05/min
- Claude Haiku (via Vapi): ~$0.02/min
- Total: ~$0.07/min (before STT/TTS)

---

## Current Configuration Check

Your SRINI Assistant ID: `da62ae48-9dd8-4249-8673-d5178dc7df6a`

To verify your current model:
1. Go to: https://dashboard.vapi.ai/assistants/da62ae48-9dd8-4249-8673-d5178dc7df6a
2. Check the Model section
3. If it's not Haiku, update it now

---

## Testing After Model Change

After changing the model:

1. **Test in Vapi Dashboard:**
   - Click "Test" button in assistant settings
   - Start a call
   - Check response time (should be <1 second)

2. **Test from your app:**
   ```bash
   cd client
   npm run dev
   ```
   - Complete quiz
   - Click "Talk Now"
   - Verify fast responses

3. **Check latency in Vapi logs:**
   - Go to: https://dashboard.vapi.ai/calls
   - Click on your test call
   - Look at "Latency" metrics
   - Should show <800ms average

---

## Troubleshooting

### Issue: Model dropdown doesn't show Haiku
**Solution:** 
- Vapi might have updated model names
- Look for any model with "haiku" in the name
- Or contact Vapi support to enable Haiku

### Issue: High latency even with Haiku
**Check these settings:**
- Response Delay: Should be `0`
- LLM Request Delay: Should be `0`
- Endpointing: Should be `200ms` or less
- Voice model: Should be `eleven_turbo_v2_5` (not standard)

### Issue: "Model not found" error
**Solution:**
- The model name might have changed
- Try: `claude-3-5-haiku-20241022`
- Or use the latest Haiku version available

---

## Summary

✅ **Claude Haiku is configured in Vapi Dashboard, not in code**
✅ **Go to:** https://dashboard.vapi.ai/assistants
✅ **Find:** SRINI assistant
✅ **Set Model to:** claude-haiku-4-5-20251001
✅ **Set Temperature to:** 0.7
✅ **Set Response Delay to:** 0

This ensures SRINI responds in under 1 second!
