# 📧 FarmEasy Email Notification System

> Automated email notifications for farmers on every order update. Built with SMTP & Nodemailer.

## 🚀 What's New

Farmers now receive professional HTML emails for:
- ✅ Order Placed (Immediate)
- ✅ Payment Confirmed
- ✅ Order Shipped (with tracking link)
- ✅ Order Delivered
- ✅ Order Cancelled (with reason)

## 📊 System Architecture

```
┌─────────────┐
│  Customer   │
│   Places    │
│   Order     │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│     Backend Order Route               │
│  POST /api/orders/cod               │
└──────┬───────────────────────────────┘
       │
       ├──► Create Order in DB
       ├──► Update Stock
       ├──► Clear Cart
       │
       ├──► Async Email Send
       │   └──► SMTP Connection
       │       └──► Nodemailer
       │           └──► Gmail/Outlook/SendGrid
       │
       └──► Return Response to Customer

┌──────────────────────────────────────┐
│  Vendor Updates Order Status         │
│  PUT /api/orders/:orderId/status    │
└──────┬───────────────────────────────┘
       │
       ├──► Update Status in DB
       │
       ├──► Send Status Email
       │   ├─► "Shipped" → Send tracking email
       │   ├─► "Delivered" → Send confirmation
       │   ├─► "Cancelled" → Send cancellation
       │   └─► "Confirmed" → Send payment email
       │
       └──► Return Response

┌──────────────────────────────────────┐
│  📧 Customer Receives Email           │
│  With Order Details & Tracking       │
└──────────────────────────────────────┘
```

## 🔧 Setup (5 Minutes)

### 1. Configure SMTP in `.env`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=FarmEasy
```

### 2. Test Configuration

```bash
cd backend
node test-email-config.js
```

Expected output: `✅ Email System Configuration Verified!`

### 3. Restart Backend

```bash
npm start
```

Check console for: `✅ SMTP configuration is valid`

## 📝 API Reference

### Place Order (Auto-sends Email)
```bash
POST /api/orders/cod
Authorization: Bearer {JWT_TOKEN}

{
  "shippingDetails": {
    "fullName": "Farmer Name",
    "email": "farmer@example.com",
    "phone": "9876543210",
    "address": "Village Address",
    "city": "City",
    "state": "State",
    "pincode": "123456"
  }
}

Response:
{
  "success": true,
  "message": "Order placed successfully",
  "orderId": 123
}

📧 Email: "Order #123 Placed Successfully | FarmEasy"
```

### Update Order Status (Sends Email)
```bash
PUT /api/orders/:orderId/status
Authorization: Bearer {JWT_TOKEN}

{
  "status": "Shipped|Delivered|Cancelled|Payment Confirmed",
  "trackingUrl": "https://track.com/order/123",    // Optional
  "cancellationReason": "Out of stock"              // Optional
}

Response:
{
  "success": true,
  "message": "Order status updated to Shipped",
  "orderId": 123
}

📧 Email sent based on status
```

## 📧 Email Types

### 1. Order Placed
- When: Immediately after order creation
- To: Customer email from shippingDetails
- Contains: Order ID, items, total price, shipping address
- Template: Green "Order Placed Successfully! 🎉"

### 2. Order Confirmed
- When: Status updated to "Payment Confirmed"
- To: Customer email
- Contains: Order ID, payment confirmation
- Template: Green "Order Confirmed ✓"

### 3. Order Shipped
- When: Status updated to "Shipped"
- To: Customer email
- Contains: Order ID, tracking URL (if provided)
- Template: Blue "Your Order is on the Way! 📦"
- Action: Click "Track Your Order" button

### 4. Order Delivered
- When: Status updated to "Delivered"
- To: Customer email
- Contains: Order ID, delivery date
- Template: Green "Order Delivered! ✓"
- Call to action: Leave a review

### 5. Order Cancelled
- When: Status updated to "Cancelled"
- To: Customer email
- Contains: Order ID, cancellation reason
- Template: Red "Order Cancelled"

## 🧪 Testing

### Via Postman
1. See: `EMAIL_SYSTEM_POSTMAN_GUIDE.md`

### Test Script
```bash
node backend/test-email-config.js
```

### Manual Test
```javascript
const { notifyOrderPlaced } = require("./backend/services/emailService");

notifyOrderPlaced({
  customerName: "Test Farmer",
  email: "test@gmail.com",
  orderId: 123,
  orderDate: new Date(),
  items: [{ product_name: "Rice", quantity: 10, price: 50 }],
  totalPrice: 500,
  shippingAddress: "123 Farm Lane, Nashik, MH 422001"
});
```

## 📁 File Structure

```
backend/
├── config/
│   ├── db.js
│   ├── s3.js
│   └── emailConfig.js          ⭐ SMTP Configuration
├── services/
│   └── emailService.js         ⭐ Email Templates & Logic
├── routes/
│   └── orderRoutes.js          ⭐ Updated with email
├── test-email-config.js        ⭐ Configuration Tester
└── server.js
```

## 🛠️ Configuration Options

### Email Providers

#### Gmail (Recommended for Testing)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App Password
```
[Get Gmail App Password](https://myaccount.google.com/apppasswords)

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-api-key
```

#### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-username
SMTP_PASSWORD=your-ses-password
```

## 🔒 Security Notes

- ✅ Email failures don't break order placement
- ✅ Passwords are masked in logs
- ✅ Email sending happens asynchronously
- ✅ No sensitive data in email subjects
- ✅ SMTP credentials stored in `.env` (not in git)

## 📊 Error Handling

| Scenario | Behavior | Log Message |
|----------|----------|-------------|
| SMTP not configured | Logs instead of sends | `📧 [EMAIL NOT SENT - SMTP NOT CONFIGURED]` |
| Connection fails | Logs error, continues | `❌ Error sending email: ENOTFOUND smtp.host` |
| Email sends OK | Logs success, continues | `✅ Email sent to customer@example.com` |
| Auth fails | Logs error, continues | `❌ Error: Invalid SMTP credentials` |

## 🚀 Production Deployment

1. **Set SMTP credentials** in production `.env`
2. **Use professional email provider** (SendGrid, AWS SES, etc.)
3. **Configure SPF/DKIM** for your domain
4. **Test delivery** with real emails
5. **Monitor logs** for failures
6. **Set up alerts** for email errors

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| `EMAIL_QUICK_START.md` | 5-minute setup |
| `EMAIL_SYSTEM_SETUP.md` | Detailed configuration |
| `EMAIL_SYSTEM_POSTMAN_GUIDE.md` | Testing guide |
| `EMAIL_SYSTEM_SUMMARY.md` | Full feature overview |

## 🐛 Troubleshooting

### Email not sending?
1. Check `.env` variables are set
2. Run: `node backend/test-email-config.js`
3. Check backend console for error messages
4. Verify email provider SMTP settings

### Wrong email being sent?
1. Check `shippingDetails.email` in request
2. Verify database contains correct email
3. Check SMTP credentials

### Email in spam?
1. Add SPF record for your domain
2. Use verified sender email
3. Check email provider's spam settings

### "SMTP not configured"?
1. Ensure `.env` exists in `backend/` folder
2. Add all required SMTP variables
3. Restart backend server

## 🎯 Features

- ✅ Automatic order confirmation emails
- ✅ Order status update notifications
- ✅ Tracking link integration
- ✅ Cancellation reason notifications
- ✅ HTML responsive emails
- ✅ Graceful error handling
- ✅ Async non-blocking email sending
- ✅ Support for multiple SMTP providers
- ✅ Environment-based configuration
- ✅ Test configuration script

## 📈 Future Enhancements

- [ ] SMS notifications (Twilio)
- [ ] Push notifications
- [ ] Email preferences UI
- [ ] Unsubscribe mechanism
- [ ] Email templates admin UI
- [ ] Newsletter feature
- [ ] Attachment support (invoices)
- [ ] Multi-language emails
- [ ] Email analytics
- [ ] Retry logic

## 💡 Pro Tips

1. **Use app-specific passwords** for Gmail security
2. **Test with your own email** first
3. **Monitor spam folder** initially
4. **Keep .env file private** - never commit
5. **Set SPF/DKIM** early for reputation
6. **Use SendGrid/SES** for production
7. **Monitor email delivery** in logs
8. **Test all 5 email types** before launch

## 📞 Support

- **Setup help?** → `EMAIL_QUICK_START.md`
- **Configuration issues?** → `EMAIL_SYSTEM_SETUP.md`
- **Testing?** → `EMAIL_SYSTEM_POSTMAN_GUIDE.md`
- **Code details?** → Review `backend/services/emailService.js`

---

## ✅ Checklist

- [ ] SMTP configured in `.env`
- [ ] Backend restarted
- [ ] Configuration tested: `node backend/test-email-config.js`
- [ ] Test order placed
- [ ] Email received in inbox
- [ ] Order status updated
- [ ] Corresponding email received
- [ ] Ready for production ✨

---

**Your email system is ready! Farmers will love the updates!** 📧🚀
