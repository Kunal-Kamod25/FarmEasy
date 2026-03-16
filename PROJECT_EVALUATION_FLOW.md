# FarmEasy Project Flow (Evaluation Notes)

## 1. Architecture Overview
- Frontend: React + Vite (SPA)
- Backend: Node.js + Express REST API
- Database: MySQL (Aiven)
- Authentication: JWT (Bearer token)
- File Uploads: Multer (`product_image`, `profile_image`)
- Deployment: Frontend on Vercel, Backend on Render

## 2. Where APIs Live
- Main backend bootstrap and route mounting: `backend/server.js`
- API route definitions: `backend/routes/*.js`
- Business logic (SQL + validation): `backend/controllers/*.js`
- DB pool config: `backend/config/db.js`
- JWT middleware: `backend/middleware/auth.js`

## 3. API Base URL in Frontend
- Config file: `frontend/src/config.js`
- Reads `VITE_API_URL` and exports `API_URL`
- All axios/fetch calls use this base URL

## 4. Backend Route Mounting
From `backend/server.js`:
- `/seller` -> seller routes
- `/api/authentication` -> auth routes
- `/api/profile` -> profile routes
- `/api/categories` -> category routes
- `/api/products` -> product routes (public)
- `/api/vendor` -> vendor routes (protected)
- `/api/wishlist` -> wishlist routes (protected)
- `/api/cart` -> cart routes (protected)
- `/api/orders` -> order routes (protected)
- `/api/password` -> forgot/reset password routes

## 5. Complete API List (35 Total) with Location

### Auth (`backend/routes/authRoutes.js`)
- `POST /api/authentication/register` -> `registerController.register`
- `POST /api/authentication/login` -> `loginController.login`

### Profile (`backend/routes/profileRoutes.js`)
- `PUT /api/profile/update` -> `profileController.updateProfile`
- `GET /api/profile/:userId` -> `profileController.getProfile`

### Category (`backend/routes/categoryRoutes.js`)
- `GET /api/categories` -> inline query in route file
- `GET /api/categories/:id/subcategories` -> inline query in route file

### Product (`backend/routes/productRoutes.js`)
- `GET /api/products/all` -> inline query in route file
- `GET /api/products/:id` -> inline query in route file
- `GET /api/products/category/:id` -> inline query in route file
- `GET /api/products/meta/types` -> inline query in route file
- `GET /api/products/meta/sellers` -> inline query in route file

### Vendor (`backend/routes/vendorRoutes.js`)
- `GET /api/vendor/products` -> `vendorController.getProducts`
- `GET /api/vendor/products/:id` -> `vendorController.getProduct`
- `POST /api/vendor/products` -> `vendorController.addProduct`
- `DELETE /api/vendor/products/:id` -> `vendorController.deleteProduct`
- `PUT /api/vendor/products/:id` -> `vendorController.updateProduct`
- `GET /api/vendor/dashboard` -> `vendorController.getDashboardStats`
- `GET /api/vendor/profile` -> `vendorController.getProfile`
- `PUT /api/vendor/profile` -> `vendorController.updateProfile`
- `GET /api/vendor/my-purchases` -> `vendorController.getMyPurchases`

### Wishlist (`backend/routes/wishlistRoutes.js`)
- `POST /api/wishlist` -> `wishlistController.toggleWishlist`
- `GET /api/wishlist` -> `wishlistController.getWishlist`

### Cart (`backend/routes/cartRoutes.js`)
- `GET /api/cart` -> `cartController.getCart`
- `POST /api/cart` -> `cartController.addToCart`
- `PUT /api/cart/:productId` -> `cartController.updateCartItem`
- `DELETE /api/cart/:productId` -> `cartController.removeFromCart`
- `DELETE /api/cart` -> `cartController.clearCart`

### Orders (`backend/routes/orderRoutes.js`)
- `POST /api/orders` -> inline transaction handler in route file
- `GET /api/orders/user/:userId` -> inline query + grouping in route file

### Password (`backend/routes/passwordRoutes.js`)
- `POST /api/password/forgot-password` -> `passwordController.forgotPassword`
- `POST /api/password/verify-otp` -> `passwordController.verifyOTP`
- `POST /api/password/reset-password` -> `passwordController.resetPassword`

### Seller (`backend/routes/seller.js`)
- `POST /seller` -> inline query in route file
- `GET /seller` -> inline query in route file
- `GET /seller/user/:user_id` -> inline query in route file

## 6. Postman / Thunder Client Script Pack

Use these scripts to test all APIs faster.

### A) Login Tests Script (Postman Tests tab)
```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Login response has token", function () {
  const body = pm.response.json();
  pm.expect(body).to.have.property("token");
  pm.expect(body.token).to.be.a("string").and.not.empty;
});

pm.test("Save token and userId", function () {
  const body = pm.response.json();
  pm.environment.set("token", body.token);
  pm.environment.set("userId", body.user?.id || "");
});
```

### B) Collection Pre-request Script (Postman Pre-request tab)
```javascript
const token = pm.environment.get("token");

if (token) {
  pm.request.headers.upsert({ key: "Authorization", value: `Bearer ${token}` });
}
```

### C) Generic Protected API Tests Script (Postman Tests tab)
```javascript
pm.test("Status is success", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Response time is acceptable", function () {
  pm.expect(pm.response.responseTime).to.be.below(3000);
});

pm.test("Response is valid JSON when expected", function () {
  const contentType = pm.response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    pm.expect(() => pm.response.json()).to.not.throw();
  }
});
```

### D) Thunder Client Auth Setup
- Login once and copy `token` from response.
- Open any protected API request.
- Go to `Auth` -> `Bearer`.
- Paste token (or set global env variable and use it in header):
  - `Authorization: Bearer {{token}}`

## 7. Database Integration Flow
- DB connection pool is created in `backend/config/db.js` using env vars (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`) with SSL settings for Aiven.
- Controllers call SQL via `db.query(...)` or transactions with `getConnection()` + `beginTransaction()`.
- Example transaction (`backend/routes/orderRoutes.js`):
  1. Insert order into `orders`
  2. Insert rows into `order_items`
  3. Clear `cart`
  4. Insert `tracking` and `payment`
  5. `commit` or `rollback` on failure

## 8. Main Database Tables (schema.sql)
- `users` (login identity, role)
- `seller` (vendor profile linked to users)
- `product` (vendor products, category, quantity, price, image)
- `product_category`
- `cart`
- `wishlist`
- `orders`
- `order_items`
- `payment`
- `tracking`
- `review_rating`

## 9. JWT Security Flow
1. Login API validates credentials and signs JWT (`id`, `role`) in `backend/controllers/loginController.js`.
2. Frontend stores token in localStorage.
3. Protected requests send `Authorization: Bearer <token>`.
4. Middleware `backend/middleware/auth.js` verifies token and attaches `req.user`.
5. Controllers use `req.user.id` for user/vendor scoping.

## 10. Frontend Integration Flow
- Route structure is defined in `frontend/src/routes/AppRoutes.jsx`.
- Public user flows: home, products, product details, support pages.
- Protected vendor area under `/vendor` with nested routes:
  - `/vendor` (dashboard)
  - `/vendor/products`
  - `/vendor/add-product`
  - `/vendor/products/edit/:id`
- Context-based state examples:
  - `frontend/src/context/CartContext.jsx` -> guest cart via localStorage + logged-in cart via API.
  - Wishlist context does similar token-aware behavior.

## 11. End-to-End User Flows

### A) Customer Order Flow
1. User logs in (`/api/authentication/login`)
2. Browse products (`/api/products/all`)
3. Add to cart (`/api/cart`)
4. Place order (`POST /api/orders`)
5. Cart cleared + tracking/payment rows created

### B) Vendor Product Flow
1. Vendor logs in
2. Opens vendor panel (`/vendor`)
3. Adds product (`POST /api/vendor/products` with `product_image`)
4. Product appears in vendor list and public listings
5. Vendor edits product (`PUT /api/vendor/products/:id`) with optional new image

## 12. Image Upload Persistence Note (Important)
- Current implementation stores images on Cloudinary (not local `/uploads` in production).
- Product/profile image fields store Cloudinary URL in DB.
- Benefit: images persist across Render restarts/redeploys.
- Requirement: keep Cloudinary env vars configured in backend service.

## 13. Quick Viva Summary (30 seconds)
FarmEasy is a React + Express + MySQL marketplace where public users browse products and authenticated users manage cart, wishlist, and orders. Vendors access protected `/api/vendor/*` APIs to manage products and profile. JWT middleware secures protected routes. MySQL transactions are used in order placement to keep data consistent across orders, items, tracking, and payment. Frontend uses a single API base URL config and context-driven state for cart/wishlist. Images are stored on Cloudinary, so image links remain stable across server restarts.
