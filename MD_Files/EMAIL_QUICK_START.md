# Email System - Quick Start (5 Minutes)

## Step 1: Add SMTP Credentials to .env (1 min)

Open `backend/.env` and add:

```env
# Gmail Example (Easiest)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # 16-char app password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=FarmEasy
```

⚠️ **Gmail Setup Required:**
1. Enable 2-Factor Authentication: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-char password above

---

## Step 2: Restart Backend (1 min)

```bash
cd backend
npm start
# or
npm run dev
```

Check console for: `✅ Email configuration is valid`

---

## Step 3: Test with Order (2 min)

### Using Postman:

1. **POST** `/api/orders/cod`
2. Add header: `Authorization: Bearer {JWT_TOKEN}`
3. Body:
```json
{
  "shippingDetails": {
    "fullName": "Test Farmer",
    "email": "your-test-email@gmail.com",
    "phone": "9876543210",
    "address": "123 Farm Lane",
    "city": "Nashik",
    "state": "Maharashtra",
    "pincode": "422001"
  }
}
```

4. Send → Check inbox for "Order Placed Successfully" email ✅

---

## Step 4: Test Status Updates (1 min)

### Update order to "Shipped":

**PUT** `/api/orders/{orderId}/status`

Add header: `Authorization: Bearer {JWT_TOKEN}`

Body:
```json
{
  "status": "Shipped",
  "trackingUrl": "https://track.delivery.com/order/123"
}
```

Send → Check inbox for "Your Order is on the Way! 📦" email ✅

---

## Done! 🎉

Your farmers will now automatically receive:
- ✅ Order Placed
- ✅ Payment Confirmed
- ✅ Order Shipped
- ✅ Order Delivered
- ✅ Order Cancelled

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "SMTP not configured" in console | Add .env vars from Step 1 |
| "Error sending email" | Check SMTP_USER & SMTP_PASSWORD |
| Email not received | Check Spam/Junk folder |
| "Invalid email" error | Use valid email in shippingDetails |
| "Order not found" | Use correct orderId from order response |

---

## Need Help?

- **Setup issues?** Read: `EMAIL_SYSTEM_SETUP.md`
- **Testing guide?** Read: `EMAIL_SYSTEM_POSTMAN_GUIDE.md`
- **Full details?** Read: `EMAIL_SYSTEM_SUMMARY.md`

---

## Other Email Providers (Copy-Paste)

### Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=your-email@outlook.com
SMTP_FROM_NAME=FarmEasy
```

### SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-api-key-here
SMTP_FROM_EMAIL=noreply@farmeasy.com
SMTP_FROM_NAME=FarmEasy
```

---

**That's it! Your email system is live!** 📧
