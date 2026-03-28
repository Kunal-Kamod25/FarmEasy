import React from "react";
import MapImg from "../assets/Seeds.png";
import { useLanguage } from "../context/language/LanguageContext";

const ContactUs = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/20 to-emerald-50 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">{t("contact.title")}</h1>
          <p className="mt-2 text-gray-600">{t("contact.subtitle")}</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold">{t("contact.reachTitle")}</h2>
            <p className="text-gray-600 mt-2">{t("contact.reachText")}</p>

            <ul className="mt-4 space-y-3 text-gray-700">
              <li><strong>{t("contact.phone")}:</strong> <a href="tel:+917767859953" className="text-green-600">+91 77678 59953</a></li>
              <li><strong>{t("contact.email")}:</strong> <a href="mailto:farmeasy003@gmail.com" className="text-green-600">farmeasy003@gmail.com</a></li>
              <li><strong>{t("contact.workingHours")}:</strong> {t("contact.hoursValue")}</li>
            </ul>

            <h3 className="mt-6 font-semibold">{t("contact.sendTitle")}</h3>
            <form className="mt-3 space-y-3">
              <input type="text" placeholder={t("contact.yourName")} className="w-full border rounded-xl px-4 py-2" />
              <input type="email" placeholder={t("contact.yourEmail")} className="w-full border rounded-xl px-4 py-2" />
              <textarea placeholder={t("contact.helpPlaceholder")} className="w-full border rounded-xl px-4 py-2 h-28" />
              <button type="submit" className="bg-emerald-600 text-white px-5 py-2 rounded-xl">{t("contact.sendButton")}</button>
            </form>
          </div>

          <div>
            <img src={MapImg} alt={t("contact.mapAlt")} className="rounded-2xl shadow-md w-full h-64 object-cover" />
            <p className="text-gray-600 mt-3">{t("contact.visitText")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
