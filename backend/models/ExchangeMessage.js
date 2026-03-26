// =====================================================
// ExchangeMessage Model
// =====================================================
// Handles chat/messaging between two farmers
// during the negotiation phase before finalizing exchange
// =====================================================

const db = require("../config/db");

class ExchangeMessage {
  // ===== SEND A MESSAGE =====
  // One farmer sends a message to another in a match conversation
  static async create(match_id, sender_id, message) {
    const query = `
      INSERT INTO exchange_messages (match_id, sender_id, message)
      VALUES (?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      db.query(query, [match_id, sender_id, message], (err, result) => {
        if (err) reject(err);
        else resolve(result.insertId);
      });
    });
  }

  // ===== GET ALL MESSAGES FOR A MATCH =====
  // Load entire chat history between two farmers for one exchange
  static async getByMatchId(match_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          em.*,
          u.full_name as sender_name,
          u.profile_pic,
          u.city,
          u.state
        FROM exchange_messages em
        JOIN users u ON em.sender_id = u.id
        WHERE em.match_id = ?
        ORDER BY em.created_at ASC
      `;

      db.query(query, [match_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // ===== MARK MESSAGES AS READ =====
  // Update is_read flag to hide notification badge
  static async markAsRead(match_id, reader_id) {
    const query = `
      UPDATE exchange_messages 
      SET is_read = 1
      WHERE match_id = ? AND sender_id != ?
    `;

    return new Promise((resolve, reject) => {
      db.query(query, [match_id, reader_id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // ===== GET UNREAD MESSAGE COUNT =====
  // Show notification badge with unread message count for a user
  static async getUnreadCount(user_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(DISTINCT em.match_id) as unread_chats,
          COUNT(em.id) as total_unread_messages
        FROM exchange_messages em
        JOIN exchange_matches ematch ON em.match_id = ematch.id
        WHERE em.is_read = 0 
          AND (ematch.proposer_id = ? OR ematch.receiver_id = ?)
          AND em.sender_id != ?
      `;

      db.query(query, [user_id, user_id, user_id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }

  // ===== GET RECENT CONVERSATIONS =====
  // Show farmers their recent chats (list of matches) with latest message
  static async getRecentChats(user_id, limit = 20) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          em.id as match_id,
          em.status,
          em.created_at as match_created,
          ce.offering_crop,
          ce.seeking_crop,
          CASE 
            WHEN em.proposer_id = ? THEN u_receiver.full_name
            ELSE u_proposer.full_name
          END as other_farmer_name,
          CASE 
            WHEN em.proposer_id = ? THEN u_receiver.id
            ELSE u_proposer.id
          END as other_farmer_id,
          CASE 
            WHEN em.proposer_id = ? THEN u_receiver.profile_pic
            ELSE u_proposer.profile_pic
          END as other_farmer_pic,
          (SELECT message FROM exchange_messages WHERE match_id = em.id ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM exchange_messages WHERE match_id = em.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
          COUNT(CASE WHEN emsg.is_read = 0 AND emsg.sender_id != ? THEN 1 END) as unread_count
        FROM exchange_matches em
        JOIN crop_exchanges ce ON em.exchange_listing_id = ce.id
        JOIN users u_proposer ON em.proposer_id = u_proposer.id
        JOIN users u_receiver ON em.receiver_id = u_receiver.id
        LEFT JOIN exchange_messages emsg ON em.id = emsg.match_id
        WHERE em.proposer_id = ? OR em.receiver_id = ?
        GROUP BY em.id
        ORDER BY last_message_time DESC
        LIMIT ?
      `;

      db.query(
        query,
        [user_id, user_id, user_id, user_id, user_id, user_id, limit],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }

  // ===== DELETE A MESSAGE =====
  // Retract a message if needed (before acceptance)
  static async delete(message_id) {
    const query = `DELETE FROM exchange_messages WHERE id = ?`;

    return new Promise((resolve, reject) => {
      db.query(query, [message_id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // ===== SEARCH MESSAGES =====
  // Search for keywords in chat history for a specific match
  static async searchInMatch(match_id, keyword) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          em.*,
          u.full_name as sender_name,
          u.profile_pic
        FROM exchange_messages em
        JOIN users u ON em.sender_id = u.id
        WHERE em.match_id = ? AND LOWER(em.message) LIKE LOWER(?)
        ORDER BY em.created_at DESC
      `;

      db.query(query, [match_id, `%${keyword}%`], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
}

module.exports = ExchangeMessage;
