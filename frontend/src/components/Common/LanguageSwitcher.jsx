import { useState, useRef, useEffect } from "react";
import { MdLanguage } from "react-icons/md";
import { HiChevronDown } from "react-icons/hi2";
import { useLanguage } from "../../context/language/LanguageContext";

const LanguageSwitcher = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, languages, t } = useLanguage();
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("common.language")}
        className="flex items-center gap-2 border border-green-500 text-green-500 px-4 py-1.5 rounded-md hover:bg-green-500 hover:text-white transition text-sm"
      >
        <MdLanguage className="text-lg" />
        {languages.find((l) => l.code === language)?.label || "English"}
        <HiChevronDown className="text-xs" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded-md shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-green-300"
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
