# 🌱 FarmEasy - Project Evaluation Study Guide
**Preparation Guide for May 9, 2026 Final Project Evaluation**

---

## 📋 Quick Overview

**Project Name:** FarmEasy  
**Type:** B2C (Business to Customer) E-commerce Platform  
**Purpose:** Direct farmer-to-company marketplace for agricultural products  
**Tech Stack:** React (Frontend) + Node.js/Express (Backend) + MySQL (Database)  
**Server:** Running on Node.js with Express framework  

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite)                    │
│   - User Dashboard, Vendor Dashboard, Product Pages    │
│   - Shopping Cart, Wishlist, Orders, Profile           │
└──────────────────┬──────────────────────────────────────┘
                   │ API Calls (Axios)
                   │ JWT Authentication
┌──────────────────▼──────────────────────────────────────┐
│         BACKEND (Node.js + Express)                     │
│   - Express Server running on Port (typically 5000)     │
│   - Route Handlers → Controllers → Database Queries     │
│   - AWS S3 for Image Storage                            │
│   - Nodemailer for Email Notifications                  │
└──────────────────┬──────────────────────────────────────┘
                   │ SQL Queries
                   │
┌──────────────────▼──────────────────────────────────────┐
│        DATABASE (MySQL - farmeasy)                      │
│   - 13+ Tables with Foreign Key Relationships           │
│   - Stores: Users, Products, Orders, Reviews, etc.      │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema - Complete Tables

### **1. USERS Table** ⭐ (Core User Data)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),      -- Hashed with bcrypt
  role VARCHAR(50) DEFAULT 'user', -- 'user', 'vendor', 'admin', 'farmer'
  phone_number VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  bio TEXT,
  profile_pic VARCHAR(255),        -- S3 URL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**What this does:** Stores all user accounts (customers, vendors, farmers)

---

### **2. SELLER Table** 🏪 (Vendor/Shop Details)
```sql
CREATE TABLE seller (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,           -- Links to users.id
  shop_name VARCHAR(255),         -- Company/shop name
  gst_no VARCHAR(20),            -- GST number for vendor
  created_at TIMESTAMP
);
```
**What this does:** Additional vendor-specific information (links to users table)  
**Key relationship:** `user_id` → `users.id` (One user can be one seller)

---

### **3. PRODUCT Table** 📦 (Product Listing)
```sql
CREATE TABLE product (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_name VARCHAR(255),
  product_description TEXT,
  product_type VARCHAR(100),       -- Type of product
  product_image VARCHAR(500),      -- S3 URL to image
  product_quantity INT DEFAULT 0,  -- Stock available
  price DECIMAL(10,2),            -- Product price
  seller_id INT NOT NULL,         -- Which vendor selling it
  category_id INT,                -- Product category
  created_at TIMESTAMP
);
```
**What this does:** All products listed on platform  
**Key relationships:** 
- `seller_id` → `seller.id` (vendor who listed product)
- `category_id` → `product_category.id`

---

### **4. PRODUCT_CATEGORY & PRODUCT_SUBCATEGORY** 🏷️
```sql
CREATE TABLE product_category (
  id INT PRIMARY KEY,
  product_cat_name VARCHAR(255)  -- e.g., "Seeds", "Fertilizers"
);

CREATE TABLE product_subcategory (
  id INT PRIMARY KEY,
  subcategory_name VARCHAR(255), -- e.g., "Vegetable Seeds"
  category_id INT                -- Links to product_category
);
```
**What this does:** Hierarchical category system  
**Example:** 
- Category: "Seeds" (parent)
  - Subcategory: "Vegetable Seeds", "Flower Seeds" (children)

---

### **5. ORDERS & ORDER_ITEMS** 📋 (Purchase History)
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,          -- Who placed order
  order_date TIMESTAMP,
  order_status VARCHAR(100) DEFAULT 'Pending',  -- Pending, Confirmed, Shipped, Delivered, Cancelled
  total_price DECIMAL(10,2)
);

CREATE TABLE order_items (
  id INT PRIMARY KEY,
  order_id INT NOT NULL,         -- Which order
  product_id INT NOT NULL,       -- Which product
  quantity INT,                  -- How many ordered
  price DECIMAL(10,2)            -- Price at purchase time
);
```
**What this does:** Tracks customer orders and items in each order  
**Key relationship:**
- `orders.id` ← `order_items.order_id` (One order has many items)
- `order_items.product_id` → `product.id`

---

### **6. CART & WISHLIST** ❤️ (Shopping Features)
```sql
CREATE TABLE cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  UNIQUE KEY (user_id, product_id)  -- One product per user max
);

CREATE TABLE wishlist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  UNIQUE KEY (user_id, product_id)
);
```
**What this does:** Temporary storage for shopping cart & saved items

---

### **7. PAYMENT** 💳 (Payment Tracking)
```sql
CREATE TABLE payment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  payment_method VARCHAR(100) DEFAULT 'COD',  -- Cash On Delivery
  amount DECIMAL(10,2),
  payment_date TIMESTAMP,
  status VARCHAR(100) DEFAULT 'Pending'
);
```
**What this does:** Tracks payment information for each order

---

### **8. REVIEW_RATING** ⭐ (Product Reviews)
```sql
CREATE TABLE review_rating (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  created_at TIMESTAMP
);
```
**What this does:** Customer reviews and ratings for products

---

### **9. TRACKING** 📍 (Delivery Tracking)
```sql
CREATE TABLE tracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  status VARCHAR(255),           -- Location/status of delivery
  user_id INT,
  user_name VARCHAR(255),
  user_address TEXT,
  updated_at TIMESTAMP
);
```
**What this does:** GPS tracking for order deliveries

---

### **10. FARMER Table** 🚜 (Farmer Details)
```sql
CREATE TABLE farmer (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  farmer_name VARCHAR(255),
  farmer_address TEXT,
  farmer_email VARCHAR(255),
  farmer_phone VARCHAR(20),
  created_at TIMESTAMP
);
```
**What this does:** Additional info for farmer users

---

## 🔄 Complete Data Flow - How Data Moves from Database to Frontend

### **Scenario: Customer Browsing Products**

```
STEP 1: Frontend Requests Products
────────────────────────────────────
User clicks "Browse Products" on website
  ↓
React component makes API call:
GET /api/products/all
  ↓

STEP 2: Express Backend Receives Request
───────────────────────────────────────
server.js routes it to productRoutes.js
productRoutes.js calls productController.getAllProducts()
  ↓

STEP 3: Database Query Executes
────────────────────────────────
productController executes SQL:
SELECT p.id, p.product_name, p.price, p.product_image, 
       p.seller_id, s.shop_name, c.product_cat_name
FROM product p
LEFT JOIN seller s ON p.seller_id = s.id
LEFT JOIN product_category c ON p.category_id = c.id
LIMIT 20
  ↓

STEP 4: MySQL Returns Data
──────────────────────────
Database sends back 20 product rows with:
- Product ID, Name, Price, Image URL (from S3)
- Vendor name (from seller table)
- Category name (from product_category table)
  ↓

STEP 5: Backend Formats Response
────────────────────────────────
Controller formats as JSON:
{
  "success": true,
  "products": [
    {
      "id": 1,
      "product_name": "Tomato Seeds",
      "price": 150,
      "product_image": "https://farmeasy-uploads.s3.amazonaws.com/...",
      "shop_name": "AgroTech Vendor",
      "category": "Seeds"
    },
    { ... more products ... }
  ]
}
  ↓

STEP 6: Frontend Displays Data
──────────────────────────────
React receives JSON response
Maps through products array
Renders each product in a card component
Shows image from S3 URL, name, price, vendor name
```

---

### **Scenario: Customer Placing an Order**

```
STEP 1: User Clicks "Checkout"
───────────────────────────────
Frontend has cart items in state:
[
  { product_id: 1, quantity: 2 },
  { product_id: 5, quantity: 1 }
]
  ↓

STEP 2: Frontend Sends Order Request
────────────────────────────────────
POST /api/orders/create
Headers: Authorization: Bearer {JWT_TOKEN}
Body: {
  cartItems: [...],
  paymentMethod: "COD"
}
  ↓

STEP 3: Backend Validates
──────────────────────────
auth middleware verifies JWT token from header
Extracts user_id from decoded token
  ↓

STEP 4: Backend Calculates Total (IMPORTANT!)
──────────────────────────────────────────────
Never trust frontend totals! Recalculate from database:

SELECT p.id, p.price, ci.quantity
FROM product p
WHERE p.id IN (1, 5)

For each product, verify:
- Product exists
- Price is current (prevents price manipulation)
- Quantity in stock is sufficient

Calculate: total = (p1.price × qty1) + (p2.price × qty2)
  ↓

STEP 5: Create Order in Database
────────────────────────────────
INSERT INTO orders (user_id, order_date, order_status, total_price)
VALUES (42, NOW(), 'Pending', 325.00)

This returns: order_id = 100
  ↓

STEP 6: Create Order Items
──────────────────────────
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES (100, 1, 2, 150.00)

INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES (100, 5, 1, 25.00)
  ↓

STEP 7: Create Payment Record
─────────────────────────────
INSERT INTO payment (order_id, payment_method, amount, status)
VALUES (100, 'COD', 325.00, 'Pending')
  ↓

STEP 8: Clear User's Cart
─────────────────────────
DELETE FROM cart WHERE user_id = 42
  ↓

STEP 9: Send Confirmation Email
────────────────────────────────
emailService.sendOrderConfirmation(
  user.email,
  order.id,
  order.total_price
)
Backend uses Nodemailer to send email via SMTP
  ↓

STEP 10: Return Response to Frontend
────────────────────────────────────
{
  "success": true,
  "message": "Order placed successfully",
  "orderId": 100,
  "total": 325.00
}

Frontend redirects to order confirmation page
```

---

## 🔐 Authentication Flow

### **User Registration & Login**

```
1. REGISTRATION (POST /api/authentication/register)
   ────────────────────────────────────
   Frontend sends:
   {
     "full_name": "John Farmer",
     "email": "john@example.com",
     "password": "plaintext_password",
     "phone_number": "9876543210",
     "role": "user"  // or "vendor"
   }
     ↓
   Backend:
   - Validates email not already registered
   - Hashes password using bcrypt: password_hash = bcrypt.hash(password)
   - INSERT INTO users (full_name, email, password_hash, role, ...)
   - Returns: { "success": true, "message": "Account created" }

2. LOGIN (POST /api/authentication/login)
   ──────────────────────────────────────
   Frontend sends:
   {
     "email": "john@example.com",
     "password": "plaintext_password"
   }
     ↓
   Backend:
   - Queries: SELECT * FROM users WHERE email = ?
   - Compares plain password with stored password_hash using bcrypt
   - If match: Creates JWT token with payload:
     {
       "id": 5,
       "email": "john@example.com",
       "role": "user"
     }
     Signed with SECRET_KEY, expires in 7 days
   - Returns: {
       "success": true,
       "token": "eyJhbGciOiJIUzI1NiIs...",
       "user": { "id": 5, "email": "john@example.com", "full_name": "John Farmer" }
     }

3. SUBSEQUENT REQUESTS (Using JWT Token)
   ──────────────────────────────────────
   Frontend stores token in localStorage
   
   Every API request includes:
   Headers: {
     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
   }
   
   Backend middleware (verifyToken) checks:
   - Extract token from Authorization header
   - Decode token using SECRET_KEY
   - Verify signature is valid
   - Check token not expired
   - Extract user_id from decoded payload
   - Attach to request: req.user = { id: 5, email: "...", role: "user" }
   - Pass to controller

4. TOKEN REFRESH (POST /api/auth/refresh)
   ──────────────────────────────────────
   When token is about to expire:
   Frontend detects (axios interceptor)
     ↓
   Sends current token to refresh endpoint
     ↓
   Backend verifies token exists and user still exists
     ↓
   Issues new token (7 days from now)
   Returns new token to frontend
   Frontend updates localStorage
```

---

## 🛣️ Backend Routes - Key Endpoints

### **Authentication Routes** (`/api/authentication/`)
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---|
| `/register` | POST | Create new account | No |
| `/login` | POST | Login & get JWT token | No |
| `/google` | POST | Google OAuth login | No |
| `/refresh` | POST | Get new token | Yes |

### **Product Routes** (`/api/products/`)
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---|
| `/all` | GET | Get all products with filters | No |
| `/:id` | GET | Get single product details | No |
| `/search?q=...` | GET | Search products | No |
| `/category/:catId` | GET | Get products by category | No |

### **Vendor Routes** (`/api/vendor/`)
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---|
| `/profile` | GET | Get vendor profile | Yes |
| `/profile` | PUT | Update vendor profile | Yes |
| `/products` | POST | Add new product | Yes |
| `/products/:id` | PUT | Edit product | Yes |
| `/products/:id` | DELETE | Delete product | Yes |
| `/products` | GET | Get all vendor's products | Yes |

### **Order Routes** (`/api/orders/`)
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---|
| `/create` | POST | Place new order | Yes |
| `/my-orders` | GET | Get user's orders | Yes |
| `/:id` | GET | Get order details | Yes |
| `/:id/status` | PUT | Update order status & send email | Yes |

### **Cart Routes** (`/api/cart/`)
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---|
| `/` | GET | Get user's cart items | Yes |
| `/add` | POST | Add item to cart | Yes |
| `/:productId` | PUT | Update quantity | Yes |
| `/:productId` | DELETE | Remove from cart | Yes |

### **Wishlist Routes** (`/api/wishlist/`)
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---|
| `/` | GET | Get wishlist items | Yes |
| `/add` | POST | Add to wishlist | Yes |
| `/:productId` | DELETE | Remove from wishlist | Yes |

---

## 🎛️ Backend Controllers - Processing Logic

### **How Controllers Work:**

```
Request Flow:
─────────────
1. Express route handler receives request
2. Route calls appropriate CONTROLLER function
3. Controller:
   - Validates input
   - Queries database using db.pool (MySQL connection pool)
   - Processes data
   - Returns response
4. Frontend receives response

Example: productController.getAllProducts()
─────────────────────────────────────────
exports.getAllProducts = (req, res) => {
  // STEP 1: Extract filters from query params
  const { category, search, page = 1, limit = 20 } = req.query;
  
  // STEP 2: Build SQL query
  let sql = `SELECT * FROM product WHERE 1=1`;
  let params = [];
  
  if (category) {
    sql += ` AND category_id = ?`;
    params.push(category);
  }
  
  if (search) {
    sql += ` AND (product_name LIKE ? OR product_description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  
  sql += ` LIMIT ? OFFSET ?`;
  params.push(limit, (page - 1) * limit);
  
  // STEP 3: Execute query
  db.pool.query(sql, params, (error, results) => {
    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: "Database error" 
      });
    }
    
    // STEP 4: Send response
    res.json({
      success: true,
      count: results.length,
      products: results
    });
  });
}
```

### **Key Controllers to Know:**

1. **loginController.js** - User authentication & JWT token generation
2. **registerController.js** - New user account creation
3. **productController.js** - Product listing, search, filtering
4. **vendorProductController.js** - Vendor adding/editing products
5. **cartController.js** - Shopping cart management
6. **orderController.js** - Order creation & management
7. **vendorOrderController.js** - Vendor viewing & updating orders
8. **profileController.js** - User profile CRUD
9. **reviewController.js** - Product reviews & ratings
10. **emailService.js** - Email notifications via Nodemailer

---

## 🖼️ File Upload & AWS S3 Integration

### **Image Upload Flow:**

```
1. User selects image file from computer
   ↓
2. Frontend sends FormData POST request:
   POST /api/vendor/products
   FormData {
     product_name: "Tomato Seeds",
     price: 150,
     product_image: File { ... }  ← Binary file data
   }
   ↓
3. Express parses FormData using multer middleware
   ↓
4. Multer uploads file to AWS S3 bucket (farmeasy-uploads)
   Returns: https://farmeasy-uploads.s3.amazonaws.com/farmeasy/1714234567-abc123.jpg
   ↓
5. Backend stores S3 URL in database:
   INSERT INTO product (product_image, ...)
   VALUES ('https://farmeasy-uploads.s3.amazonaws.com/farmeasy/1714234567-abc123.jpg', ...)
   ↓
6. Frontend receives product ID and S3 URL
   ↓
7. When displaying product, uses S3 URL directly:
   <img src="https://farmeasy-uploads.s3.amazonaws.com/farmeasy/1714234567-abc123.jpg" />
```

**Why S3?** - Saves server bandwidth, fast delivery via CDN, scalable

---

## 📧 Email Notification System (Nodemailer)

### **When Emails Are Sent:**

```
1. USER REGISTRATION
   ──────────────────
   Trigger: User completes signup
   Email: Welcome email with login credentials

2. ORDER CONFIRMATION
   ──────────────────
   Trigger: Order placed successfully
   Email: Order receipt with:
   - Order ID
   - Items list
   - Total price
   - Delivery address
   - Tracking info

3. ORDER STATUS UPDATES
   ────────────────────
   Trigger: Vendor updates order status
   PUT /api/orders/:orderId/status
   
   Status Updates & Emails:
   - "Confirmed" → Email: "Order confirmed, will ship soon"
   - "Shipped" → Email: "Your order is on the way"
   - "Delivered" → Email: "Order delivered successfully"
   - "Cancelled" → Email: "Order cancelled"
```

### **Email Configuration (.env required):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@farmeasy.com
SMTP_FROM_NAME=FarmEasy Team
```

---

## 🔑 Important Features & Recent Fixes

### **1. Authentication & Token Management** ✅
- JWT tokens expire in 7 days
- Token refresh endpoint prevents forced re-login
- Google OAuth integration for quick sign-up
- Role-based access (user, vendor, admin)

### **2. Data Security** ✅
- Passwords hashed with bcrypt
- Sensitive data protected by JWT middleware
- HTTPS URLs for all external APIs
- Protected profile endpoints (`/api/profile/me` instead of open `/users/:id`)

### **3. Cart & Checkout Safety** ✅
- **NEVER trust frontend totals** - Backend recalculates from database
- Prevents price manipulation attacks
- Cart cleared after successful order
- Validates stock before order completion

### **4. Category System** ✅
- Hierarchical categories with parent-child relationships
- Home page filters to show only categories with products
- Both category and subcategory support

### **5. Multi-role System** ✅
- **User/Customer** - Browse & purchase products
- **Vendor** - Sell products via dashboard
- **Farmer** - Special farmer details
- **Admin** - Platform management

### **6. Email Notifications** ✅
- Order confirmations sent automatically
- Status updates trigger emails
- Vendor notifications for new orders

---

## 🔧 Database Connection Flow

### **How Backend Connects to Database:**

```
config/db.js (MySQL Connection Pool)
──────────────────────────────────

const db = {
  pool: mysql.createPool({
    host: process.env.DB_HOST,        // Usually: localhost
    user: process.env.DB_USER,        // Usually: root
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,    // farmeasy
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  })
}

Connection pool = Multiple connections available
- When query needed: Grab connection from pool
- Execute query
- Return connection to pool for reuse
- Prevents bottlenecks from too many connections

Any controller can query database:
────────────────────────────────
db.pool.query(sql, params, (error, results) => {
  if (error) throw error;
  // Process results
  res.json(results);
});
```

---

## 📊 Database Relationships Diagram

```
┌──────────────┐
│    USERS     │◄─────────┐
├──────────────┤          │
│ id (PK)      │          │ (1 user = 1 vendor)
│ email        │          │
│ role         │          │
│ password_hash│      ┌────────────┐
└──────────────┘      │   SELLER   │
       ▲             ├────────────┤
       │             │ id (PK)    │
       │             │ user_id(FK)│
       │             │ shop_name  │
       │             │ gst_no     │
       │             └────────────┘
       │                    │
       │              (1 vendor = many products)
       │                    │
       │             ┌──────▼──────────┐
       │             │    PRODUCT      │
       │             ├─────────────────┤
       │             │ id (PK)         │
       │             │ seller_id (FK)  │
       │             │ category_id(FK) │
       │             │ product_name    │
       │             │ price           │
       │             │ product_image   │
       │             └─────────────────┘
       │                    ▲
       │              (many products in 1 order)
       │                    │
    (user ├─────────────┬────────────────────┐
   places │             │                    │
   orders)│      ┌──────▼──────┐      ┌─────▼────────┐
       │  │      │   ORDERS    │      │  ORDER_ITEMS │
       └─┼─┬────►├─────────────┤◄─────┤──────────────┤
         │ │     │ id (PK)     │      │ id (PK)      │
         │ │     │ user_id(FK) │      │ order_id(FK) │
         │ │     │ total_price │      │ product_id   │
         │ │     │ order_status│      │ quantity     │
         │ │     └─────────────┘      │ price        │
         │ │            │              └──────────────┘
         │ │       (1 order = many statuses)
         │ │            │
         │ │     ┌──────▼─────────┐
         │ │     │ PAYMENT        │
         │ │     ├────────────────┤
         │ │     │ id (PK)        │
         │ │     │ order_id (FK)  │
         │ │     │ payment_method │
         │ │     │ amount         │
         │ │     │ status         │
         │ │     └────────────────┘
         │ │
         │ └─────────────────────────────┐
         │                               │
    ┌────▼──────────┐        ┌───────────▼─────────┐
    │  CART         │        │  WISHLIST           │
    ├───────────────┤        ├─────────────────────┤
    │ id (PK)       │        │ id (PK)             │
    │ user_id (FK)  │        │ user_id (FK)        │
    │ product_id(FK)│        │ product_id (FK)     │
    │ quantity      │        │ created_at          │
    └───────────────┘        └─────────────────────┘

    ┌─────────────────────────┐    ┌──────────────────────┐
    │ REVIEW_RATING           │    │ TRACKING             │
    ├─────────────────────────┤    ├──────────────────────┤
    │ id (PK)                 │    │ id (PK)              │
    │ product_id (FK)         │    │ order_id (FK)        │
    │ user_id (FK)            │    │ status               │
    │ rating (1-5)            │    │ user_id (FK)         │
    │ comments                │    │ updated_at           │
    │ created_at              │    └──────────────────────┘
    └─────────────────────────┘
```

---

## 🚀 Key Topics to Prepare For Interview

### **Question 1: "Explain how a customer orders a product from database perspective"**
**Answer Structure:**
1. User browses products (SELECT from product table)
2. Adds to cart (INSERT into cart table)
3. Checkout (POST to /api/orders/create)
4. Backend validates cart from database
5. Creates order record (INSERT into orders)
6. Creates order_items records (INSERT into order_items with product details)
7. Creates payment record (INSERT into payment)
8. Clears cart (DELETE from cart)
9. Sends confirmation email
10. Returns order ID to frontend

### **Question 2: "What happens when vendor updates an order status?"**
**Answer Structure:**
1. Vendor clicks "Mark as Shipped"
2. Frontend sends: PUT /api/orders/:id/status with { status: "Shipped" }
3. Backend receives request with JWT token
4. Middleware verifies vendor owns this order
5. Updates database: UPDATE orders SET order_status = 'Shipped' WHERE id = :id
6. Triggers email via Nodemailer to customer
7. Updates tracking table: INSERT into tracking or UPDATE tracking
8. Returns success response

### **Question 3: "How does JWT authentication protect the backend?"**
**Answer Structure:**
1. After login, JWT token generated with user info + expiry
2. Token sent to frontend, stored in localStorage
3. Every request includes token in Authorization header
4. Middleware checks:
   - Token exists
   - Token signature valid (not tampered with)
   - Token not expired
5. If invalid → 401 error, user must login again
6. User ID extracted from token, prevents unauthorized access

### **Question 4: "What tables are involved when a vendor adds a product?"**
**Answer Structure:**
1. Vendor must be logged in (verify JWT)
2. Extract user_id from JWT token
3. Query seller table: SELECT * FROM seller WHERE user_id = ?
4. Get seller_id from result
5. Upload image to S3, get URL
6. INSERT into product table with seller_id and S3 image URL
7. Return product ID to frontend

### **Question 5: "Why recalculate totals on backend instead of trusting frontend?"**
**Answer Structure:**
1. Frontend can be hacked (browser console)
2. User could manually change total_price before sending
3. Backend doesn't trust frontend math
4. Queries current product prices from database
5. Multiplies quantity × current price
6. Calculates actual total
7. Creates order with correct total
8. Prevents fraud/loss

---

## 📝 Study Checklist for May 9

- [ ] **Database Schema** - Know all 10+ tables and their relationships
- [ ] **Data Flow** - Understand how data moves from DB → Backend → Frontend
- [ ] **Authentication** - Explain JWT flow and token refresh
- [ ] **Key Endpoints** - Know main routes and their purposes
- [ ] **Controllers** - Understand controller logic and SQL queries
- [ ] **User Roles** - Know differences between user/vendor/admin/farmer
- [ ] **Order Process** - Complete flow from cart to delivery
- [ ] **Security** - Password hashing, JWT validation, HTTPS
- [ ] **Email System** - When emails are triggered and how
- [ ] **AWS S3** - Why used and how images uploaded
- [ ] **Recent Fixes** - Know about auth fixes and improvements

---

## 🎯 Quick Reference - Common SQL Queries

### **Get all products with vendor info:**
```sql
SELECT p.*, s.shop_name, c.product_cat_name
FROM product p
LEFT JOIN seller s ON p.seller_id = s.id
LEFT JOIN product_category c ON p.category_id = c.id
ORDER BY p.created_at DESC;
```

### **Get customer's orders with items:**
```sql
SELECT o.id, o.order_date, o.order_status, o.total_price,
       oi.product_id, oi.quantity, oi.price,
       p.product_name, p.product_image
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN product p ON oi.product_id = p.id
WHERE o.user_id = 5
ORDER BY o.order_date DESC;
```

### **Get vendor's sales with customer info:**
```sql
SELECT o.id as order_id, o.order_date, o.order_status,
       u.full_name, u.email, u.phone_number,
       SUM(oi.price * oi.quantity) as total
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN product p ON oi.product_id = p.id
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN seller s ON p.seller_id = s.id
WHERE s.id = 1
GROUP BY o.id
ORDER BY o.order_date DESC;
```

### **Get product ratings:**
```sql
SELECT p.product_name,
       AVG(rr.rating) as avg_rating,
       COUNT(rr.id) as total_reviews
FROM product p
LEFT JOIN review_rating rr ON p.id = rr.product_id
GROUP BY p.id
ORDER BY avg_rating DESC;
```

---

## 📚 Files to Review Before Interview

1. **Backend Entry Point:** [backend/server.js](backend/server.js) - Understand how app starts
2. **Database Config:** [backend/config/db.js](backend/config/db.js) - Connection pool setup
3. **Schema:** [backend/schema.sql](backend/schema.sql) - All tables
4. **Email Service:** [backend/services/emailService.js](backend/services/emailService.js) - Email templates
5. **Key Controllers:**
   - [backend/controllers/loginController.js](backend/controllers/loginController.js)
   - [backend/controllers/productController.js](backend/controllers/productController.js)
   - [backend/controllers/vendorProductController.js](backend/controllers/vendorProductController.js)

---

## 💡 Pro Tips for Evaluation

1. **Understand the "Why" not just the "What"**
   - Why use JWT? Why recalculate totals? Why use S3?

2. **Know the complete flow**
   - User registration → Login → Browse → Cart → Order → Email confirmation

3. **Be ready for "What if" questions**
   - "What if user modifies token?" → Middleware validates signature
   - "What if frontend sends wrong total?" → Backend recalculates
   - "What if product deleted while in cart?" → FK constraint handles it

4. **Reference the code**
   - You can point to actual files and line numbers
   - Shows you've reviewed the actual implementation

5. **Prepare examples**
   - Have concrete examples ready: "When order status changes to 'Shipped', email triggers..."

---

**Last Updated:** May 3, 2026  
**Next Review:** May 9, 2026 - Evaluation Day 🚀

---
