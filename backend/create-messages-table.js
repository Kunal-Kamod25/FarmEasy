const db = require('./config/db');

async function createVendorMessagesTable() {
  try {
    console.log('🔄 Creating vendor_messages table...');
    
    const query = `
      CREATE TABLE IF NOT EXISTS vendor_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id VARCHAR(255) NOT NULL,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        product_id INT DEFAULT NULL,
        message_text TEXT,
        attachment_url VARCHAR(255) DEFAULT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX (conversation_id),
        INDEX (sender_id),
        INDEX (receiver_id)
      )
    `;
    
    await db.query(query);
    console.log('✅ vendor_messages table created/verified successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create table:', error.message);
    process.exit(1);
  }
}

createVendorMessagesTable();
