const db = require('./config/db');

async function verifyFixes() {
  try {
    console.log('🧪 Verifying vendor list...');
    const [vendors] = await db.query(`
      SELECT u.id, u.full_name as vendor_name, s.shop_name as store_name
      FROM users u
      JOIN seller s ON s.user_id = u.id
      WHERE u.role = 'vendor'
    `);
    
    console.log(`✅ Found ${vendors.length} vendors.`);
    if (vendors.length > 0) {
      console.log('First vendor:', vendors[0]);
    }

    console.log('\n🧪 Testing getConversations query syntax...');
    // We'll simulate a user_id = 1, limit = 20, offset = 0
    const user_id = 1;
    const limit = 20;
    const offset = 0;
    const params = [user_id, user_id];
    
    const [conversations] = await db.query(
      `SELECT 
        m1.conversation_id,
        CASE 
          WHEN m1.sender_id = ? THEN m1.receiver_id
          ELSE m1.sender_id
        END as other_user_id,
        u.full_name as other_user_name,
        u.profile_pic as other_user_pic,
        m1.message_text as last_message,
        m1.created_at as last_message_time,
        (SELECT COUNT(*) FROM vendor_messages 
         WHERE conversation_id = m1.conversation_id 
         AND is_read = false AND receiver_id = ?) as unread_count
      FROM vendor_messages m1
      JOIN (
        SELECT conversation_id, MAX(created_at) as max_created
        FROM vendor_messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY conversation_id
      ) m2 ON m1.conversation_id = m2.conversation_id AND m1.created_at = m2.max_created
      JOIN users u ON u.id = (
        CASE 
          WHEN m1.sender_id = ? THEN m1.receiver_id
          ELSE m1.sender_id
        END
      )
      ORDER BY last_message_time DESC
      LIMIT ? OFFSET ?`,
      [user_id, user_id, user_id, user_id, user_id, user_id, parseInt(limit), offset]
    );
    
    console.log('✅ Query syntax is correct! Conversations found:', conversations.length);
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyFixes();
