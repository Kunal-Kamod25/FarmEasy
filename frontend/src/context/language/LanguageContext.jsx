import { createContext, useContext, useEffect, useMemo } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);

const ENGLISH_ONLY = [{ code: "en", label: "English" }];

const interpolate = (text, params) => {
  if (!params) return text;
  return Object.entries(params).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }, text);
};

export const LanguageProvider = ({ children }) => {
  const language = "en";

  useEffect(() => {
    document.documentElement.lang = "en";
  }, []);

  const t = useMemo(() => {
    return (key, params) => {
      const value = translations.en?.[key] ?? key;
      return interpolate(value, params);
    };
  }, []);

  const td = useMemo(() => {
    return (text) => text;
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage: () => {},
      languages: ENGLISH_ONLY,
      t,
      td,
    }),
    [t, td]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
};
