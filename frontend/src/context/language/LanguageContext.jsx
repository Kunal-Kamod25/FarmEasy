import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SUPPORTED_LANGUAGES, translations } from "./translations";

const STORAGE_KEY = "farmeasy_language";

const LanguageContext = createContext(null);

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

  const value = useMemo(
    () => ({
      language,
      setLanguage: (code) => setLanguage(normalizeLanguageCode(code)),
      languages: SUPPORTED_LANGUAGES,
      t,
    }),
    [language, t]
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
