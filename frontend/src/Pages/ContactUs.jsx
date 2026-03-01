import React from "react";
import MapImg from "../assets/Seeds.png";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Contact Us</h1>
          <p className="mt-2 text-gray-600">We're available to answer your questions and help with orders.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold">Reach our team</h2>
            <p className="text-gray-600 mt-2">Call, email, or visit us — we respond quickly during business hours.</p>

            <ul className="mt-4 space-y-3 text-gray-700">
              <li><strong>Phone:</strong> <a href="tel:+917767859953" className="text-green-600">+91 77678 59953</a></li>
              <li><strong>Email:</strong> <a href="mailto:farmeasy003@gmail.com" className="text-green-600">farmeasy003@gmail.com</a></li>
              <li><strong>Working hours:</strong> Mon–Sat 9:00–18:00</li>
            </ul>

            <h3 className="mt-6 font-semibold">Send us a message</h3>
            <form className="mt-3 space-y-3">
              <input type="text" placeholder="Your name" className="w-full border rounded-xl px-4 py-2" />
              <input type="email" placeholder="Your email" className="w-full border rounded-xl px-4 py-2" />
              <textarea placeholder="How can we help?" className="w-full border rounded-xl px-4 py-2 h-28" />
              <button type="submit" className="bg-emerald-600 text-white px-5 py-2 rounded-xl">Send Message</button>
            </form>
          </div>

          <div>
            <img src={MapImg} alt="map" className="rounded-2xl shadow-md w-full h-64 object-cover" />
            <p className="text-gray-600 mt-3">Visit us at 128, Farm Road, Pune — we welcome farmers and vendors for meetings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
