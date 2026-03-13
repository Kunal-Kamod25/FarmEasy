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
- `/api/authentication` -> auth routes
- `/api/profile` -> profile routes
- `/api/categories` -> category routes
- `/api/products` -> product routes (public)
- `/api/vendor` -> vendor routes (protected)
- `/api/wishlist` -> wishlist routes (protected)
- `/api/cart` -> cart routes (protected)
- `/api/orders` -> order routes (protected)
- `/api/password` -> forgot/reset password routes
- `/uploads` -> static file serving for uploaded images

## 5. Core API Map

### Auth
- `POST /api/authentication/register`
- `POST /api/authentication/login`

### Products (Public)
- `GET /api/products/all`
- `GET /api/products/:id`
- `GET /api/products/category/:id`
- `GET /api/products/meta/types`
- `GET /api/products/meta/sellers`

### Vendor (Protected)
- `GET /api/vendor/dashboard`
- `GET /api/vendor/products`
- `GET /api/vendor/products/:id`
- `POST /api/vendor/products` (multipart, image upload)
- `PUT /api/vendor/products/:id` (multipart, optional image replacement)
- `DELETE /api/vendor/products/:id`
- `GET /api/vendor/profile`
- `PUT /api/vendor/profile` (optional profile image)
- `GET /api/vendor/my-purchases`

### Cart (Protected)
- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:productId`
- `DELETE /api/cart/:productId`
- `DELETE /api/cart`

### Wishlist (Protected)
- `GET /api/wishlist`
- `POST /api/wishlist` (toggle behavior)

### Orders (Protected)
- `POST /api/orders`
- `GET /api/orders/user/:userId`

### Password Recovery
- `POST /api/password/forgot-password`
- `POST /api/password/verify-otp`
- `POST /api/password/reset-password`

## 6. Database Integration Flow
- DB connection pool is created in `backend/config/db.js` using env vars (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`) with SSL settings for Aiven.
- Controllers call SQL via `db.query(...)` or transactions with `getConnection()` + `beginTransaction()`.
- Example transaction (`backend/routes/orderRoutes.js`):
  1. Insert order into `orders`
  2. Insert rows into `order_items`
  3. Clear `cart`
  4. Insert `tracking` and `payment`
  5. `commit` or `rollback` on failure

## 7. Main Database Tables (schema.sql)
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

## 8. JWT Security Flow
1. Login API validates credentials and signs JWT (`id`, `role`) in `backend/controllers/loginController.js`.
2. Frontend stores token in localStorage.
3. Protected requests send `Authorization: Bearer <token>`.
4. Middleware `backend/middleware/auth.js` verifies token and attaches `req.user`.
5. Controllers use `req.user.id` for user/vendor scoping.

## 9. Frontend Integration Flow
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

## 10. End-to-End User Flows

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

## 11. Image Upload Persistence Note (Important)
- Problem: images disappear after some time if server disk is ephemeral.
- Cause: DB keeps image path, but physical files in `/uploads` may be removed after restart/redeploy.
- Current fix in code: backend supports configurable upload directory via `UPLOAD_DIR`.
- Production requirement on Render:
  - Attach persistent disk (mount path `/var/data`)
  - Set env var: `UPLOAD_DIR=/var/data/uploads`
- Already missing files must be re-uploaded once.

## 12. Quick Viva Summary (30 seconds)
FarmEasy is a React + Express + MySQL marketplace where public users browse products and authenticated users manage cart, wishlist, and orders. Vendors access protected `/api/vendor/*` APIs to manage products and profile. JWT middleware secures protected routes. MySQL transactions are used in order placement to keep data consistent across orders, items, tracking, and payment. Frontend uses a single API base URL config and context-driven state for cart/wishlist. Images are uploaded with Multer and served via `/uploads`, with persistent disk required in production to prevent image loss.
