import React from "react";
import AboutImg from "../assets/MainPage.png";
import { useLanguage } from "../context/language/LanguageContext";

const AboutUs = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">{t("about.title")}</h1>
          <p className="mt-2 text-gray-600">{t("about.subtitle")}</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{t("about.missionTitle")}</h2>
            <p className="text-gray-600 mt-3">{t("about.missionText")}</p>

            <h3 className="mt-6 text-lg font-semibold">{t("about.offerTitle")}</h3>
            <ul className="mt-3 list-disc list-inside text-gray-700 space-y-1">
              <li>{t("about.offer1")}</li>
              <li>{t("about.offer2")}</li>
              <li>{t("about.offer3")}</li>
            </ul>
          </div>

          <img src={AboutImg} alt={t("about.alt")} className="rounded-2xl shadow-md w-full object-cover h-64" />
        </div>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold">{t("about.whyTitle")}</h3>
          <p className="text-gray-600 mt-3">{t("about.whyText")}</p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
