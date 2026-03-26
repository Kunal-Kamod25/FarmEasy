import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SUPPORTED_LANGUAGES, translations } from "./translations";

const STORAGE_KEY = "farmeasy_language";

const LanguageContext = createContext(null);

const DYNAMIC_TERMS = {
  hi: {
    seeds: "बीज",
    fertilizer: "उर्वरक",
    fertilizers: "उर्वरक",
    organic: "जैविक",
    hybrid: "हाइब्रिड",
    pesticide: "कीटनाशक",
    pesticides: "कीटनाशक",
    equipment: "उपकरण",
    irrigation: "सिंचाई",
    spray: "स्प्रे",
    pump: "पंप",
    soil: "मिट्टी",
    nutrient: "पोषक तत्व",
    compost: "कम्पोस्ट",
    farming: "खेती",
    farm: "फार्म",
    premium: "प्रीमियम",
  },
  mr: {
    seeds: "बियाणे",
    fertilizer: "खत",
    fertilizers: "खते",
    organic: "सेंद्रिय",
    hybrid: "हायब्रिड",
    pesticide: "कीटकनाशक",
    pesticides: "कीटकनाशके",
    equipment: "उपकरणे",
    irrigation: "सिंचन",
    spray: "फवारणी",
    pump: "पंप",
    soil: "माती",
    nutrient: "पोषक द्रव्य",
    compost: "कंपोस्ट",
    farming: "शेती",
    farm: "फार्म",
    premium: "प्रीमियम",
  },
};

const normalizeLanguageCode = (code) => {
  if (!code) return "en";
  return SUPPORTED_LANGUAGES.some((l) => l.code === code) ? code : "en";
};

const interpolate = (text, params) => {
  if (!params) return text;
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }, text);
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return normalizeLanguageCode(saved);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const t = useMemo(() => {
    return (key, params) => {
      const langPack = translations[language] || translations.en;
      const fallback = translations.en;
      const value = langPack[key] ?? fallback[key] ?? key;
      return interpolate(value, params);
    };
  }, [language]);

  const td = useMemo(() => {
    return (text) => {
      if (!text || language === "en") return text;
      const termMap = DYNAMIC_TERMS[language];
      if (!termMap) return text;

      return Object.entries(termMap).reduce((acc, [enWord, localizedWord]) => {
        const regex = new RegExp(`\\b${enWord}\\b`, "gi");
        return acc.replace(regex, localizedWord);
      }, String(text));
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (code) => setLanguage(normalizeLanguageCode(code)),
      languages: SUPPORTED_LANGUAGES,
      t,
      td,
    }),
    [language, t, td]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
};
