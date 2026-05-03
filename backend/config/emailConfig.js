// ============================================================================
// EMAIL CONFIGURATION - SMTP Setup
// ============================================================================
// This file configures nodemailer for sending emails via SMTP
// Requires the following .env variables:
//   SMTP_HOST - SMTP server address (e.g., smtp.gmail.com)
//   SMTP_PORT - SMTP port (e.g., 587 for TLS, 465 for SSL)
//   SMTP_USER - Email address/username for SMTP auth
//   SMTP_PASSWORD - Password or app-specific password for SMTP
//   SMTP_FROM_EMAIL - Sender email address (can be different from SMTP_USER)
//   SMTP_FROM_NAME - Display name for sender (e.g., "FarmEasy")
// ============================================================================

const nodemailer = require("nodemailer");

// Check if SMTP credentials are configured
const isSmtpConfigured = () => {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"];
  return required.every((key) => process.env[key]);
};

// Create transporter for sending emails
const createTransporter = () => {
  if (!isSmtpConfigured()) {
    console.warn("⚠️  SMTP not configured. Email features will be disabled.");
    console.warn("Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD in .env");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Get email configuration
const getEmailConfig = () => {
  return {
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    fromName: process.env.SMTP_FROM_NAME || "FarmEasy"
  };
};

// Test email configuration
const testEmailConfig = async () => {
  const transporter = createTransporter();
  if (!transporter) return false;

  try {
    await transporter.verify();
    console.log("✅ SMTP configuration is valid");
    return true;
  } catch (error) {
    console.error("❌ SMTP configuration error:", error.message);
    return false;
  }
};

module.exports = {
  createTransporter,
  getEmailConfig,
  testEmailConfig,
  isSmtpConfigured
};
