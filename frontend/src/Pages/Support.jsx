import React from "react";
import SupportImg from "../components/../assets/Fartilizers1.png";
import { useLanguage } from "../context/language/LanguageContext";

const Support = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/20 to-emerald-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">{t("support.title")}</h1>
          <p className="mt-2 text-gray-600">{t("support.subtitle")}</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <img src={SupportImg} alt={t("support.alt")} className="rounded-2xl shadow-md w-full object-cover h-64" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{t("support.gettingStarted")}</h2>
            <p className="text-gray-600 mt-3">{t("support.gettingStartedText")}</p>

            <h3 className="mt-6 text-lg font-semibold text-gray-800">{t("support.manualsTitle")}</h3>
            <p className="text-gray-600 mt-2">{t("support.manualsText")}</p>

            <ul className="mt-4 list-disc list-inside text-gray-700 space-y-1">
              <li>{t("support.tip1")}</li>
              <li>{t("support.tip2")}</li>
              <li>{t("support.tip3")}</li>
            </ul>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800">{t("support.faqTitle")}</h3>
          <div className="mt-4 space-y-3 text-gray-700">
            <details className="bg-gray-50 p-3 rounded">
              <summary className="cursor-pointer font-semibold">{t("support.faq1q")}</summary>
              <p className="mt-2">{t("support.faq1a")}</p>
            </details>

            <details className="bg-gray-50 p-3 rounded">
              <summary className="cursor-pointer font-semibold">{t("support.faq2q")}</summary>
              <p className="mt-2">{t("support.faq2a")}</p>
            </details>

            <details className="bg-gray-50 p-3 rounded">
              <summary className="cursor-pointer font-semibold">{t("support.faq3q")}</summary>
              <p className="mt-2">{t("support.faq3a")}</p>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Support;
