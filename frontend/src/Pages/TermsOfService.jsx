import React from "react";
import { useLanguage } from "../context/language/LanguageContext";
import { Gavel, CheckCircle2, AlertCircle, Scale } from "lucide-react";

const TermsOfService = () => {
    // eslint-disable-next-line no-unused-vars
  const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/10 to-teal-50 py-16 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl mb-6 shadow-sm">
                        <Scale size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-slate-500 font-medium">Last updated: May 2026</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl shadow-amber-500/5 p-8 md:p-12 space-y-12 text-slate-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-4 uppercase tracking-wider">
                            <Gavel size={20} className="text-amber-500" />
                            Acceptance of Terms
                        </h2>
                        <p>
                            By accessing and using FarmEasy, you agree to comply with and be bound by these Terms of Service. These terms apply to all visitors, users, and others who access or use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-4 uppercase tracking-wider">
                            <CheckCircle2 size={20} className="text-amber-500" />
                            User Responsibilities
                        </h2>
                        <p>
                            Users are responsible for maintaining the confidentiality of their account and password. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-4 uppercase tracking-wider">
                            <AlertCircle size={20} className="text-amber-500" />
                            Prohibited Conduct
                        </h2>
                        <p>
                            You may not use FarmEasy for any illegal purpose or in any way that violates these terms. This includes but is not limited to: uploading malicious code, engaging in fraudulent activities, or infringing on the intellectual property of others.
                        </p>
                    </section>

                    <section className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100">
                        <p className="text-sm font-semibold text-amber-800">
                            We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
