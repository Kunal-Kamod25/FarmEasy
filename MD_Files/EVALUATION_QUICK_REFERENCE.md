# 🚀 QUICK REFERENCE CARD - 5 Min Flash Study
**For Last-Minute Review Before May 9th Evaluation**

---

## 🗄️ DATABASE TABLES (Quick Overview)

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | All accounts | id, email, password_hash, role |
| `seller` | Vendor info | id, user_id, shop_name, gst_no |
| `product` | Product listing | id, name, price, seller_id, category_id, image_url |
| `orders` | Customer purchases | id, user_id, order_date, status, total_price |
| `order_items` | Items in order | id, order_id, product_id, quantity, price |
| `cart` | Shopping cart | id, user_id, product_id, quantity |
| `wishlist` | Saved items | id, user_id, product_id |
| `payment` | Payment tracking | id, order_id, method, amount, status |
| `review_rating` | Product reviews | id, product_id, user_id, rating, comments |
| `tracking` | Delivery tracking | id, order_id, status, user_id |

---

## 🔄 REQUEST-RESPONSE CYCLE (30 seconds)

```
User Action → Frontend API Call → Express Route Handler
    ↓              ↓                      ↓
Click "Buy"  POST /api/orders/create    verifyToken()
    ↓              ↓                      ↓
Send Cart    Check Auth Header     Check JWT Signature
    ↓              ↓                      ↓
             Validate Data            Extract user_id
                                      ↓
                            OrderController.createOrder()
                                      ↓
                            Query Database (MySQL)
                                      ↓
                            Calculate Total (Don't trust frontend!)
                                      ↓
                            INSERT into orders
                            INSERT into order_items
                            INSERT into payment
                                      ↓
                            Send Confirmation Email (Nodemailer)
                                      ↓
Response JSON ← Format as JSON ← Return Results
↓
Frontend receives success
Shows order confirmation
```

---

## 🔐 JWT AUTHENTICATION (1 Minute)

**Flow:**
1. User logs in → Backend generates JWT with user info + 7-day expiry
2. Frontend stores token in localStorage
3. Every request: `Authorization: Bearer {TOKEN}`
4. Backend middleware verifies signature using SECRET_KEY
5. If valid → attach user_id to request
6. If invalid/expired → 401 error, user logs in again
7. Token refresh endpoint renews token before expiry

---

## 📦 ORDER CREATION (50 seconds)

**NEVER TRUST FRONTEND TOTAL!**

```
1. Frontend sends POST /api/orders/create with cart items
2. Backend extracts JWT → gets user_id
3. Query database: SELECT product, price FROM product WHERE id IN (...)
4. Backend calculates: total = Σ(price × quantity) from DB
5. INSERT INTO orders (user_id, total_price, status)
6. For each item: INSERT INTO order_items (order_id, product_id, qty, price)
7. INSERT INTO payment (order_id, amount, method)
8. DELETE FROM cart WHERE user_id = ?
9. Send email via Nodemailer
10. Return success response with order_id
```

---

## 📧 EMAIL TRIGGERS

| Event | Email Sent | Service |
|-------|-----------|---------|
| User signs up | Welcome email | Nodemailer via SMTP |
| Order placed | Order receipt | Automatic |
| Status: Confirmed | "Order confirmed" | When vendor updates |
| Status: Shipped | "Order on the way" | When vendor updates |
| Status: Delivered | "Delivered successfully" | When vendor updates |

---

## 🖼️ IMAGE UPLOAD PATH

```
User selects image file
    ↓
FormData sent to backend
    ↓
Multer middleware intercepts
    ↓
Uploads to AWS S3 bucket
    ↓
S3 returns HTTPS URL
    ↓
Backend stores S3 URL in MySQL
    ↓
Frontend displays image using S3 URL directly
```

---

## 🎯 KEY ENDPOINTS (Most Important)

**Auth:**
- `POST /api/authentication/register` - Sign up
- `POST /api/authentication/login` - Login
- `POST /api/auth/refresh` - Refresh token

**Products:**
- `GET /api/products/all` - List all products
- `POST /api/vendor/products` - Add product (vendor only)

**Orders:**
- `POST /api/orders/create` - Place order (customer)
- `GET /api/orders/my-orders` - View orders (customer)
- `PUT /api/orders/:id/status` - Update status (vendor)

**Cart:**
- `GET /api/cart/` - Get cart items
- `POST /api/cart/add` - Add to cart
- `DELETE /api/cart/:productId` - Remove from cart

---

## 🔒 SECURITY RULES

✅ **Password Hashing** - bcrypt hashes passwords before storing
✅ **JWT Validation** - Every request checks token signature + expiry
✅ **Backend Recalculates** - Never trust frontend price total
✅ **User ID from Token** - Extract from JWT, not from request param
✅ **HTTPS URLs** - S3 images, API calls use HTTPS
✅ **Role-based Access** - Vendor endpoints check user.role = 'vendor'

---

## 📊 COMMON DATABASE QUERIES

**Get products by category:**
```sql
SELECT * FROM product WHERE category_id = 5;
```

**Get user's orders with details:**
```sql
SELECT o.*, oi.product_id, oi.quantity, p.product_name
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN product p ON oi.product_id = p.id
WHERE o.user_id = 42;
```

**Get vendor's sales:**
```sql
SELECT SUM(oi.price * oi.quantity) as revenue
FROM order_items oi
LEFT JOIN product p ON oi.product_id = p.id
WHERE p.seller_id = 1;
```

---

## ❓ 5 QUESTIONS TO PREPARE FOR

**Q1: "How does data flow when user browses products?"**  
A: Frontend requests `/api/products/all` → Backend queries product table + joins with seller & category → MySQL returns results → Backend sends JSON → Frontend renders cards with data

**Q2: "Explain order creation process"**  
A: 1) Frontend sends cart items, 2) Backend validates JWT, 3) Recalculates total from DB, 4) Creates orders & order_items records, 5) Clears cart, 6) Sends email, 7) Returns order ID

**Q3: "What tables are involved in an order?"**  
A: orders (order details), order_items (products in order), payment (payment info), users (customer), product (product details), seller (vendor)

**Q4: "How is authentication secured?"**  
A: Passwords hashed with bcrypt, JWT token generated with signature, token verified on every request, signature prevents tampering, expiry forces re-login

**Q5: "Why recalculate totals on backend?"**  
A: Frontend can be hacked, user could manually change total_price, backend needs source of truth, prevents fraud

---

## 🔗 DATABASE RELATIONSHIPS (Mental Model)

```
One User ──┬──→ One Seller ──→ Many Products ──→ Many Orders
           │                       ↓                    ↓
           ├──→ One Profile       Many Reviews       Many Order Items
           │                                              ↓
           └──→ Many Cart Items                       Many Products
               Many Wishlist Items
```

---

## 📝 MEMORIZE THIS FLOW (15 seconds)

1. **User** registers/logs in → **JWT Token** generated
2. **Frontend** stores token → sends with every request
3. **Backend** middleware validates token → extracts user_id
4. **Controller** processes request → queries MySQL database
5. **Database** returns data → backend formats as JSON
6. **Frontend** receives response → renders UI
7. **Email** service sends confirmations on key events

---

## 🎬 REAL EXAMPLE: "User Places Order"

```
INPUT:  Frontend sends { cartItems: [id:1,qty:2 | id:5,qty:1] }

STEP 1: Middleware validates JWT token
STEP 2: Extract user_id from token payload
STEP 3: Query: SELECT price FROM product WHERE id IN (1,5)
STEP 4: Calculate: total = (150×2) + (25×1) = 325
STEP 5: INSERT INTO orders VALUES (user_id, NOW(), 'Pending', 325)
        Returns: order_id = 100
STEP 6: INSERT INTO order_items VALUES 
        (100, 1, 2, 150)
        (100, 5, 1, 25)
STEP 7: INSERT INTO payment VALUES (100, 'COD', 325, 'Pending')
STEP 8: DELETE FROM cart WHERE user_id = 42
STEP 9: emailService.sendConfirmation(user.email, 100, 325)
        Nodemailer sends email via SMTP

OUTPUT: { success: true, orderId: 100, total: 325 }
```

---

## ⏰ STUDY TIMELINE (For May 8-9)

**May 8 (Evening):**
- Read: System Architecture section
- Read: Database Schema section
- Memorize: 10 main tables

**May 9 (Morning - 1 hour before):**
- Review: Data Flow section
- Review: Order Process section
- Memorize: 5 Key Interview Questions
- Review: Quick Reference Card (THIS FILE)

**May 9 (Before evaluation):**
- Do 5-minute flash study with this card
- Trace through one complete order scenario
- Review authentication flow once more

---

**Print this card or keep on phone for quick review! 🚀**
