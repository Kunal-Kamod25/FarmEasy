// =====================================================
// ExchangeMatch Model
// =====================================================
// Handles proposals/matches between two farmers
// When Farmer B says "I want to exchange with Farmer A's listing"
// This creates a match record and allows negotiation via chat
// =====================================================

const db = require("../config/db");

class ExchangeMatch {
  // ===== CREATE NEW MATCH PROPOSAL =====
  // Farmer B proposes to exchange with Farmer A's listing
  static async create(data) {
    const {
      exchange_listing_id,
      proposer_id,
      receiver_id,
      match_reason,
    } = data;

    const query = `
      INSERT INTO exchange_matches 
      (exchange_listing_id, proposer_id, receiver_id, match_reason, status)
      VALUES (?, ?, ?, ?, 'pending')
    `;

    return new Promise((resolve, reject) => {
      db.query(
        query,
        [exchange_listing_id, proposer_id, receiver_id, match_reason],
        (err, result) => {
          if (err) reject(err);
          else resolve(result.insertId);
        }
      );
    });
  }

  // ===== GET MATCH DETAILS =====
  // Get full info about a match including both farmers' details
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          em.*,
          ce.offering_crop,
          ce.offering_quantity,
          ce.offering_unit,
          ce.seeking_crop,
          ce.seeking_quantity,
          ce.seeking_unit,
          ce.description as listing_description,
          u_proposer.full_name as proposer_name,
          u_proposer.email as proposer_email,
          u_proposer.phone_number as proposer_phone,
          u_proposer.city as proposer_city,
          u_proposer.state as proposer_state,
          u_proposer.profile_pic as proposer_pic,
          u_receiver.full_name as receiver_name,
          u_receiver.email as receiver_email,
          u_receiver.phone_number as receiver_phone,
          u_receiver.city as receiver_city,
          u_receiver.state as receiver_state,
          u_receiver.profile_pic as receiver_pic
        FROM exchange_matches em
        JOIN crop_exchanges ce ON em.exchange_listing_id = ce.id
        JOIN users u_proposer ON em.proposer_id = u_proposer.id
        JOIN users u_receiver ON em.receiver_id = u_receiver.id
        WHERE em.id = ?
      `;

      db.query(query, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0] || null);
      });
    });
  }

  // ===== GET ALL MATCHES FOR A LISTING =====
  // Farmer A sees all proposals made to their listing
  static async getByListingId(listing_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          em.*,
          u.full_name as proposer_name,
          u.city,
          u.state,
          u.profile_pic
        FROM exchange_matches em
        JOIN users u ON em.proposer_id = u.id
        WHERE em.exchange_listing_id = ?
        ORDER BY em.created_at DESC
      `;

      db.query(query, [listing_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // ===== GET USER'S RECEIVED MATCH PROPOSALS =====
  // All proposals received by this farmer (they're the receiver)
  static async getReceivedMatches(user_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          em.*,
          ce.offering_crop,
          ce.seeking_crop,
          u_proposer.full_name as proposer_name,
          u_proposer.profile_pic,
          u_proposer.city,
          u_proposer.state
        FROM exchange_matches em
        JOIN crop_exchanges ce ON em.exchange_listing_id = ce.id
        JOIN users u_proposer ON em.proposer_id = u_proposer.id
        WHERE em.receiver_id = ?
        ORDER BY em.created_at DESC
      `;

      db.query(query, [user_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // ===== GET USER'S SENT MATCH PROPOSALS =====
  // All proposals sent by this farmer (they're the proposer)
  static async getSentMatches(user_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          em.*,
          ce.offering_crop,
          ce.seeking_crop,
          u_receiver.full_name as receiver_name,
          u_receiver.profile_pic,
          u_receiver.city,
          u_receiver.state
        FROM exchange_matches em
        JOIN crop_exchanges ce ON em.exchange_listing_id = ce.id
        JOIN users u_receiver ON em.receiver_id = u_receiver.id
        WHERE em.proposer_id = ?
        ORDER BY em.created_at DESC
      `;

      db.query(query, [user_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // ===== UPDATE MATCH STATUS =====
  // Change from 'pending' → 'accepted' or 'rejected' or 'completed'
  static async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE exchange_matches 
        SET status = ?, updated_at = NOW() 
        WHERE id = ?
      `;

      db.query(query, [status, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // ===== UPDATE MATCH DETAILS =====
  // Negotiated exchange date and meetup location
  static async update(id, data) {
    const { exchange_date, location_agreed } = data;

    const query = `
      UPDATE exchange_matches 
      SET exchange_date = ?, location_agreed = ?, updated_at = NOW()
      WHERE id = ?
    `;

    return new Promise((resolve, reject) => {
      db.query(query, [exchange_date, location_agreed, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  // ===== CHECK IF MATCH ALREADY EXISTS =====
  // Prevent duplicate proposals for same listing by same farmer
  static async checkExists(listing_id, proposer_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id FROM exchange_matches 
        WHERE exchange_listing_id = ? 
          AND proposer_id = ? 
          AND status IN ('pending', 'accepted')
        LIMIT 1
      `;

      db.query(query, [listing_id, proposer_id], (err, results) => {
        if (err) reject(err);
        else resolve(results.length > 0);
      });
    });
  }

  // ===== GET ACTIVE MATCHES =====
  // Get all matches that are accepted (ongoing negotiations/completed)
  static async getActiveMatches(user_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT em.*, ce.offering_crop, ce.seeking_crop,
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
               END as other_farmer_pic
        FROM exchange_matches em
        JOIN crop_exchanges ce ON em.exchange_listing_id = ce.id
        JOIN users u_proposer ON em.proposer_id = u_proposer.id
        JOIN users u_receiver ON em.receiver_id = u_receiver.id
        WHERE (em.proposer_id = ? OR em.receiver_id = ?)
          AND em.status IN ('accepted', 'completed')
        ORDER BY em.updated_at DESC
      `;

      db.query(
        query,
        [user_id, user_id, user_id, user_id, user_id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  }

  // ===== GET MATCH STATS =====
  // Show productivity: total exchanges completed
  static async getStats(user_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_exchanges,
          COUNT(CASE WHEN status = 'accepted' THEN 1 END) as ongoing_exchanges,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_proposals
        FROM exchange_matches
        WHERE proposer_id = ? OR receiver_id = ?
      `;

      db.query(query, [user_id, user_id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }
}

module.exports = ExchangeMatch;
