// ===========================================================================
// FarmEasy Backend - Main Entry Point (server.js)
// ===========================================================================
// 
// HOW THE BACKEND WORKS:
// 1. This file sets up Express, loads env vars, registers all middleware
// 2. Each route file handles a different feature (auth, products, vendor, etc.)
// 3. Routes that need login protection use the `verifyToken` middleware
//    which checks the JWT token from the Authorization header
// 4. Controllers talk to MySQL through the db.js pool
// 5. Multer middleware handles file uploads (product images, profile pics)
//    and saves them to /backend/uploads/ folder
// 6. The /uploads route serves those saved images as static files
//
// REQUEST FLOW EXAMPLE (vendor adds a product with image):
//   Frontend sends POST /api/vendor/products with FormData (fields + image file)
//   -> Express parses it
//   -> verifyToken middleware checks JWT, puts user info in req.user
//   -> multer middleware saves the image file to /uploads/
//   -> vendorController.addProduct reads req.body for text, req.file for image
//   -> saves to MySQL product table
//   -> responds with success
//   -> frontend shows the image via http://localhost:5000/uploads/filename.jpg
// ===========================================================================

require("dotenv").config();   // loads .env variables (DB credentials, JWT secret)

const express = require("express");
const cors = require("cors");

const app = express();

// ================= MIDDLEWARE =================
// CORS configuration for production
const corsOptions = {
  origin: [
    "https://farmeasy-one.vercel.app",  // Vercel frontend
    "http://localhost:5173",             // Local dev frontend
    "http://localhost:5000"              // Local dev backend
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));              // CORS with specific origins
app.use(express.json());      // parses JSON request bodies

// Images are now stored on Cloudinary — no local /uploads directory needed

// ================= ROUTES =================
// each route file handles one area of the app
// the URL prefix here + the path inside the route file = the full endpoint
// e.g. "/api/vendor" + "/products" = "/api/vendor/products"
const sellerRoutes = require("./routes/seller");          // seller registration (aadhaar, pan, gst)
const authRoutes = require("./routes/authRoutes");        // login & register for all users
const profileRoutes = require("./routes/profileRoutes");  // basic user profile (not vendor-specific)
const categoryRoutes = require("./routes/categoryRoutes");// product categories dropdown data
const productRoutes = require("./routes/productRoutes");  // public product listing, search, filters
const vendorRoutes = require("./routes/vendorRoutes");    // vendor dashboard, products CRUD, profile
const wishlistRoutes = require("./routes/wishlistRoutes");// save/remove products to wishlist
const cartRoutes = require("./routes/cartRoutes");        // add/remove/update cart items
const orderRoutes = require("./routes/orderRoutes");      // place orders, order history
const passwordRoutes = require("./routes/passwordRoutes"); // forgot/reset password (link & otp)
const adminRoutes = require("./routes/adminRoutes");
const translationRoutes = require("./routes/translationRoutes"); // Google Translate API
const exchangeRoutes = require("./routes/exchangeRoutes"); // crop exchange between farmers
const deliveryRoutes = require("./routes/deliveryRoutes");  // GPS delivery tracking system
const reviewRoutes = require("./routes/reviewRoutes");  // Product and vendor reviews/ratings
const newsletterRoutes = require("./routes/newsletterRoutes"); // Newsletter subscription


// Use routes
app.use("/seller", sellerRoutes);
app.use("/api/authentication", authRoutes);
app.use("/api/translations", translationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/exchange", exchangeRoutes); // Crop exchange marketplace
app.use("/api/delivery", deliveryRoutes); // GPS-based home delivery tracking
app.use("/api/reviews", reviewRoutes); // Product and vendor reviews
app.use("/api/newsletter", newsletterRoutes); // Newsletter subscriptions


// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Backend running successfully...");
});

// Database health check endpoint
app.get("/health", async (req, res) => {
  try {
    const db = require("./config/db");
    const connection = await db.getConnection();
    connection.release();
    
    res.json({
      status: "OK",
      message: "✅ Backend and database connection working",
      timestamp: new Date().toISOString(),
      env: {
        DB_HOST: process.env.DB_HOST ? "SET" : "MISSING",
        DB_NAME: process.env.DB_NAME ? "SET" : "MISSING",
        NODE_ENV: process.env.NODE_ENV || "development"
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "❌ Database connection failed",
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  }
});

// ================= ERROR HANDLING MIDDLEWARE =================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

// Verify environment variables
console.log("\n📋 Environment Variables Check:");
console.log("✓ DB_HOST:", process.env.DB_HOST ? "SET" : "❌ MISSING");
console.log("✓ DB_USER:", process.env.DB_USER ? "SET" : "❌ MISSING");
console.log("✓ DB_PASSWORD:", process.env.DB_PASSWORD ? "SET" : "❌ MISSING");
console.log("✓ DB_NAME:", process.env.DB_NAME ? "SET" : "❌ MISSING");
console.log("✓ DB_PORT:", process.env.DB_PORT ? "SET" : "❌ MISSING");
console.log("✓ JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "❌ MISSING");

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log("🌍 CORS enabled for: https://farmeasy-one.vercel.app");
});