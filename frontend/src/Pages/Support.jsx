import React from "react";
import SupportImg from "../components/../assets/Fartilizers1.png";

const Support = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Support</h1>
          <p className="mt-2 text-gray-600">Help articles, troubleshooting guides and product manuals.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <img src={SupportImg} alt="support" className="rounded-2xl shadow-md w-full object-cover h-64" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Getting Started</h2>
            <p className="text-gray-600 mt-3">Learn how to order, track shipments, and manage returns. Our guides walk you through creating an account, selecting products, and placing your first order.</p>

            <h3 className="mt-6 text-lg font-semibold text-gray-800">Product Manuals & Equipment Support</h3>
            <p className="text-gray-600 mt-2">Find setup guides and maintenance tips for sprayers, pumps, tillers and other farm equipment. We also include safety and warranty information.</p>

            <ul className="mt-4 list-disc list-inside text-gray-700 space-y-1">
              <li>How to choose the right fertilizer and quantity</li>
              <li>Battery sprayer setup & troubleshooting</li>
              <li>Drip irrigation: installation basics</li>
            </ul>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800">Frequently Asked Questions</h3>
          <div className="mt-4 space-y-3 text-gray-700">
            <details className="bg-gray-50 p-3 rounded">
              <summary className="cursor-pointer font-semibold">How do I return an item?</summary>
              <p className="mt-2">Open a return request from your orders page within 14 days of delivery. Pack the item in original packaging and follow the return instructions.</p>
            </details>

            <details className="bg-gray-50 p-3 rounded">
              <summary className="cursor-pointer font-semibold">Do you provide equipment manuals?</summary>
              <p className="mt-2">Yes — product pages include PDF manuals when available. Contact support if you need a copy.</p>
            </details>

            <details className="bg-gray-50 p-3 rounded">
              <summary className="cursor-pointer font-semibold">What payment methods are accepted?</summary>
              <p className="mt-2">We accept UPI, netbanking, debit/credit cards and cash on delivery in select areas.</p>
            </details>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Support;
