# SETUP: Google Translate API for Multi-Language Support

## Overview
FarmEasy now uses Google Cloud Translate API to support **ANY language worldwide**. Instead of maintaining static translations, the app fetches dynamic translations from Google's API.

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Enter project name: `farmeasy-translations`
4. Click **Create**
5. Wait for project to be created (1-2 minutes)

---

## Step 2: Enable Translation API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Cloud Translation API"**
3. Click on it and then click **ENABLE**
4. Wait for it to finish enabling

---

## Step 3: Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **Service Account**
3. Fill in:
   - **Service account name:** `farmeasy-translate`
   - **Service account ID:** (auto-generated, keep it)
4. Click **Create and continue**
5. Grant roles:
   - Click **Select a role** → Search **"Translation"**
   - Select **Cloud Translation API Editor**
6. Click **Continue** → **Done**

---

## Step 4: Create JSON Key File

1. In **APIs & Services** → **Service Accounts**
2. Click on the service account you just created (`farmeasy-translate`)
3. Go to **Keys** tab
4. Click **Add Key** → **Create new key**
5. Choose **JSON** format
6. Click **Create** (a JSON file will download)
7. **Save this file** to your backend folder

---

## Step 5: Configure Environment Variables

### Backend (.env file in `/backend/`)

```bash
# Google Cloud Translation API
GOOGLE_PROJECT_ID=your-project-id-here
GOOGLE_CREDENTIALS_FILE=/path/to/downloaded-json-key-file.json

# Get these from the JSON file:
# - "project_id" → GOOGLE_PROJECT_ID
# - The file path itself → GOOGLE_CREDENTIALS_FILE
```

### Get Values from JSON Key File

Open the downloaded JSON file and find:
- **`project_id`** - Copy this to `GOOGLE_PROJECT_ID`
- The file path where you saved it - Set as `GOOGLE_CREDENTIALS_FILE`

Example `.env`:
```bash
GOOGLE_PROJECT_ID=farmeasy-translations-12345
GOOGLE_CREDENTIALS_FILE=/Users/kunal/Desktop/FarmEasy/backend/farmeasy-key.json
```

---

## Step 6: Cost Control (IMPORTANT)

⚠️ **Free Tier:** Google Cloud gives you **500,000 characters/month free** (plenty for a small app)

To avoid surprise bills:
1. Set **Budget Alert**
   - Go to **Billing** → **Budgets**
   - Create budget: Set limit to $10/month
   - Get email alerts if spending exceeds limit

2. Monitor Usage
   - **APIs & Services** → **Quotas** → Find "Cloud Translation"
   - Set quotas to prevent runaway usage

---

## Step 7: Test the Setup

### Create a test script (`backend/test-translate.js`):

```javascript
const { Translate } = require("@google-cloud/translate").v2;

const translate = new Translate({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CREDENTIALS_FILE,
});

async function test() {
  try {
    const text = "Hello, how are you?";
    const [translation] = await translate.translate(text, "hi");
    console.log("English:", text);
    console.log("Hindi:", translation);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();
```

Run it:
```bash
cd backend
node test-translate.js
```

Expected output:
```
English: Hello, how are you?
Hindi: नमस्ते, आप कैसे हैं?
```

---

## Step 8: Supported Languages

The app now supports **100+ languages**, including:

### Indian Languages
- **hi** - हिंदी (Hindi)
- **ta** - தமிழ் (Tamil)
- **te** - తెలుగు (Telugu)
- **mr** - मराठी (Marathi)
- **kn** - ಕನ್ನಡ (Kannada)
- **bn** - বাংলা (Bengali)
- **ur** - اردو (Urdu)

### International Languages
- **en** - English
- **es** - Español (Spanish)
- **fr** - Français (French)
- **de** - Deutsch (German)
- **pt** - Português (Portuguese)
- **zh** - 中文 (Chinese)
- **ja** - 日本語 (Japanese)
- **ar** - العربية (Arabic)
- **ru** - Русский (Russian)
- **ko** - 한국어 (Korean)
- ... and 90+ more!

**To add more languages:** Edit `DEFAULT_LANGUAGES` in [LanguageContext.jsx](../../../frontend/src/context/language/LanguageContext.jsx)

---

## Step 9: Usage

Users can now:
1. Click **Language Selector** in header
2. Choose ANY language from the dropdown
3. Backend fetches translations via Google API
4. Translations are cached locally (no repeated API calls)
5. Everything changes instantly

---

## Troubleshooting

### "GOOGLE_APPLICATION_CREDENTIALS not set"
→ Check your `.env` file has both `GOOGLE_PROJECT_ID` and `GOOGLE_CREDENTIALS_FILE`

### "Failed to authenticate with Google"
→ Make sure your JSON key file path is correct and the file exists

### "API not enabled"
→ Go to Google Cloud Console and enable **Cloud Translation API** again

### High costs?
→ Set billing budget ($10/month limit) in Google Cloud Console

---

## Performance Notes

✅ **Translations are cached locally** - First load = API call, then cached for future use  
✅ **No API calls on English** - English is the source, no translation needed  
✅ **500K free characters/month** - More than enough for most websites  
✅ **Instant language switching** - Cached translations load immediately  

---

## Architecture Diagram

```
User Selects Language (e.g., Hindi)
    ↓
Frontend calls: GET /api/translations/hi
    ↓
Backend receives request
    ↓
Backend checks local cache (translations.js) - NOT USED ANYMORE
    ↓
Backend calls Google Translate API
    ↓
Google returns: {"checkout.fullName": "पूरा नाम", ...}
    ↓
Frontend caches in localStorage
    ↓
Frontend renders page in Hindi
    ↓
User switches to Tamil
    ↓
Frontend calls: GET /api/translations/ta (if not cached)
    ↓
Repeat...
```

---

## Next Steps

1. ✅ Set up Google Cloud account
2. ✅ Create service account and download JSON key
3. ✅ Update `.env` with credentials
4. ✅ Restart backend: `npm run dev`
5. ✅ Test: Open app and switch languages
6. ✅ Monitor costs in Google Cloud Console

---

## Questions?

If setup fails, check:
- Backend logs for error messages: `npm run dev`
- JSON key file exists at the path specified in `.env`
- Google Cloud billing is active
- Translation API is enabled in the console

