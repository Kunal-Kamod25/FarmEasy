const { Translate } = require("@google-cloud/translate").v2;

// Initialize Google Translate (uses GOOGLE_APPLICATION_CREDENTIALS from .env)
const translate = new Translate({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CREDENTIALS_FILE,
});

// English strings that need translation (all UI keys)
const ENGLISH_STRINGS = {
  // Common
  "common.language": "Language",
  "common.loading": "Loading page...",

  // Topbar
  "topbar.title": "FarmEasy-Agricultural Marketplace",
  "topbar.orderInquirySubject": "Order Inquiry",

  // Navigation
  "nav.signup": "Signup",
  "nav.login": "Login",
  "nav.greeting": "Hi, {name}",

  // Login
  "login.joinTitle": "Join FarmEasy",
  "login.marketplaceSubtitle": "India's trusted agricultural marketplace for customers and vendors.",
  "login.welcome": "Welcome",
  "login.subtitle": "Log in to your account",
  "login.email": "Email",
  "login.password": "Password",
  "login.loginButton": "Log In",
  "login.noAccount": "Don't have an account?",
  "login.signUp": "Sign Up",

  // Checkout
  "checkout.pageTitle": "CheckOut",
  "checkout.orderSummary": "Order Summary",
  "checkout.shippingAddress": "Shipping Address",
  "checkout.fullName": "Full Name",
  "checkout.phone": "Phone Number",
  "checkout.address": "Address",
  "checkout.city": "City",
  "checkout.state": "State",
  "checkout.pincode": "Pincode",
  "checkout.paymentDetails": "Payment Details",
  "checkout.paymentMethod": "Payment Method",
  "checkout.paymentCOD": "Cash on Delivery (COD)",
  "checkout.paymentOnline": "Pay Online via Razorpay",
  "checkout.placeOrder": "Place Order",
  "checkout.processingOrder": "Processing Order...",
  "checkout.finalizing": "Finalizing Payment...",
  "checkout.openingPayment": "Opening secure payment...",

  // Cart
  "cart.removeItem": "Remove Item",
  "cart.yourCart": "Your Cart",
  "cart.proceedToCheckout": "Proceed to Checkout",
  "cart.checkoutNote": "Selected shipping address will be shown here",

  // About
  "about.pageTitle": "About Us",
  "about.tagline": "Revolutionizing Agriculture in India",
  "about.missionTitle": "Our Mission",
  "about.missionText": "We aim to bridge the gap between farmers and modern agricultural technology, providing quality tools and knowledge to improve crop yield and sustainability.",

  // Contact
  "contact.pageTitle": "Contact Us",
  "contact.formName": "Your Name",
  "contact.formEmail": "Your Email",
  "contact.formMessage": "Your Message",
  "contact.sendButton": "Send Message",
  "contact.phone": "Phone: +91-1800-FARM-EASY",
  "contact.email": "Email: support@farmeasy.com",

  // Support
  "support.pageTitle": "Support & Help",
  "support.faqTitle": "Frequently Asked Questions",
  "support.faq1Question": "How do I return a product?",
  "support.faq1Answer": "Products can be returned within 14 days of delivery.",
};

/**
 * Translate all UI strings to a target language using Google Translate API
 * GET /api/translate/:languageCode
 */
exports.getTranslations = async (req, res) => {
  try {
    const { languageCode } = req.params;

    // Validate language code (ISO 639-1)
    if (!languageCode || languageCode.length < 2) {
      return res.status(400).json({ error: "Invalid language code" });
    }

    // Get all English values
    const englishValues = Object.values(ENGLISH_STRINGS);

    // Translate using Google Translate API
    const [translations] = await translate.translate(englishValues, languageCode);

    // Map translated values back to keys
    const translatedStrings = {};
    const keys = Object.keys(ENGLISH_STRINGS);
    
    keys.forEach((key, index) => {
      translatedStrings[key] = translations[index];
    });

    res.json({
      language: languageCode,
      translations: translatedStrings,
    });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Failed to translate strings" });
  }
};

/**
 * Get list of all supported language codes
 * GET /api/translate/languages
 */
exports.getSupportedLanguages = async (req, res) => {
  try {
    const languages = await translate.getLanguages();
    res.json({ languages });
  } catch (error) {
    console.error("Language list error:", error);
    res.status(500).json({ error: "Failed to get languages" });
  }
};
