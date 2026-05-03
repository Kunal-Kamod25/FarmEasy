// ============================================================================
// EMAIL CONFIGURATION TESTER
// ============================================================================
// Run this file to test your SMTP configuration:
//
//   node backend/test-email-config.js
//
// This will verify:
// 1. SMTP credentials are set in .env
// 2. SMTP connection is valid
// 3. Test email can be sent
// ============================================================================

require("dotenv").config();

const {
  createTransporter,
  getEmailConfig,
  testEmailConfig,
  isSmtpConfigured
} = require("./config/emailConfig");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.cyan}${"═".repeat(60)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${"═".repeat(60)}${colors.reset}\n`)
};

// ─── MAIN TESTER ──────────────────────────────────────────────────────────
const testEmailSystem = async () => {
  log.header("FarmEasy Email Configuration Tester");

  // 1. Check .env variables
  log.info("Step 1: Checking environment variables...");
  
  const requiredVars = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM_EMAIL"
  ];

  const missingVars = requiredVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    log.error(`Missing SMTP variables: ${missingVars.join(", ")}`);
    log.warn("Add these to your backend/.env file:");
    console.log(`
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=FarmEasy
    `);
    return;
  }

  log.success("All required SMTP variables found");

  // 2. Display configuration (masked)
  log.info("Step 2: Displaying configuration (passwords masked)...");
  const config = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: `${process.env.SMTP_PASSWORD?.substring(0, 3)}${"*".repeat(process.env.SMTP_PASSWORD?.length - 6)}${process.env.SMTP_PASSWORD?.slice(-3)}`,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "FarmEasy"
  };

  Object.entries(config).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  // 3. Test SMTP connection
  log.info("Step 3: Testing SMTP connection...");
  
  try {
    const result = await testEmailConfig();
    if (result) {
      log.success("SMTP connection successful!");
    } else {
      log.error("SMTP connection failed!");
      return;
    }
  } catch (error) {
    log.error(`SMTP connection error: ${error.message}`);
    return;
  }

  // 4. Send test email
  log.info("Step 4: Sending test email...");
  
  const testEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  
  if (!testEmail) {
    log.error("No email address to send test email to");
    return;
  }

  try {
    const transporter = createTransporter();
    const { fromEmail, fromName } = getEmailConfig();

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: testEmail,
      subject: "FarmEasy - Email Configuration Test",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #2d5016;">Email Configuration Test ✅</h1>
          <p>Your SMTP configuration is working correctly!</p>
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li>SMTP Host: ${process.env.SMTP_HOST}</li>
              <li>SMTP Port: ${process.env.SMTP_PORT}</li>
              <li>From Email: ${fromEmail}</li>
              <li>From Name: ${fromName}</li>
            </ul>
          </div>
          <p>You can now start sending order notification emails to your customers!</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    log.success(`Test email sent successfully!`);
    log.info(`Message ID: ${info.messageId}`);
    log.info(`To: ${testEmail}`);

  } catch (error) {
    log.error(`Failed to send test email: ${error.message}`);
    log.warn("Check your SMTP credentials and try again");
    return;
  }

  // 5. Success
  log.header("✅ Email System Configuration Verified!");

  console.log(`
${colors.green}Your email system is ready to send order notifications!${colors.reset}

Next steps:
1. Test order placement: POST /api/orders/cod
2. Check customer inbox for "Order Placed" email
3. Update order status: PUT /api/orders/:orderId/status
4. Verify corresponding email is sent

For more details, see:
- EMAIL_SYSTEM_SETUP.md
- EMAIL_SYSTEM_POSTMAN_GUIDE.md
  `);
};

// ─── RUN TESTER ────────────────────────────────────────────────────────────
testEmailSystem().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
