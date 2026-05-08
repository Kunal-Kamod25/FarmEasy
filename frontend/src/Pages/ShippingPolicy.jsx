import React from "react";
import { useLanguage } from "../context/language/LanguageContext";
import { Truck, Clock, Globe, PackageCheck } from "lucide-react";

const ShippingPolicy = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/10 to-emerald-50 py-16 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl mb-6 shadow-sm">
                        <Truck size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-4">
                        Shipping Policy
                    </h1>
                    <p className="text-slate-500 font-medium">Last updated: May 2026</p>
                </div>

                <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl shadow-teal-500/5 p-8 md:p-12 space-y-12 text-slate-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-4 uppercase tracking-wider">
                            <Clock size={20} className="text-teal-500" />
                            Delivery Times
                        </h2>
                        <p>
                            We strive to deliver your orders as quickly as possible. Typical delivery times range from 3 to 7 business days depending on your location and the availability of the products. You will receive a tracking number once your order is shipped.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-4 uppercase tracking-wider">
                            <PackageCheck size={20} className="text-teal-500" />
                            Shipping Costs
                        </h2>
                        <p>
                            Shipping costs are calculated at checkout based on the weight of your order and your delivery address. We offer free shipping on orders over ₹5,000 to most regions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-4 uppercase tracking-wider">
                            <Globe size={20} className="text-teal-500" />
                            Delivery Areas
                        </h2>
                        <p>
                            Currently, FarmEasy delivers to all major cities and agricultural regions across the country. If you are in a remote area, delivery might take slightly longer, and additional charges might apply.
                        </p>
                    </section>

                    <section className="bg-teal-50/50 rounded-2xl p-6 border border-teal-100">
                        <p className="text-sm font-semibold text-teal-800">
                            Our team works closely with verified logistics partners to ensure your agricultural supplies reach you in perfect condition. For any shipping inquiries, please visit our support page.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicy;
