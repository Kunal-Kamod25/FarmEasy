# 🎨 VISUAL ARCHITECTURE & DATA FLOW GUIDE
**Complete System Diagrams - For Visual Learning**

---

## 1️⃣ COMPLETE REQUEST-RESPONSE CYCLE

```
┌──────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                             │
│                                                                        │
│  User clicks "Place Order"                                            │
│  ↓                                                                     │
│  React component: OrderCheckout.jsx                                   │
│  ├─ Read cart state: [{ id:1, qty:2 }, { id:5, qty:1 }]            │
│  ├─ Calculate in browser: total = 325 (DO NOT TRUST THIS!)           │
│  ├─ Create axios request:                                            │
│  │  POST /api/orders/create                                          │
│  │  Headers: {                                                        │
│  │    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"│
│  │    Content-Type: "application/json"                               │
│  │  }                                                                  │
│  │  Body: {                                                           │
│  │    cartItems: [{ product_id: 1, quantity: 2 }, ...],            │
│  │    total_price: 325  ← FRONTEND COMPUTED (IGNORED BY BACKEND)    │
│  │  }                                                                  │
│  └─ Send request                                                      │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓ Network
┌──────────────────────────────────────────────────────────────────────┐
│                   BACKEND (Express Server)                            │
│                                                                        │
│  Express Route Handler (orderRoutes.js):                             │
│  POST /api/orders → OrderController.createOrder()                   │
│                                                                        │
│  STEP 1: Middleware - verifyToken()                                 │
│  ├─ Extract Authorization header: "Bearer eyJ..."                   │
│  ├─ Decode JWT using SECRET_KEY                                     │
│  ├─ Verify signature is valid (not tampered)                        │
│  ├─ Check token not expired                                         │
│  └─ Extract payload: { id: 42, email: "john@example.com", ... }   │
│     req.user = { id: 42 }                                           │
│                                                                        │
│  STEP 2: Controller - validateCartItems()                           │
│  ├─ Receive: { cartItems: [{id:1,qty:2}, ...], total_price: 325 }│
│  └─ IGNORE total_price from frontend (could be hacked)             │
│                                                                        │
│  STEP 3: Database Query - Get current prices                        │
│  └─ Execute SQL:                                                     │
│     SELECT id, product_name, price, product_quantity                │
│     FROM product                                                     │
│     WHERE id IN (1, 5)                                              │
│                                                                        │
│  ↓ MySQL returns:                                                    │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │ id │ product_name │ price │ product_quantity           │       │
│  ├─────────────────────────────────────────────────────────┤       │
│  │ 1  │ Tomato Seeds │ 150   │ 50                         │       │
│  │ 5  │ Fertilizer   │ 25    │ 100                        │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                        │
│  STEP 4: Validation & Calculation                                   │
│  ├─ Product 1: qty=2 available? (50 ≥ 2) ✓                        │
│  ├─ Product 5: qty=1 available? (100 ≥ 1) ✓                       │
│  └─ Calculate total from DB prices (AUTHORITATIVE):               │
│     totalFromDB = (150 × 2) + (25 × 1) = 325 ✓                    │
│                                                                        │
│  STEP 5: Create Order Record                                        │
│  └─ Execute SQL:                                                     │
│     INSERT INTO orders                                              │
│     (user_id, order_date, order_status, total_price)               │
│     VALUES (42, NOW(), 'Pending', 325)                             │
│     ↓ Returns: orderId = 100                                       │
│                                                                        │
│  STEP 6: Create Order Items                                         │
│  ├─ SQL: INSERT INTO order_items                                    │
│  │   VALUES (100, 1, 2, 150)  ← (orderId, productId, qty, price) │
│  └─ SQL: INSERT INTO order_items                                    │
│      VALUES (100, 5, 1, 25)                                        │
│                                                                        │
│  STEP 7: Record Payment                                             │
│  └─ SQL: INSERT INTO payment                                        │
│      VALUES (100, 'COD', 325, 'Pending')                           │
│                                                                        │
│  STEP 8: Clear Shopping Cart                                        │
│  └─ SQL: DELETE FROM cart WHERE user_id = 42                      │
│                                                                        │
│  STEP 9: Send Confirmation Email                                    │
│  ├─ emailService.sendOrderConfirmation({                           │
│  │   orderId: 100,                                                  │
│  │   userEmail: "john@example.com",                                │
│  │   items: [...],                                                  │
│  │   total: 325                                                     │
│  │ })                                                                │
│  ├─ Nodemailer connects to SMTP server                             │
│  └─ Email sent to customer with order details                      │
│                                                                        │
│  STEP 10: Send Response to Frontend                                 │
│  └─ res.json({                                                      │
│      success: true,                                                 │
│      message: "Order placed successfully",                          │
│      orderId: 100,                                                  │
│      total: 325,                                                    │
│      email_sent: true                                              │
│    })                                                                │
└──────────────────────────────────────────────────────────────────────┘
                                 ↓ Network
┌──────────────────────────────────────────────────────────────────────┐
│                   FRONTEND (React - Continued)                        │
│                                                                        │
│  Receive response from backend                                       │
│  ├─ Check: response.success === true ✓                             │
│  ├─ Show: "Order #100 placed successfully!"                        │
│  ├─ Clear: cartContext.setCart([])                                 │
│  ├─ Redirect: navigate("/orders/100")                              │
│  └─ User sees order confirmation page                              │
│                                                                        │
│  ✉️  Meanwhile, customer receives confirmation email               │
│      Subject: "Order Confirmation #100"                            │
│      Body: Order details, items, tracking info                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ DATABASE TABLE RELATIONSHIPS MAP

```
                           ╔═════════════╗
                           ║    USERS    ║
                           ╚═════════════╝
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌─────▼────┐   ┌────▼─────┐  ┌──▼──────────┐
              │  SELLER  │   │  FARMER   │  │   PROFILE   │
              │(vendor)  │   │(farmer)   │  │  (extends)  │
              └─────┬────┘   └───────────┘  └─────────────┘
                    │
                    │ 1 vendor → many products
                    │
              ┌─────▼─────────────┐
              │    PRODUCTS       │
              │  (seller_id FK)   │
              └─────┬─────────────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
    ┌────▼───┐ ┌───▼────┐ ┌──▼──────────────┐
    │ ORDERS │ │ REVIEWS│ │ PRODUCT_IMAGES │
    └────┬───┘ └────────┘ └─────────────────┘
         │
    ┌────▼──────────┐
    │  ORDER_ITEMS  │
    │ (order → many │
    │   products)   │
    └─────┬─────────┘
          │
    ┌─────▼────┐
    │  PAYMENT  │
    │(per order)│
    └───────────┘

    ┌────────────┐    ┌──────────────┐
    │    CART    │    │   WISHLIST   │
    │(user ×     │    │(user × many  │
    │products)   │    │ products)    │
    └────────────┘    └──────────────┘

    ┌─────────────┐    ┌────────────┐
    │  TRACKING   │    │  CATEGORY  │
    │(per order)  │    │(hierarchy) │
    └─────────────┘    └────────────┘
```

---

## 3️⃣ AUTHENTICATION FLOW WITH JWT

```
┌──────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                               │
└──────────────────────────────────────────────────────────────┘

STEP 1: User enters credentials
┌────────────┐
│   login    │ ──POST /api/authentication/login──► 
│ john@ex.   │    { email, password }
│ pass123    │
└────────────┘

STEP 2: Backend validates
┌─────────────────────────────────────────┐
│ SELECT * FROM users WHERE email = ?     │
│ ↓ Gets: password_hash, id, email, role  │
│                                          │
│ bcrypt.compare(                         │
│   password,        ← "pass123"          │
│   password_hash    ← stored hash        │
│ ) ← If match: proceed; If not: error    │
└─────────────────────────────────────────┘

STEP 3: Generate JWT token
┌─────────────────────────────────────┐
│ jwt.sign({                          │
│   id: 42,                           │
│   email: "john@example.com",        │
│   role: "user",                     │
│   iat: now,                         │
│   exp: now + 7days                  │
│ }, SECRET_KEY)                      │
│                                     │
│ Returns: eyJhbGc... (token string)  │
└─────────────────────────────────────┘

STEP 4: Send response
┌──────────────────────────────────────────────────────┐
│ {                                                    │
│   success: true,                                     │
│   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",   │
│   user: {                                            │
│     id: 42,                                          │
│     email: "john@example.com",                       │
│     full_name: "John Farmer",                        │
│     role: "user"                                     │
│   }                                                  │
│ }                                                    │
└──────────────────────────────────────────────────────┘

STEP 5: Frontend stores token
┌─────────────────────┐
│ localStorage.setItem(
│   "token",
│   "eyJhbGc..."
│ )
│                     │
│ Every request now   │
│ includes token ✓    │
└─────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  USING TOKEN IN REQUESTS                     │
└──────────────────────────────────────────────────────────────┘

GET /api/profile/me ──────────────────────────────────────────►
Headers: {
  Authorization: "Bearer eyJhbGc...",
  Content-Type: "application/json"
}

Backend middleware (verifyToken):
1. Get Authorization header value
2. Extract token after "Bearer "
3. jwt.verify(token, SECRET_KEY)
   ├─ Decode token
   ├─ Check signature (ensures not tampered)
   ├─ Check expiry (exp: 7 days from login)
   └─ If valid: Extract user_id from payload
4. Attach to request: req.user = { id: 42, email: ..., role: ... }
5. Call next() to proceed to controller
6. Controller now has req.user with authenticated user info

Controller can then:
- Get user data: SELECT * FROM users WHERE id = req.user.id
- Prevent unauthorized access
- Log user action

┌──────────────────────────────────────────────────────────────┐
│                  TOKEN REFRESH FLOW                          │
└──────────────────────────────────────────────────────────────┘

Frontend (via axios interceptor) detects: token expiring soon

POST /api/auth/refresh
Headers: {
  Authorization: "Bearer eyJhbGc..."  ← old token
}

Backend:
1. Verify old token (if expired but not too old)
2. Query: SELECT * FROM users WHERE id = ?
3. Check user still exists & not deleted
4. Generate NEW token (fresh 7 days expiry)
5. Return new token

Frontend:
1. Update localStorage with new token
2. Retry original request with new token
3. User never forced to re-login ✓
```

---

## 4️⃣ DATA FLOW: "User Browsing Products"

```
User's Browser                    Express Backend              MySQL Database
═══════════════════════════════════════════════════════════════════════════

User lands on                         
/products page           ──GET /api/products/all──────►
                                                        SELECT *
                                                        FROM product p
                                                        LEFT JOIN seller s
                                                        ON p.seller_id = s.id
                                                        LEFT JOIN 
                                                        product_category c
                                                        ON p.category_id = c.id
                                                        LIMIT 20
                                                        
                                                        ◄────── Returns:
React request                                          [
ProductPage.jsx                                          {
makes API call                                            id: 1,
                                                          product_name: "Tomato Seeds",
                                                          price: 150,
                                                          product_image: "S3_URL",
                                                          shop_name: "AgroVendor",
                                                          category_name: "Seeds"
                                                          },
                                                          ...
                                                        ]

Receives response                   ◄─── JSON response ─
                                    {
                                      success: true,
                                      products: [...]
                                    }

Renders products           
- Maps through array
- Creates Product card
- Loads image from S3
- Shows: name, price, vendor
- "Add to Cart" button
- Shows category

Product card displayed ✓
with data from database


                        WHAT HAPPENS IF USER FILTERS:

User selects category      GET /api/products/all?category=5──►
"Seeds"                                                       SELECT *
                                                              FROM product p
                                                              WHERE p.category_id = 5
                                                              LEFT JOIN seller s...
                                                              
                                                              ◄─── Returns 5 seeds only

Receives filtered          ◄─── JSON response ─
results

Shows only seeds ✓
```

---

## 5️⃣ ORDER STATUS LIFECYCLE

```
┌─ PENDING (Order Placed)
│  ├─ Created at: NOW()
│  ├─ Email sent: Order confirmation
│  └─ Next state: Confirmed
│
├─ CONFIRMED (Vendor approves)
│  ├─ Updated by: Vendor via dashboard
│  ├─ SQL: UPDATE orders SET order_status = 'Confirmed' WHERE id = 100
│  ├─ Email sent: "Order confirmed, will ship soon"
│  └─ Next state: Shipped
│
├─ SHIPPED (Order on the way)
│  ├─ Updated by: Vendor or delivery system
│  ├─ SQL: UPDATE orders SET order_status = 'Shipped' WHERE id = 100
│  ├─ SQL: INSERT INTO tracking (order_id, status, user_id)
│  ├─ Email sent: "Your order is on the way!"
│  └─ Next state: Delivered
│
├─ DELIVERED (Order received)
│  ├─ Updated by: Delivery driver or manual
│  ├─ SQL: UPDATE orders SET order_status = 'Delivered' WHERE id = 100
│  ├─ Email sent: "Order delivered successfully"
│  └─ Next state: Completed (end)
│
└─ CANCELLED (Order cancelled)
   ├─ Updated by: Vendor or customer
   ├─ SQL: UPDATE orders SET order_status = 'Cancelled' WHERE id = 100
   ├─ Email sent: "Order has been cancelled"
   └─ Next state: End

API Endpoint: PUT /api/orders/:orderId/status
Request Body: { status: "Shipped", tracking_info: "..." }

Backend process:
1. Verify vendor owns this order
2. Update orders table
3. Insert/update tracking table
4. Get customer email from users table
5. Send email via Nodemailer
6. Return success response
```

---

## 6️⃣ CART OPERATIONS LIFECYCLE

```
┌──────────────────────────────────────────────────────────────┐
│                    SHOPPING JOURNEY                           │
└──────────────────────────────────────────────────────────────┘

1. User browses products
   Product card shows: "Add to Cart" button

2. User clicks "Add to Cart"
   POST /api/cart/add
   {
     product_id: 5,
     quantity: 2
   }
   
   Backend validates:
   - Is user authenticated? (check JWT)
   - Does product exist? (query product table)
   - Is quantity available? (check product_quantity)
   
   INSERT INTO cart (user_id, product_id, quantity)
   VALUES (42, 5, 2)
   
   Or if already in cart:
   UPDATE cart SET quantity = quantity + 2 WHERE product_id = 5

3. Cart icon shows "+1" badge
   Frontend: cartContext.addToCart(productId, qty)

4. User clicks "View Cart"
   GET /api/cart/
   
   Backend queries:
   SELECT c.*, p.product_name, p.price, p.product_image
   FROM cart c
   LEFT JOIN product p ON c.product_id = p.id
   WHERE c.user_id = 42
   
   Returns cart with product details

5. Frontend displays:
   - Product name, price, image
   - Quantity selector (+ / -)
   - Remove button
   - Subtotal per item
   - TOTAL (calculated in browser)

6. User can modify quantity
   PUT /api/cart/:productId
   { quantity: 5 }
   
   Backend:
   UPDATE cart SET quantity = 5 WHERE user_id = 42 AND product_id = 5

7. User can remove item
   DELETE /api/cart/:productId
   
   Backend:
   DELETE FROM cart WHERE user_id = 42 AND product_id = 5

8. User clicks "Checkout"
   POST /api/orders/create (with JWT)
   
   Backend:
   - Queries cart: GET all cart items
   - Queries products: GET current prices
   - Recalculates total (AUTHORITATIVE)
   - Creates orders & order_items records
   - Clears cart: DELETE FROM cart WHERE user_id = 42
   - Sends confirmation email

9. Order placed ✓
   Cart is empty
   Order ID created: 100
```

---

## 7️⃣ SELLER (VENDOR) PRODUCT MANAGEMENT

```
┌──────────────────────────────────────────────────────────────┐
│              VENDOR ADDS NEW PRODUCT                          │
└──────────────────────────────────────────────────────────────┘

Vendor logs in
├─ POST /api/authentication/login
├─ Backend checks seller table: SELECT * FROM seller WHERE user_id = 42
├─ Returns JWT with role: "vendor"
└─ Frontend stores token

Vendor navigates to "Add Product"
├─ Fills form:
│  ├─ Product name: "Organic Tomato Seeds"
│  ├─ Description: "High yield, disease resistant..."
│  ├─ Price: 150
│  ├─ Quantity: 100
│  ├─ Category: "Seeds" (category_id: 5)
│  └─ Image: <file> (binary image data)
│
└─ Clicks "Publish"

POST /api/vendor/products
Headers: {
  Authorization: "Bearer eyJhbGc...",
  Content-Type: "multipart/form-data"
}
Body: FormData {
  product_name: "Organic Tomato Seeds",
  price: 150,
  quantity: 100,
  category_id: 5,
  product_image: <File object>
}

Backend:
1. Middleware: verifyToken() ─► Extract user_id: 42
2. Check: User is vendor? (query seller table)
   SELECT * FROM seller WHERE user_id = 42
   ─► Get seller_id: 3
3. Multer middleware intercepts image
4. Upload to AWS S3
   ─► Returns: "https://farmeasy-uploads.s3.amazonaws.com/farmeasy/1714234567-abc.jpg"
5. Controller creates product:
   INSERT INTO product (
     product_name,
     product_description,
     price,
     product_quantity,
     category_id,
     seller_id,
     product_image,
     created_at
   )
   VALUES (
     "Organic Tomato Seeds",
     "High yield...",
     150,
     100,
     5,
     3,
     "https://farmeasy-uploads.s3.amazonaws.com/farmeasy/1714234567-abc.jpg",
     NOW()
   )
   ─► Returns: product_id = 42

6. Response to frontend:
   {
     success: true,
     product_id: 42,
     message: "Product published successfully!"
   }

Vendor sees:
"✓ Product published! It's now visible to customers"

┌──────────────────────────────────────────────────────────────┐
│              VENDOR UPDATES PRODUCT                           │
└──────────────────────────────────────────────────────────────┘

Vendor clicks "Edit" on existing product

PUT /api/vendor/products/:productId
Body: {
  product_name: "Premium Organic Tomato Seeds",
  price: 175,
  quantity: 50
}

Backend:
1. Verify JWT & vendor ownership
2. UPDATE product SET ... WHERE id = 42 AND seller_id = 3
3. Return updated product

┌──────────────────────────────────────────────────────────────┐
│              VENDOR DELETES PRODUCT                           │
└──────────────────────────────────────────────────────────────┘

DELETE /api/vendor/products/:productId

Backend:
1. Verify ownership
2. DELETE FROM product WHERE id = 42 AND seller_id = 3
   ─► Cascade: order_items referencing this product also deleted
3. Return success
```

---

## 8️⃣ COMPLETE USER ROLES

```
┌──────────────────────────────────────────────────────────────┐
│                      ROLE HIERARCHY                           │
└──────────────────────────────────────────────────────────────┘

                            ADMIN
                         (not shown in evaluation focus)
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                 VENDOR    FARMER    CUSTOMER
                 (Seller)   (User)    (User)

VENDOR (Seller)                CUSTOMER (User)
──────────────────────────────────────────────
├─ Browse products            ├─ Browse products
├─ Add products               ├─ Purchase products
├─ Edit products              ├─ Add to cart
├─ Delete products            ├─ Add to wishlist
├─ View sales/orders          ├─ View order history
├─ Update order status        ├─ View order details
│  (triggers email)           ├─ Write product reviews
├─ View dashboard stats       ├─ Rate products
├─ Profile management         ├─ Edit profile
├─ Registered via:            └─ Registered via:
│  - Email/password             - Email/password
│  - Google OAuth (if email     - Google OAuth
│    already vendor)
│
├─ Database location:         └─ Database location:
│  users.role = "vendor"         users.role = "user"
│  + seller table row            + optional farmer table
│  + many products


FARMER                          ADMIN
──────────────────────────────  ──────────────────────────
├─ Everything as CUSTOMER       ├─ All operations
├─ PLUS:                        ├─ Manage users
│  ├─ Mark as farmer in         ├─ Manage products
│  │  farmer table              ├─ View all orders
│  ├─ Farmer-specific features  ├─ System settings
│  └─ (Exchange products)       └─ Analytics
│
└─ users.role = "user"
   + farmer table row


               TABLE STRUCTURE FOR ROLES
               ────────────────────────

   User registers → users table
   │              full_name, email, password_hash, role='user'
   │
   ├─ If signs up as vendor:
   │  ├─ Role changed to 'vendor'
   │  ├─ seller table row created
   │  └─ Can now sell products (product.seller_id → seller.id)
   │
   ├─ If marks self as farmer:
   │  ├─ Role might stay 'user'
   │  └─ farmer table row created with farmer details
   │
   └─ If admin:
      └─ Role = 'admin' (backend manages)
```

---

## 9️⃣ SQL QUERY MAPPING TO ENDPOINTS

```
ENDPOINT                           SQL QUERY EXECUTED
─────────────────────────────────────────────────────────────

GET /api/products/all              SELECT * FROM product
  → productController.getAllProducts()  LEFT JOIN seller...
                                   LEFT JOIN product_category...

POST /api/authentication/login      SELECT * FROM users
  → loginController.login()         WHERE email = ?

POST /api/cart/add                  INSERT INTO cart (...)
  → cartController.addToCart()       VALUES (...)

POST /api/orders/create             SELECT product, price FROM product
  → orderController.createOrder()    WHERE id IN (...)
                                   
                                   INSERT INTO orders (...)
                                   INSERT INTO order_items (...)
                                   INSERT INTO payment (...)
                                   DELETE FROM cart WHERE user_id = ?

GET /api/profile/me                 SELECT * FROM users
  → profileController.getProfile()  WHERE id = ?

PUT /api/vendor/products/:id        UPDATE product SET ...
  → vendorProductController.updateProduct() WHERE id = ? AND seller_id = ?

PUT /api/orders/:id/status          UPDATE orders SET order_status = ?
  → vendorOrderController.updateStatus()     WHERE id = ?
                                   
                                   INSERT INTO tracking (...)
                                   EMAIL SENT TO CUSTOMER

GET /api/wishlist/                  SELECT * FROM wishlist
  → wishlistController.getWishlist() LEFT JOIN product...
                                   WHERE user_id = ?
```

---

## 🔟 SECURITY LAYERS

```
┌──────────────────────────────────────────────────────────────┐
│                  SECURITY AT EACH LAYER                       │
└──────────────────────────────────────────────────────────────┘

LAYER 1: Transport (HTTPS)
├─ All URLs are HTTPS (not HTTP)
├─ Data encrypted in transit
└─ Prevents interception

LAYER 2: Authentication (JWT)
├─ Token generated only after successful login
├─ Password verified via bcrypt comparison
├─ Token signed with SECRET_KEY
├─ Token verified on every request
├─ Token expires in 7 days
└─ Unsigned/expired token → 401 error

LAYER 3: Authorization (Role-based)
├─ Vendor endpoints check: user.role === "vendor"
├─ Customer endpoints: user.role === "user"
├─ Ownership verification: Vendor can only edit own products
│  Query: SELECT * FROM product WHERE id = ? AND seller_id = req.user.seller_id
└─ Prevents vendor A from editing vendor B's products

LAYER 4: Data Validation (Backend)
├─ Never trust frontend data
├─ Recalculate totals server-side
│  Instead of: INSERT ... VALUES (frontend_total)
│  Do: INSERT ... VALUES (backend_calculated_total)
├─ Verify product exists before adding to order
├─ Check stock availability
└─ Prevents fraud/price manipulation

LAYER 5: Database Constraints
├─ PRIMARY KEY: Ensures unique IDs
├─ FOREIGN KEY: Ensures referential integrity
│  - Can't create order_items for non-existent product
│  - Cascade DELETE: If product deleted, order_items also deleted
├─ UNIQUE KEY: One entry per (user_id, product_id) in cart
└─ NOT NULL: Required fields enforced at DB level

LAYER 6: Password Security
├─ bcrypt hashing with 10 salts
├─ password_hash stored (never plain password)
├─ bcrypt.compare() for login verification
└─ Rainbow table attacks ineffective

LAYER 7: Email Verification
├─ Emails sent via SMTP (not plain text)
├─ Contains order details for verification
├─ Confirms orders actually created in DB
└─ Customer can verify order legitimacy

LAYER 8: SQL Injection Prevention
├─ Parameterized queries (? placeholders)
├─ NOT concatenating user input into SQL strings
├─ Example SAFE: SELECT * FROM users WHERE email = ?
│  Example UNSAFE: SELECT * FROM users WHERE email = ' + email + '
└─ Backend framework (Express) + MySQL pool handle this
```

---

## Save This For Quick Reference!

Print or bookmark these diagrams. They help you:
- ✅ Visualize complete system architecture
- ✅ Trace data flow end-to-end
- ✅ Understand JWT lifecycle
- ✅ See table relationships clearly
- ✅ Explain order process step-by-step
- ✅ Demonstrate security knowledge

**Good luck on May 9th! 🚀**
