# Testing Email System with Postman

## Quick Setup

1. Make sure you have configured `.env` with SMTP credentials (see EMAIL_SYSTEM_SETUP.md)
2. Start the backend server: `npm start` or `npm run dev`
3. Open Postman and create a new collection called "FarmEasy - Email Tests"

## Test Cases

### Test 1: Place Order (Auto-sends Email)
**Purpose:** Verify that emails are sent when orders are placed

1. **Register/Login a Customer**
   - POST `/api/authentication/register`
   - Body:
     ```json
     {
       "full_name": "Test Farmer",
       "email": "testfarmer@example.com",
       "phone_number": "9876543210",
       "password": "Test@123",
       "role": "customer"
     }
     ```
   - Save the JWT token from response

2. **Login to get fresh token**
   - POST `/api/authentication/login`
   - Body:
     ```json
     {
       "identifier": "9876543210",
       "password": "Test@123"
     }
     ```

3. **Add Product to Cart**
   - POST `/api/cart`
   - Headers: `Authorization: Bearer {JWT_TOKEN}`
   - Body:
     ```json
     {
       "productId": 1,
       "quantity": 2
     }
     ```

4. **Place COD Order** ⭐ (This sends email!)
   - POST `/api/orders/cod`
   - Headers: `Authorization: Bearer {JWT_TOKEN}`
   - Body:
     ```json
     {
       "shippingDetails": {
         "fullName": "Test Farmer",
         "email": "testfarmer@example.com",
         "phone": "9876543210",
         "address": "123 Farm Lane, Village",
         "city": "Nashik",
         "state": "Maharashtra",
         "pincode": "422001"
       }
     }
     ```
   - **Expected Response:**
     ```json
     {
       "success": true,
       "message": "Order placed successfully",
       "orderId": 123
     }
     ```
   - **Email Status:** Check backend console for "✅ Email sent" message
   - **Verify Email:** Check testfarmer@example.com inbox for "Order Placed" email

---

### Test 2: Update Order to "Payment Confirmed"
**Purpose:** Test payment confirmation email

1. **Update Order Status**
   - PUT `/api/orders/{orderId}/status`
   - Headers: `Authorization: Bearer {JWT_TOKEN}`
   - Body:
     ```json
     {
       "status": "Payment Confirmed"
     }
     ```
   - **Expected Response:**
     ```json
     {
       "success": true,
       "message": "Order status updated to Payment Confirmed",
       "orderId": 123
     }
     ```
   - **Email Sent:** "Order Confirmed ✓" email
   - **Verify Email:** Check inbox for payment confirmation

---

### Test 3: Update Order to "Shipped"
**Purpose:** Test shipping notification with tracking link

1. **Update Order Status with Tracking**
   - PUT `/api/orders/{orderId}/status`
   - Headers: `Authorization: Bearer {JWT_TOKEN}`
   - Body:
     ```json
     {
       "status": "Shipped",
       "trackingUrl": "https://track.delivery.com/order/123"
     }
     ```
   - **Expected Response:**
     ```json
     {
       "success": true,
       "message": "Order status updated to Shipped",
       "orderId": 123
     }
     ```
   - **Email Sent:** "Your Order is on the Way! 📦" email with tracking link
   - **Verify Email:** Check inbox for shipping notification

---

### Test 4: Update Order to "Delivered"
**Purpose:** Test delivery confirmation email

1. **Update Order Status**
   - PUT `/api/orders/{orderId}/status`
   - Headers: `Authorization: Bearer {JWT_TOKEN}`
   - Body:
     ```json
     {
       "status": "Delivered"
     }
     ```
   - **Expected Response:**
     ```json
     {
       "success": true,
       "message": "Order status updated to Delivered",
       "orderId": 123
     }
     ```
   - **Email Sent:** "Order Delivered! ✓" email
   - **Verify Email:** Check inbox for delivery confirmation

---

### Test 5: Cancel Order
**Purpose:** Test order cancellation email with reason

1. **Update Order Status to Cancelled**
   - PUT `/api/orders/{orderId}/status`
   - Headers: `Authorization: Bearer {JWT_TOKEN}`
   - Body:
     ```json
     {
       "status": "Cancelled",
       "cancellationReason": "Out of stock - will be available next week"
     }
     ```
   - **Expected Response:**
     ```json
     {
       "success": true,
       "message": "Order status updated to Cancelled",
       "orderId": 123
     }
     ```
   - **Email Sent:** "Order Cancelled" email with reason
   - **Verify Email:** Check inbox for cancellation notice

---

## Troubleshooting Postman Tests

### Issue: "Order not found"
- Verify orderId exists in database
- Check JWT token is valid
- Ensure you're using the correct orderId from order placement response

### Issue: "Authorization header missing"
- Add header: `Authorization: Bearer {JWT_TOKEN}`
- Make sure JWT_TOKEN is from login/register response

### Issue: Email not received
- Check backend console for "❌ Error sending email" messages
- Verify SMTP credentials in `.env`
- Check if Gmail/Outlook requires app-specific password
- Look in Spam/Junk folder

### Issue: "SMTP not configured"
- Backend logs will show "📧 [EMAIL NOT SENT - SMTP NOT CONFIGURED]"
- Add SMTP credentials to `.env` and restart backend
- See EMAIL_SYSTEM_SETUP.md for setup instructions

---

## Email Test Variables (Save in Postman)

Create a Postman Environment with these variables:

```json
{
  "api_url": "http://localhost:5000",
  "customer_email": "testfarmer@example.com",
  "customer_phone": "9876543210",
  "customer_password": "Test@123",
  "jwt_token": "",
  "order_id": ""
}
```

Then use `{{api_url}}`, `{{jwt_token}}`, etc. in requests.

---

## Expected Email Subjects

1. `Order #123 Placed Successfully | FarmEasy`
2. `Order #123 Confirmed | FarmEasy`
3. `Order #123 Shipped | FarmEasy`
4. `Order #123 Delivered | FarmEasy`
5. `Order #123 Cancelled | FarmEasy`

---

## Backend Console Output Reference

```
✅ Email sent to testfarmer@example.com: <message-id>
   → Order Placed email sent successfully

❌ Error sending email to testfarmer@example.com: ENOTFOUND smtp.gmail.com
   → Check SMTP_HOST in .env

📧 [EMAIL NOT SENT - SMTP NOT CONFIGURED]
   → Configure .env with SMTP credentials
```

---

## Manual Testing Without Postman

### Using cURL:

```bash
# Place order
curl -X POST http://localhost:5000/api/orders/cod \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingDetails": {
      "fullName": "Test Farmer",
      "email": "test@example.com",
      "phone": "9876543210",
      "address": "123 Farm Lane",
      "city": "Nashik",
      "state": "Maharashtra",
      "pincode": "422001"
    }
  }'

# Update order status
curl -X PUT http://localhost:5000/api/orders/123/status \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"status": "Shipped", "trackingUrl": "https://track.com/123"}'
```

---

## Tips

- Use test email addresses (Gmail, Outlook, etc.) to verify emails
- Check spam folder if you don't see emails
- Wait 1-2 seconds after API call for email to send
- Backend logs all email activity - check console
- Use Environment variables in Postman for easier testing
- Save JWT token in Postman variable after login for easy reuse
