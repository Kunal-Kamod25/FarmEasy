# Email Notification System Setup Guide

## Overview
FarmEasy now has an email notification system for farmers. When orders are placed or status changes, customers receive email updates via SMTP.

## What Was Added

### 1. **Email Configuration** (`backend/config/emailConfig.js`)
- Configures nodemailer with SMTP settings
- Reads credentials from environment variables
- Provides email configuration utilities

### 2. **Email Service** (`backend/services/emailService.js`)
- Sends transactional emails for order events:
  - Order Placed
  - Order Confirmed (Payment confirmed)
  - Order Shipped
  - Order Delivered
  - Order Cancelled
- HTML email templates with styling
- Graceful fallback if SMTP not configured (logs instead of sending)

### 3. **Order Routes Integration** (`backend/routes/orderRoutes.js`)
- Auto-sends email when COD orders are placed
- New endpoint: `PUT /api/orders/:orderId/status` to update order status with email
- Sends appropriate emails based on order status

## Setup Instructions

### Step 1: Configure Environment Variables
Add these to your `.env` file in the backend directory:

```env
# SMTP Configuration (Gmail example shown)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=FarmEasy
```

### Step 2: Configure Gmail (If Using Gmail)
1. Enable 2-Factor Authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer" (or your device)
4. Google will generate a 16-character password
5. Use this password in `SMTP_PASSWORD` field

### Step 3: Using Other Email Providers

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=your-email@outlook.com
SMTP_FROM_NAME=FarmEasy
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key
SMTP_FROM_EMAIL=your-verified-sender@example.com
SMTP_FROM_NAME=FarmEasy
```

**Amazon SES:**
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-username
SMTP_PASSWORD=your-ses-password
SMTP_FROM_EMAIL=your-verified-email@example.com
SMTP_FROM_NAME=FarmEasy
```

### Step 4: Test Email Configuration
Run this in a Node terminal in the backend directory:

```javascript
const { testEmailConfig } = require("./config/emailConfig");
testEmailConfig().then(result => {
  console.log(result ? "✅ Email config working!" : "❌ Email config failed!");
});
```

## API Endpoints

### 1. Place Order (Already Sends Email)
**Endpoint:** `POST /api/orders/cod`
- Automatically sends "Order Placed" email when order is created
- Email includes order details, items, total price, and shipping address

### 2. Update Order Status (With Email)
**Endpoint:** `PUT /api/orders/:orderId/status`

**Request Body:**
```json
{
  "status": "Shipped",
  "trackingUrl": "https://track.delivery.com/order/123",
  "cancellationReason": "Out of stock (only for Cancelled status)"
}
```

**Example Usage:**

```bash
# Order Confirmed
curl -X PUT http://localhost:5000/api/orders/123/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Payment Confirmed"}'

# Order Shipped (with tracking)
curl -X PUT http://localhost:5000/api/orders/123/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Shipped",
    "trackingUrl": "https://track.example.com/123"
  }'

# Order Delivered
curl -X PUT http://localhost:5000/api/orders/123/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Delivered"}'

# Order Cancelled
curl -X PUT http://localhost:5000/api/orders/123/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Cancelled",
    "cancellationReason": "Customer requested cancellation"
  }'
```

## Email Flow

### When Order is Placed (COD)
1. ✅ Order created in database
2. ✅ Stock updated
3. ✅ Cart cleared
4. ✅ **Email sent:** "Order Placed" confirmation
5. ✅ Response sent to customer

### When Order Status is Updated
1. ✅ Order status updated in database
2. ✅ Appropriate email sent based on new status
3. ✅ Response sent to requester

## Email Templates

All emails are HTML-formatted with FarmEasy branding:

1. **Order Placed** - Confirms order receipt, shows items and total
2. **Order Confirmed** - Payment confirmation
3. **Order Shipped** - Includes tracking link
4. **Order Delivered** - Congratulation email with review prompt
5. **Order Cancelled** - Explains cancellation with reason

## Error Handling

- If SMTP is not configured, the system logs emails instead of sending
- Email failures don't block order placement
- Errors are logged to console for debugging
- Both email send and response happen independently

## Logging

Check backend console for email activity:

```
✅ Email sent to customer@example.com: <message-id>
❌ Error sending email to customer@example.com: SMTP error message
📧 [EMAIL NOT SENT - SMTP NOT CONFIGURED] - To: customer@example.com
```

## Troubleshooting

### Emails Not Sending
1. Check SMTP credentials in `.env`
2. Verify email provider's security settings
3. Check backend console for error messages
4. Ensure `SMTP_HOST` and `SMTP_PORT` are correct
5. Test with `testEmailConfig()` function

### Gmail Issues
- Use app-specific password, not regular password
- Enable 2FA first
- Check "Less secure app access" settings

### Emails Going to Spam
- Add SPF/DKIM records for your email domain
- Use verified sender email addresses
- Check email provider's sending limits

## Next Steps

1. **Configure SMTP** in your `.env` file
2. **Test email** with `testEmailConfig()`
3. **Place a test order** and verify email is received
4. **Monitor logs** for any issues
5. **Customize templates** (optional) in `emailService.js` for branding

## File Structure

```
backend/
├── config/
│   └── emailConfig.js          # SMTP configuration
├── services/
│   └── emailService.js         # Email templates and sending logic
├── routes/
│   └── orderRoutes.js          # Updated with email integration
└── server.js
```

## Notes

- Nodemailer (^8.0.2) is already installed in dependencies
- Email sending is non-blocking (uses async)
- Order placement doesn't fail if email fails
- All email templates are HTML-based with responsive design
- From address can be different from SMTP credentials
