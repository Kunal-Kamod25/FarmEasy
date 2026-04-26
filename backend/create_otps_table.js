// backend/create_otps_table.js
// One‑time migration to add the OTP table used during registration.
// Run with: node backend/create_otps_table.js

const db = require('./config/db');

(async () => {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS registration_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await db.query(sql);
    console.log('✅ registration_otps table created successfully');
  } catch (err) {
    console.error('❌ Error creating registration_otps table:', err);
  } finally {
    db.end();
  }
})();
