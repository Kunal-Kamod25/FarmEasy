import React from "react";
import AboutImg from "../assets/MainPage.png";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">About FarmEasy</h1>
          <p className="mt-2 text-gray-600">A short history of our mission to serve farmers across India.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Our Mission</h2>
            <p className="text-gray-600 mt-3">To provide affordable, quality agricultural inputs and modern equipment to small and medium farmers, helping them increase yields and income.</p>

            <h3 className="mt-6 text-lg font-semibold">What we offer</h3>
            <ul className="mt-3 list-disc list-inside text-gray-700 space-y-1">
              <li>Certified seeds and high-grade fertilizers</li>
              <li>Reliable irrigation and spraying equipment</li>
              <li>Training materials and support for best practices</li>
            </ul>
          </div>

          <img src={AboutImg} alt="about" className="rounded-2xl shadow-md w-full object-cover h-64" />
        </div>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold">Why farmers choose us</h3>
          <p className="text-gray-600 mt-3">We partner with trusted brands and local vendors, verify products, and focus on delivering value and after‑sales support.</p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
