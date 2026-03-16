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
app.use(cors());              // allows frontend (localhost:5173) to call our API
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


// Use routes
app.use("/seller", sellerRoutes);
app.use("/api/authentication", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/admin", adminRoutes);


// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Backend running successfully...");
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("🔐 JWT Secret Loaded:", process.env.JWT_SECRET ? "YES" : "NO");
});