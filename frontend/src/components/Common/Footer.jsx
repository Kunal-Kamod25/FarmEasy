import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import logo from "../../assets/Logo.png";
import { FiMail, FiPhoneCall } from "react-icons/fi";
import { useLanguage } from "../../context/language/LanguageContext";
import { API_URL } from "../../config";

const Footer = () => {
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [newsletterMessage, setNewsletterMessage] = useState("");
    const [newsletterError, setNewsletterError] = useState(false);
    const subject = t("topbar.orderInquirySubject");
    const body = t("topbar.orderInquiryBody");

    const mailtoLink = `mailto:farmeasy003@gmail.com?subject=${encodeURIComponent(
        subject
    )}&body=${encodeURIComponent(body)}`;

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        try {
            setSubmitting(true);
            setNewsletterMessage("");
            setNewsletterError(false);

            const res = await axios.post(`${API_URL}/api/newsletter/subscribe`, {
                email: email.trim(),
            });

            setNewsletterMessage(res.data?.message || "Subscribed successfully.");
            setEmail("");
        } catch (error) {
            setNewsletterError(true);
            setNewsletterMessage(
                error?.response?.data?.message || "Unable to subscribe right now. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-950">
            <footer className="border-t border-gray-800 py-10">

                {/* Logo */}
                <div className="container mx-auto px-4 lg:px-10 mb-0.1">
                    <Link to="/">
                        <img
                            src={logo}
                            alt="FarmEasy Logo"
                            className="h-16 md:h-25 object-contain"
                        />
                    </Link>
                </div>

                {/* Main Grid */}
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-4 lg:px-10">

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">
                            {t("footer.newsletter")}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                            {t("footer.newsletter.line1")}
                            {" "}
                            {t("footer.newsletter.line2")}
                        </p>
                        <p className="text-gray-400 text-sm mb-5">
                            {t("footer.newsletter.line3")}
                        </p>

                        <form className="flex" onSubmit={handleNewsletterSubmit}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("footer.newsletter.placeholder")}
                                required
                                className="p-3 w-full text-sm bg-gray-900 text-white border border-gray-700 rounded-l-md 
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-green-600 text-white font-semibold px-6 py-3 text-sm rounded-r-md 
                hover:bg-green-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Subscribing..." : t("footer.newsletter.subscribe")}
                            </button>
                        </form>
                        {newsletterMessage && (
                            <p className={`mt-3 text-xs ${newsletterError ? "text-red-400" : "text-green-400"}`}>
                                {newsletterMessage}
                            </p>
                        )}
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">
                            {t("footer.shop")}
                        </h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li>
                                <Link to="#" className="hover:text-green-400 transition-colors">
                                    {t("footer.shop.fertilizers")}
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-green-400 transition-colors">
                                    {t("footer.shop.seeds")}
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-green-400 transition-colors">
                                    {t("footer.shop.equipment")}
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-green-400 transition-colors">
                                    {t("footer.shop.irrigation")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Services */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">
                            {t("footer.customerServices")}
                        </h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li>
                                <Link to="/support" className="hover:text-green-400 transition-colors">
                                    {t("footer.support")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-green-400 transition-colors">
                                    {t("footer.contactUs")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-green-400 transition-colors">
                                    {t("footer.aboutUs")}
                                </Link>
                            </li>
                            <li>
                                <Link to="/support" className="hover:text-green-400 transition-colors">
                                    {t("footer.features")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">
                            {t("footer.contactUs")}
                        </h3>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li>
                                <Link
                                    to="#"
                                    className="hover:text-green-400 transition-colors"
                                >
                                    128, Farm Road, Pune, Maharashtra, 411007
                                </Link>
                            </li>

                            <li>
                                <a
                                    href="tel:+917767859953"
                                    className="inline-flex items-center hover:text-green-400 transition-colors"
                                >
                                    <FiPhoneCall className="mr-2" />
                                    +91 7767859953
                                </a>
                            </li>

                            <li>
                                <a
                                    href={mailtoLink}
                                    className="inline-flex items-center hover:text-green-400 transition-colors"
                                >
                                    <FiMail className="mr-2" />
                                    farmeasy003@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="container mx-auto mt-12 px-4 lg:px-10 border-t border-gray-800 pt-6 text-center">

                    {/* Policy Links */}
                    <div className="flex justify-center space-x-6 mb-4 text-gray-400 text-sm">
                        <a href="#" className="hover:text-green-400 transition-colors">
                            {t("footer.privacy")}
                        </a>
                        <a href="#" className="hover:text-green-400 transition-colors">
                            {t("footer.terms")}
                        </a>
                        <a href="#" className="hover:text-green-400 transition-colors">
                            {t("footer.shipping")}
                        </a>
                    </div>

                    <p className="text-gray-500 text-sm">
                        © 2026 FarmEasy Agro Private Limited. {t("footer.rights")}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Footer;