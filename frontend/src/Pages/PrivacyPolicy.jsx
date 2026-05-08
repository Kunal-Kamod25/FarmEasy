import React from "react";
import { useLanguage } from "../context/language/LanguageContext";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

const PrivacyPolicy = () => {
    // eslint-disable-next-line no-unused-vars
  const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50 py-16 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mb-6 shadow-sm">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-500 font-medium">Last updated: May 2026</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl shadow-emerald-500/5 p-8 md:p-12 space-y-12 text-slate-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-4 uppercase tracking-wider">
                            <Eye size={20} className="text-emerald-500" />
                            Information We Collect
                        </h2>
                        <p>
                            At FarmEasy, we collect information to provide better services to our users. This includes your name, email address, phone number, and delivery address when you register or make a purchase.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-4 uppercase tracking-wider">
                            <Lock size={20} className="text-emerald-500" />
                            How We Use Your Data
                        </h2>
                        <p>
                            We use the information we collect to process orders, maintain your account, and improve our marketplace. We may also use your data to send you important updates or promotional offers if you have opted in.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-4 uppercase tracking-wider">
                            <FileText size={20} className="text-emerald-500" />
                            Data Protection
                        </h2>
                        <p>
                            We implement a variety of security measures to maintain the safety of your personal information. Your sensitive data is encrypted via Secure Socket Layer (SSL) technology and is only accessible by a limited number of persons who have special access rights.
                        </p>
                    </section>

                    <section className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                        <p className="text-sm font-semibold text-emerald-800">
                            By using our platform, you consent to our privacy policy. If you have any questions regarding this privacy policy, you may contact us using the information on our contact page.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
