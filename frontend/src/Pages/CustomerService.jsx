import React from "react";
import { FiMail, FiPhoneCall, FiMapPin, FiInfo, FiTool, FiStar } from "react-icons/fi";

const CustomerService = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Customer Services</h1>
          <p className="mt-2 text-gray-600">
            We're here to help you with anything related to FarmEasy.
          </p>
        </header>

        {/* Support Section */}
        <section id="support" className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiTool /> Support
          </h2>
          <p className="text-gray-600 mt-3">
            Need assistance placing an order or navigating the site? Our support
            team is available 7 days a week.
          </p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <FiMail className="text-green-600" /> Email us at{' '}
              <a href="mailto:farmeasy003@gmail.com" className="text-green-600 hover:underline">
                farmeasy003@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FiPhoneCall className="text-green-600" /> Call us: {' '}
              <a href="tel:+917767859953" className="text-green-600 hover:underline">
                +91 77678 59953
              </a>
            </li>
          </ul>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiMapPin /> Contact Us
          </h2>
          <p className="text-gray-600 mt-3">
            Visit our office or send us mail at:
          </p>
          <address className="not-italic text-gray-700 mt-2">
            128, Farm Road<br />Pune, Maharashtra 411007<br />India
          </address>
        </section>

        {/* About Section */}
        <section id="about" className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiInfo /> About Us
          </h2>
          <p className="text-gray-600 mt-3">
            FarmEasy is an agricultural marketplace dedicated to providing
            farmers and agribusinesses with high-quality products, tools, and
            support. Founded in 2024 in Pune, we strive to make modern farming
            accessible to everyone.
          </p>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiStar /> Features
          </h2>
          <ul className="mt-3 list-disc list-inside text-gray-700 space-y-1">
            <li>Verified vendors delivering nationwide.</li>
            <li>Wide range of fertilizers, seeds, equipment and tools.</li>
            <li>Secure payments and easy returns.</li>
            <li>Real-time order tracking and customer support.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default CustomerService;
