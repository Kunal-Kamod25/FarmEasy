# 🌍 FarmEasy Multi-Language Update - Google Translate Integration

## What Changed?

✅ **Before:** Hard-coded 3 languages (English, Hindi, Marathi) in `translations.js`  
✅ **Now:** Dynamic support for **100+ languages worldwide** via Google Translate API

---

## What You Need to Do

### 1. **Copy Service Account Key File**
   - Download JSON key from Google Cloud Console (see [GOOGLE_TRANSLATE_SETUP.md](./GOOGLE_TRANSLATE_SETUP.md))
   - Place it in: `/backend/` folder
   - Example: `/backend/farmeasy-key.json`

### 2. **Update `.env` File**
   Edit `/backend/.env` and add your Google credentials:
   ```bash
   GOOGLE_PROJECT_ID=your-actual-project-id
   GOOGLE_CREDENTIALS_FILE=/path/to/your-key-file.json
   ```

### 3. **Restart Backend**
   ```bash
   cd backend
   npm run dev
   ```

### 4. **Test Language Switching**
   - Open app in browser
   - Click Language Selector in header
   - Try different languages: Hindi, Tamil, Urdu, Spanish, etc.
   - Everything should translate instantly!

---

## Architecture Changes

### **Frontend (Old → New)**

Old approach:
```javascript
// ❌ Static translations.js with 3 languages
import { translations } from "./translations";
const t = (key) => translations[language][key];
```

New approach:
```javascript
// ✅ Dynamic API-based translations with caching
const t = (key) => translateCache[language][key];
// Cache is fetched from: GET /api/translations/{languageCode}
```

### **Backend (New Endpoints)**

```
GET /api/translations/:languageCode
  ↳ Returns translated UI strings for that language
  ↳ Uses Google Translate API internally
  ↳ Example: GET /api/translations/ta
    Response: { "checkout.fullName": "முழு பெயர்", ... }

GET /api/translations/languages/list
  ↳ Returns all supported language codes
```

### **Caching Strategy**

```
User selects language
    ↓
Check localStorage cache
    ↓ (if not cached)
Fetch from /api/translations/{lang}
    ↓
Backend calls Google Translate API
    ↓
Save to localStorage
    ↓
Render instantly for future use
```

Benefits:
- ✅ No repeated API calls for same language
- ✅ Works offline after first load
- ✅ Instant language switching (from cache)

---

## New Files Created

1. **Backend:**
   - `controllers/translationController.js` - Translation API logic
   - `routes/translationRoutes.js` - Translation endpoints

2. **Frontend:**
   - ✅ `LanguageContext.jsx` - Updated to use API + caching

3. **Documentation:**
   - `GOOGLE_TRANSLATE_SETUP.md` - Step-by-step Google API setup
   - `MIGRATION_GUIDE.md` - This file!

---

## Support for All Languages

### Currently Added to Dropdown

| Code | Language | Native |
|------|----------|--------|
| en | English | English |
| hi | Hindi | हिंदी |
| mr | Marathi | मराठी |
| ta | Tamil | தமிழ் |
| te | Telugu | తెలుగు |
| ur | Urdu | اردو |
| kn | Kannada | ಕನ್ನಡ |
| bn | Bengali | বাংলা |
| pt | Portuguese | Português |
| es | Spanish | Español |
| fr | French | Français |
| de | German | Deutsch |
| zh | Chinese | 中文 |
| ja | Japanese | 日本語 |
| ar | Arabic | العربية |

**To add more languages:** Edit `DEFAULT_LANGUAGES` in `frontend/src/context/language/LanguageContext.jsx`

**Available codes:** All ISO 639-1 language codes work!

---

## Costs & Free Tier

- **Free:** 500,000 characters/month
- **Estimated usage:** ~50,000 chars/month for FarmEasy UI
- **Cost after free tier:** ~$15 per million characters
- **Budget alert:** Set $10/month limit (see setup guide)

---

## Testing Checklist

- [ ] Backend starts without errors: `npm run dev`
- [ ] Check logs for: "🚀 Server running..."
- [ ] Frontend page loads
- [ ] Click language selector in header
- [ ] Select a non-English language
- [ ] Verify text changes on the page
- [ ] Check browser console for errors
- [ ] Try language switching multiple times
- [ ] Open app on different device (cache should work)

---

## Troubleshooting

### "Failed to translate strings" Error
❌ **Problem:** Google API credentials not set up  
✅ **Solution:** Follow [GOOGLE_TRANSLATE_SETUP.md](./GOOGLE_TRANSLATE_SETUP.md)

### Backend crashes on startup
❌ **Problem:** .env not configured  
✅ **Solution:** Add `GOOGLE_PROJECT_ID` and `GOOGLE_CREDENTIALS_FILE` to .env

### Language selector shows no languages
❌ **Problem:** LanguageContext not loading  
✅ **Solution:** Check browser console for errors in LanguageContext.jsx

### Translations not appearing
❌ **Problem:** API call failing, falling back to English  
✅ **Solution:** Check Network tab in DevTools - see /api/translations/... requests

---

## FAQ

**Q: Do I need the old `translations.js` file?**  
A: You can keep it for reference, but it's not used anymore. The new system fetches from API.

**Q: Can I add custom translations?**  
A: Yes! Edit the `ENGLISH_STRINGS` object in `controllers/translationController.js` to add more UI keys to translate.

**Q: What if Google API is down?**  
A: Graceful fallback - app uses English or cached version from localStorage.

**Q: Can I use a different translation service?**  
A: Yes! Replace Google Translate with any API (DeepL, Microsoft Translator, etc.) in `translationController.js`.

---

## Next Steps

1. Set up Google Cloud account (5 min)
2. Download service account key (2 min)
3. Update .env file (1 min)
4. Restart backend (1 min)
5. Test language switching (2 min)

**Total time:** ~10 minutes

---

## Support

For setup help, check:
- [GOOGLE_TRANSLATE_SETUP.md](./GOOGLE_TRANSLATE_SETUP.md) - Detailed setup guide
- Backend logs: `npm run dev` shows all API calls
- Browser DevTools → Network tab: See /api/translations/... requests
- Google Cloud Console: Check API usage and costs

