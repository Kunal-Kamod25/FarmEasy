# FarmEasy - E-Commerce Enhancement Implementation

**Commit:** b1a9c31  
**Date:** April 5, 2026

---

## 📋 Summary of Changes

This update adds comprehensive e-commerce features including product categorization, reviews/ratings system, vendor notifications, and farmer-vendor messaging. All changes maintain backward compatibility with existing code.

---

## 🗄️ DATABASE CHANGES

### New Tables

#### 1. `categories` - Product Category Hierarchy
```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id INT (for hierarchical categories),
  icon VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  image VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Purpose:** Enables flexible product categorization with parent-child relationships
- **Example Structure:**
  - Fertilizers (parent)
    - Urea Based (sub-category)
    - NPK Fertilizers (sub-category)
    - Organic Fertilizers (sub-category)

**Sample Data Inserted:**
- 5 parent categories: Fertilizers, Seeds, Pesticides & Fungicides, Farm Equipment, Irrigation
- 8 sub-categories with icons and descriptions

---

#### 2. `brands` - Product Brand Management
```sql
CREATE TABLE brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Purpose:** Centralized brand management for product filtering
**Sample Brands:** Syngenta, Bayer, BASF, Monsanto, Corteva, FMC, Nufarm, Sumitomo

---

#### 3. `reviews` - Product Reviews & Ratings
```sql
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  user_id INT,
  rating INT (1-5 constraint),
  title VARCHAR(255),
  review_text TEXT,
  helpful_count INT DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE KEY (product_id, user_id),
  FOREIGN KEY (product_id) REFERENCES product(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Features:**
- One review per user per product (enforced by unique constraint)
- Star rating (1-5)
- Verified purchase badge (auto-set if user bought product)
- Helpful votes tracking
- Auto-updates product average rating

---

#### 4. `vendor_notifications` - Vendor Alert System
```sql
CREATE TABLE vendor_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  type VARCHAR(50) (new_order, low_stock, status_change),
  title VARCHAR(255),
  message TEXT,
  related_order_id INT,
  related_product_id INT,
  is_read BOOLEAN DEFAULT false,
  action_url VARCHAR(255),
  created_at TIMESTAMP,
  read_at TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES users(id),
  FOREIGN KEY (related_order_id) REFERENCES orders(id),
  FOREIGN KEY (related_product_id) REFERENCES product(id)
);
```

**Notification Types:**
- `new_order` - Customer placed order
- `low_stock` - Product stock running low
- `order_status_change` - Order status update (pending → confirmed → shipped → delivered)

---

#### 5. `vendor_messages` - Farmer-Vendor Chat
```sql
CREATE TABLE vendor_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id VARCHAR(255), (unique per farmer-vendor pair)
  sender_id INT,
  receiver_id INT,
  product_id INT (optional - which product they're asking about),
  message_text TEXT,
  attachment_url VARCHAR(255),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES product(id)
);
```

**Features:**
- Private 1-1 conversations
- Auto-read tracking
- Optional product context
- Conversation ID = sorted(sender_id, receiver_id) for uniqueness

---

### Modified Tables

#### `product` Table - New Columns Added
```sql
ALTER TABLE product ADD:
  - category_id INT (Foreign Key to categories)
  - brand_id INT (Foreign Key to brands)
  - stock_quantity INT DEFAULT 0
  - avg_rating DECIMAL(3,2) DEFAULT 0
  - review_count INT DEFAULT 0
```

#### `orders` Table - New Columns Added
```sql
ALTER TABLE orders ADD:
  - vendor_notified BOOLEAN DEFAULT false
  - stock_low_notified BOOLEAN DEFAULT false
```

---

## 🎯 BACKEND CHANGES

### New Controllers

#### 1. **categoryController.js** (250 lines)
**File Location:** `backend/controllers/categoryController.js`

**Functions:**
1. `getAllCategories()` - GET `/api/categories`
   - Returns all parent categories with subcategories
   - Includes product count for each category
   - Response: Hierarchical category tree

2. `getCategoryWithProducts()` - GET `/api/categories/:categoryId/products`
   - Products from category + all subcategories
   - Pagination support (12 items/page)
   - Includes brand and avg_rating
   - Params: `categoryId, page, limit`

3. `getSubcategories()` - GET `/api/categories/:parentId/subcategories`
   - Direct subcategories of a parent
   - Includes product count
   - Used for navigation dropdowns

4. `getProductsByFilters()` - GET `/api/categories/filters/search`
   - Advanced filtering by:
     - Category ID
     - Brand ID
     - Price range (minPrice, maxPrice)
     - Search term (product name/description)
   - Sorting: newest, price-low, price-high, rating, popular
   - Returns paginated results with total count

---

#### 2. **reviewController.js** (200 lines)
**File Location:** `backend/controllers/reviewController.js`

**Functions:**
1. `getProductReviews()` - GET `/api/reviews/product/:productId`
   - All reviews for a product with rating distribution
   - Sorting options: newest, oldest, rating-high, rating-low, helpful
   - Response includes:
     - Reviews array with user info
     - Rating statistics (avg, count, distribution by star)
   - Pagination support

2. `addOrUpdateReview()` - POST `/api/reviews/product/:productId`
   - Create new or update existing review
   - Auto-detects verified purchase (if user bought product)
   - Updates product avg_rating and review_count
   - Auth required
   - Params: `rating (1-5), title, review_text`

3. `deleteReview()` - DELETE `/api/reviews/product/:productId/review/:reviewId`
   - Only review owner can delete
   - Updates product rating automatically
   - Auth required

4. `markHelpful()` - POST `/api/reviews/:reviewId/helpful`
   - Increment helpful vote count
   - Public (no auth needed)

---

#### 3. **notificationController.js** (180 lines)
**File Location:** `backend/controllers/notificationController.js`

**Functions:**
1. `getNotifications()` - GET `/api/notifications`
   - Fetch vendor's notifications
   - Filter: `unreadOnly` param
   - Returns unread count + pagination
   - Auth required (vendor only)

2. `markAsRead()` - PATCH `/api/notifications/:notificationId/read`
   - Mark single notification as read
   - Auth required

3. `markAllAsRead()` - PATCH `/api/notifications/read-all`
   - Clear all unread notifications
   - Auth required

4. `deleteNotification()` - DELETE `/api/notifications/:notificationId`
   - Remove notification
   - Auth required

5. **Internal Helper Functions** (called from order/product controllers):
   - `notifyNewOrder(order_id, vendor_id)` - Triggered when order created
   - `notifyLowStock(product_id, vendor_id, current_stock)` - When stock < threshold
   - `notifyOrderStatusChange(order_id, vendor_id, new_status)` - When order status changes

---

#### 4. **messageController.js** (220 lines)
**File Location:** `backend/controllers/messageController.js`

**Functions:**
1. `getConversations()` - GET `/api/messages/conversations`
   - All conversations for user (farmer or vendor)
   - Includes last message preview + time
   - Unread count per conversation
   - Pagination support
   - Auth required

2. `getMessages()` - GET `/api/messages/conversation/:conversationId`
   - All messages in conversation
   - Auto-marks messages as read on fetch
   - Pagination (50 messages/page)
   - Auth required + security check (only participants)

3. `sendMessage()` - POST `/api/messages/send`
   - Send message in conversation
   - Params: `receiver_id, message_text, attachment_url (optional), product_id (optional)`
   - Auto-generates conversation_id
   - Auth required
   - Response: messageId, conversationId

4. `startConversation()` - POST `/api/messages/conversation/start`
   - Initialize new conversation with vendor
   - Optional: auto-send first message about product
   - Returns: conversationId, isNew (boolean)
   - Auth required

5. `deleteMessage()` - DELETE `/api/messages/:messageId`
   - Only sender can delete
   - Auth required

---

### Updated Routes

| Route File | Changes |
|-----------|---------|
| `categoryRoutes.js` | Replaced old category API with new hierarchy-aware controller |
| `notificationRoutes.js` | Created new file - 4 notification endpoints |
| `messageRoutes.js` | Created new file - 5 messaging endpoints |
| `server.js` | Registered 2 new route modules (notifications, messages) |

---

## 📱 FRONTEND CHANGES

### Pages to Update/Create

#### 1. **Category Navigation Component** (Update)
**File:** `frontend/src/components/Header/NavBar.jsx` (or dropdown component)

**Changes:**
- Add categories dropdown in third nav bar
- Display parent categories with expand/collapse
- Show subcategories on hover
- Link to category products page
- Show product count per category

**API Used:**
```javascript
GET /api/categories  // Get all categories with hierarchy
```

---

#### 2. **Products Listing Page** (Create/Update)
**File:** `frontend/src/Pages/ProductListing.jsx` or `AllProducts.jsx`

**Features:**
- Filter sidebar:
  - Category filter (with subcat expand)
  - Brand filter (dropdown from database)
  - Price range slider (₹0 - ₹10,000)
  - Sort options (Newest, Price: Low-High, Rating, Popular)
- Product grid (12 per page)
- Each product card shows:
  - Image
  - Name
  - Price
  - Brand
  - Average rating (stars + count)
  - Stock status

**APIs Used:**
```javascript
GET /api/categories                    // Category hierarchy
GET /api/categories/:categoryId/products  // Products by category
GET /api/categories/filters/search     // Advanced filtering
```

---

#### 3. **Product Detail Page** (Enhance/Create)
**File:** Create `frontend/src/Pages/ProductDetail.jsx`

**Sections:**
1. **Product Info**
   - Image gallery
   - Name, Price, Brand
   - Average rating + review count
   - Stock status + add to cart
   - "Ask Vendor" button (opens chat)

2. **Reviews & Ratings Section**
   - Rating summary bar (distribution: 5⭐, 4⭐, etc.)
   - Filter/sort reviews dropdown:
     - Newest first
     - Highest rated
     - Lowest rated
     - Most helpful
   - Each review card shows:
     - User name + profile pic
     - Rating (stars)
     - Review title
     - Review text (with expand for long reviews)
     - "Verified Purchase" badge
     - Helpful votes count
     - "Mark Helpful" button

3. **Write Review Section** (if user logged in)
   - Star rating selector (click to set)
   - Title input field
   - Review text (500 char limit)
   - Submit button
   - Shows message if user already reviewed

4. **Pagination** (10 reviews per page)

**APIs Used:**
```javascript
GET /api/products/:productId           // Product details
GET /api/reviews/product/:productId    // Reviews with stats
POST /api/reviews/product/:productId   // Add/update review
DELETE /api/reviews/product/:productId/review/:reviewId  // Delete review
POST /api/reviews/:reviewId/helpful    // Mark helpful
POST /api/messages/conversation/start  // Start vendor chat
```

---

#### 4. **Vendor Notifications Page** (Create)
**File:** Create `frontend/src/Pages/VendorNotifications.jsx`

**Features:**
- Unread count badge (top)
- "Mark all as read" button
- Notification list with:
  - Notification type icon (📦, ⚠️, 🔄)
  - Title + message  
  - Related order/product link
  - Time ago (e.g., "2 hours ago")
  - Read/unread status (bold text = unread)
  - Delete button
- Click notification to open action_url

**Notification Types:**
- New Order: "New Order Received! 📦" → Order detail page
- Low Stock: "Low Stock Alert! ⚠️" → Edit product page
- Status Change: "Order Status Update 🔄" → Order detail page

**APIs Used:**
```javascript
GET /api/notifications                    // Get notifications
PATCH /api/notifications/:id/read         // Mark as read
PATCH /api/notifications/read-all         // Mark all as read
DELETE /api/notifications/:id             // Delete notification
```

---

#### 5. **Farmer-Vendor Chat Component** (Create)
**File:** Create `frontend/src/components/VendorChat.jsx` or `Pages/VendorMessages.jsx`

**Layout:**
- Left sidebar: Conversations list
  - Search conversations
  - Sort by unread/recent
  - Each item shows:
    - Vendor/Farmer avatar
    - Name
    - Last message preview
    - Unread badge (if unread)

- Right panel: Message thread
  - Header with vendor/farmer name + status
  - Message list (scrollable)
    - Messages styled by sender (left/right)
    - Timestamp
    - Seen status (checkmark)
  - Input area:
    - Text input for message
    - Send button
    - Optional: File/image upload

- "Ask Vendor" quick-start button (on product detail page)

**APIs Used:**
```javascript
GET /api/messages/conversations           // Get all conversations
GET /api/messages/conversation/:id        // Get messages in conversation
POST /api/messages/send                   // Send message
POST /api/messages/conversation/start     // Start new chat
DELETE /api/messages/:messageId           // Delete message
```

---

## 🚀 API ENDPOINTS SUMMARY

### Categories API
```
GET    /api/categories                        - Get all categories with hierarchy
GET    /api/categories/:categoryId/products   - Products in category + subcats
GET    /api/categories/:parentId/subcategories - Get subcategories
GET    /api/categories/filters/search         - Multi-filter product search
```

### Reviews API
```
GET    /api/reviews/product/:productId        - Get product reviews + stats
POST   /api/reviews/product/:productId        - Add/update review (auth)
DELETE /api/reviews/product/:productId/review/:reviewId - Delete review (auth)
POST   /api/reviews/:reviewId/helpful         - Mark review helpful
```

### Notifications API
```
GET    /api/notifications                     - Get vendor notifications (auth)
PATCH  /api/notifications/:id/read            - Mark notification read (auth)
PATCH  /api/notifications/read-all            - Mark all read (auth)
DELETE /api/notifications/:id                 - Delete notification (auth)
```

### Messages API
```
GET    /api/messages/conversations            - Get conversations (auth)
GET    /api/messages/conversation/:id         - Get conversation messages (auth)
POST   /api/messages/send                     - Send message (auth)
POST   /api/messages/conversation/start       - Start new conversation (auth)
DELETE /api/messages/:messageId               - Delete message (auth)
```

---

## ✨ Key Features Implemented

### 1. ✅ Product Categorization
- Hierarchical categories (parent → child)
- Support for unlimited subcategories
- Category-based filtering
- Product counts per category

### 2. ✅ Brand Management
- Centralized brand database
- Brand-based filtering
- Brand dropdown in filters

### 3. ✅ Reviews & Ratings
- Per-product reviews system
- 5-star rating scale
- Verified purchase tracking
- Helpful votes
- Review statistics (count, distribution)
- One review per user per product

### 4. ✅ Vendor Notifications
- Real-time notification system
- Multiple notification types (order, stock, status)
- Mark as read/unread
- Related order/product linking
- Action URLs for quick navigation

### 5. ✅ Farmer-Vendor Messaging
- Private 1-1 conversations
- Message threading
- Unread count tracking
- Product context (optional)
- Quick-start "Ask Vendor" feature

---

## 🔄 Integration Points

### Order Creation Flow
When a customer places order:
1. Create order in `orders` table
2. For each vendor in order:
   ```javascript
   await notifyNewOrder(order_id, vendor_id);
   ```

### Stock Management
When vendor updates product stock:
1. Update `product.stock_quantity`
2. If stock < lower_threshold:
   ```javascript
   await notifyLowStock(product_id, vendor_id, current_stock);
   ```

### Order Status Updates
When order status changes:
1. Update `orders.status`
2. Notify vendor:
   ```javascript
   await notifyOrderStatusChange(order_id, vendor_id, new_status);
   ```

### Product Rating Updates
When review is added/updated/deleted:
1. Recalculate avg_rating: `AVG(rating)` from reviews
2. Update `product.avg_rating` and `product.review_count`

---

## 📦 Migration Steps

1. **Run database migration:**
   ```bash
   mysql -u root -p farmeasy < migrations/2026-04-05-product-categories-brands-notifications.sql
   ```

2. **Backend setup:**
   - Controllers are ready to use
   - Routes are registered in server.js
   - APIs are immediately available

3. **Frontend implementation:**
   - Create components listed in "Frontend Changes"
   - Integrate API calls
   - Update navigation to include new category dropdown and features

---

## 🐛 Error Handling

All controllers include:
- Input validation
- Foreign key constraint checks
- 404 checks for non-existent resources
- Auth checks (where required)
- SQL error logging
- JSON error responses with descriptive messages

---

## 🔐 Security

- All write operations (`POST`, `PATCH`, `DELETE`) require authentication
- Vendor can only see own notifications
- Users can only delete own reviews and messages
- Conversation participants can only view their messages
- SQL injection protected via parameterized queries
- Role-based access (consider expanding for admin features)

---

## 📊 Performance Optimizations

- Database indexes on frequently queried columns:
  - `categories.parent_id`, `categories.slug`
  - `reviews.product_id`, `reviews.rating`
  - `vendor_notifications.vendor_id`, `vendor_notifications.is_read`
  - `vendor_messages.conversation_id`, `vendor_messages.created_at`
- Pagination support (prevents loading all records)
- Efficient queries with proper JOINs
- Auto-calculated product averages (no recalc on every view)

---

## 🔗 Dependencies

- No new npm packages required
- Uses existing:
  - Express.js
  - MySQL2 (database)
  - JWT (authentication)

---

**Implementation Status:** ✅ Backend Complete | 🔄 Frontend Pending

**Next Steps:**
1. Create frontend components
2. Integrate API calls
3. Test end-to-end flows
4. Deploy to production
