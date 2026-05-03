// ============================================================================
// EMAIL SERVICE - Send emails for order events
// ============================================================================
// Handles sending email notifications for:
// - Order Placed
// - Order Confirmed (Payment confirmed)
// - Order Shipped
// - Order Delivered
// - Order Cancelled
// ============================================================================

const { createTransporter, getEmailConfig, isSmtpConfigured } = require("../config/emailConfig");

const wrapEmailLayout = ({ title, preheader, bodyHtml }) => `
  <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#222;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader || title}</div>
    <div style="max-width:680px;margin:0 auto;padding:24px 12px;">
      <div style="background:#0f8f5b;color:#fff;border-radius:10px 10px 0 0;padding:16px 20px;font-size:20px;font-weight:700;">
        FarmEasy
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:22px;line-height:1.5;">
        <h2 style="margin:0 0 14px;color:#111827;font-size:22px;">${title}</h2>
        ${bodyHtml}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
        <p style="margin:0;color:#6b7280;font-size:12px;">This is an automated transaction email from FarmEasy. For support, contact the FarmEasy team.</p>
      </div>
    </div>
  </div>
`;

// Get transporter instance
let transporter = null;
if (isSmtpConfigured()) {
  transporter = createTransporter();
}

// ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────
const emailTemplates = {
  orderPlaced: (orderData) => {
    const { customerName, email, orderId, orderDate, items, totalPrice, shippingAddress } = orderData;
    return {
      subject: `FarmEasy Order Confirmed: #${orderId}`,
      html: wrapEmailLayout({
        title: "Your order has been placed",
        preheader: `Order #${orderId} has been confirmed`,
        bodyHtml: `
          <p>Hi <strong>${customerName}</strong>,</p>
          <p>Thanks for shopping with FarmEasy. We have received your order and will keep you updated at every step.</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;margin:14px 0;">
            <p style="margin:0 0 6px;"><strong>Order ID:</strong> #${orderId}</p>
            <p style="margin:0 0 6px;"><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString()}</p>
            <p style="margin:0;"><strong>Registered Email:</strong> ${email}</p>
          </div>
          <p style="margin:10px 0 8px;"><strong>Items</strong></p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr>
                <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:8px 0;">Product</th>
                <th style="text-align:right;border-bottom:1px solid #e5e7eb;padding:8px 0;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">${item.product_name} x ${item.quantity}</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="text-align:right;margin:14px 0 4px;font-size:18px;"><strong>Total: ₹${totalPrice.toFixed(2)}</strong></p>
          <p style="margin:8px 0 0;"><strong>Delivery Address:</strong> ${shippingAddress}</p>
        `
      })
    };
  },

  orderConfirmed: (orderData) => {
    const { customerName, orderId } = orderData;
    return {
      subject: `Order #${orderId} Confirmed | FarmEasy`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #2d5016; margin-bottom: 20px;">Order Confirmed ✓</h1>
            
            <p>Hi <strong>${customerName}</strong>,</p>
            <p>Great news! Your payment has been confirmed and your order is confirmed.</p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #155724; margin: 0;"><strong>Order ID: #${orderId}</strong></p>
              <p style="color: #155724; margin: 5px 0;">Status: Payment Confirmed</p>
            </div>
            
            <p>Your order is now in the queue for dispatch. You will receive a shipping notification once your items are on the way.</p>
            
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              This is an automated email. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };
  },

  orderShipped: (orderData) => {
    const { customerName, orderId, trackingUrl } = orderData;
    return {
      subject: `FarmEasy Shipping Update: Order #${orderId}`,
      html: wrapEmailLayout({
        title: "Your order is on the way",
        preheader: `Order #${orderId} has been shipped`,
        bodyHtml: `
          <p>Hi <strong>${customerName}</strong>,</p>
          <p>Your order <strong>#${orderId}</strong> has been shipped.</p>
          ${trackingUrl ? `<p><a href="${trackingUrl}" style="display:inline-block;background:#0f8f5b;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none;font-weight:600;">Track your order</a></p>` : ""}
          <p style="margin-top:12px;">We will send another email when the order is out for delivery and delivered.</p>
        `
      })
    };
  },

  orderDelivered: (orderData) => {
    const { customerName, orderId, deliveryDate } = orderData;
    return {
      subject: `Order #${orderId} Delivered | FarmEasy`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #2d5016; margin-bottom: 20px;">Order Delivered! ✓</h1>
            
            <p>Hi <strong>${customerName}</strong>,</p>
            <p>Your order has been delivered successfully!</p>
            
            <div style="background-color: #c8e6c9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #1b5e20; margin: 0;"><strong>Order ID: #${orderId}</strong></p>
              <p style="color: #1b5e20; margin: 5px 0;">Delivered on: ${new Date(deliveryDate).toLocaleDateString()}</p>
            </div>
            
            <p>We hope you're satisfied with your purchase. Please share your experience by leaving a review.</p>
            
            <p style="color: #666; margin-top: 20px;">Thank you for shopping with FarmEasy!</p>
            
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              This is an automated email. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };
  },

  orderCancelled: (orderData) => {
    const { customerName, orderId, cancellationReason } = orderData;
    return {
      subject: `Order #${orderId} Cancelled | FarmEasy`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #d32f2f; margin-bottom: 20px;">Order Cancelled</h1>
            
            <p>Hi <strong>${customerName}</strong>,</p>
            <p>Your order has been cancelled.</p>
            
            <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #b71c1c; margin: 0;"><strong>Order ID: #${orderId}</strong></p>
              <p style="color: #b71c1c; margin: 5px 0;">Status: Cancelled</p>
              ${cancellationReason ? `<p style="color: #b71c1c; margin: 5px 0;">Reason: ${cancellationReason}</p>` : ''}
            </div>
            
            <p>If you have any questions regarding this cancellation, please contact our support team.</p>
            
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              This is an automated email. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };
  }
};

// ─── SEND EMAIL FUNCTION ────────────────────────────────────────────────────
const sendEmail = async (recipientEmail, subject, html) => {
  // Validate recipient
  if (!recipientEmail) {
    console.warn(`📧 [EMAIL SKIPPED - NO RECIPIENT] Subject: ${subject}`);
    return { success: false, error: "no recipient" };
  }

  // If SMTP is not configured, log instead of sending
  if (!transporter) {
    console.log(`📧 [EMAIL NOT SENT - SMTP NOT CONFIGURED]`);
    console.log(`   To: ${recipientEmail}`);
    console.log(`   Subject: ${subject}`);
    return { success: false, message: "SMTP not configured", skipped: true };
  }

  try {
    const { fromEmail, fromName } = getEmailConfig();

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientEmail,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${recipientEmail}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending email to ${recipientEmail}:`, error && error.message ? error.message : error);
    return { success: false, error: error && error.message ? error.message : String(error) };
  }
};

// ─── SEND ORDER NOTIFICATIONS ────────────────────────────────────────────────
const notifyOrderPlaced = async (orderData) => {
  const template = emailTemplates.orderPlaced(orderData);
  return sendEmail(orderData.email, template.subject, template.html);
};

// Notify vendor(s) about a new order that includes their items
const notifyVendorNewOrder = async (vendorEmail, vendorData) => {
  const template = emailTemplates.vendorNewOrder(vendorData);
  return sendEmail(vendorEmail, template.subject, template.html);
};

// Vendor email template
emailTemplates.vendorNewOrder = (vendorData) => {
  const { vendorName, orderId, customerName, items, totalPrice, shippingAddress, orderDate } = vendorData;
  return {
    subject: `New FarmEasy Order: #${orderId}`,
    html: wrapEmailLayout({
      title: "You received a new order",
      preheader: `Order #${orderId} requires fulfillment`,
      bodyHtml: `
        <p>Hi <strong>${vendorName}</strong>,</p>
        <p>A new order has been placed containing items from your store.</p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;margin:14px 0;">
          <p style="margin:0 0 6px;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin:0 0 6px;"><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString()}</p>
          <p style="margin:0 0 6px;"><strong>Customer:</strong> ${customerName}</p>
          <p style="margin:0;"><strong>Delivery Address:</strong> ${shippingAddress}</p>
        </div>
        <ul style="list-style:none;padding:0;margin:0;">
          ${items.map(item => `
            <li style="padding:8px 0;border-bottom:1px solid #f3f4f6;">${item.product_name} x ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}</li>
          `).join('')}
        </ul>
        <p style="text-align:right;margin:14px 0 0;"><strong>Total (your items): ₹${totalPrice.toFixed(2)}</strong></p>
      `
    })
  };
};

// Vendor - status update template
emailTemplates.vendorStatusUpdate = (vendorData) => {
  const { vendorName, orderId, status, items, totalPrice, trackingUrl } = vendorData;
  return {
    subject: `Order #${orderId} - ${status} | FarmEasy (Vendor Update)`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
          <h1 style="color: #2d5016; margin-bottom: 20px;">Order Update: ${status}</h1>
          <p>Hi <strong>${vendorName}</strong>,</p>
          <p>The status for order <strong>#${orderId}</strong> has changed to <strong>${status}</strong>.</p>

          ${trackingUrl ? `<p><strong>Tracking:</strong> <a href="${trackingUrl}">Track shipment</a></p>` : ''}

          <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Items related to your shop:</strong></p>
            <ul style="list-style: none; padding: 0;">
              ${items.map(item => `
                <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  ${item.product_name} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}
                </li>
              `).join('')}
            </ul>
            <p style="margin-top: 15px; font-weight: bold;">Total (your items): <span style="color: #2d5016; font-size: 16px;">₹${totalPrice.toFixed(2)}</span></p>
          </div>

          <p style="color: #999; font-size: 12px; margin-top: 20px;">This is an automated email. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };
};

const notifyVendorStatusUpdate = async (vendorEmail, vendorData) => {
  const template = emailTemplates.vendorStatusUpdate(vendorData);
  return sendEmail(vendorEmail, template.subject, template.html);
};

const notifyOrderConfirmed = async (orderData) => {
  const template = emailTemplates.orderConfirmed(orderData);
  return sendEmail(orderData.email, template.subject, template.html);
};

const notifyOrderShipped = async (orderData) => {
  const template = emailTemplates.orderShipped(orderData);
  return sendEmail(orderData.email, template.subject, template.html);
};

const notifyOrderDelivered = async (orderData) => {
  const template = emailTemplates.orderDelivered(orderData);
  return sendEmail(orderData.email, template.subject, template.html);
};

const notifyOrderCancelled = async (orderData) => {
  const template = emailTemplates.orderCancelled(orderData);
  return sendEmail(orderData.email, template.subject, template.html);
};

module.exports = {
  notifyOrderPlaced,
  notifyOrderConfirmed,
  notifyOrderShipped,
  notifyOrderDelivered,
  notifyOrderCancelled,
  notifyVendorNewOrder,
  notifyVendorStatusUpdate,
  sendEmail
};
