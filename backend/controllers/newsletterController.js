const db = require("../config/db");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.subscribe = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        source VARCHAR(100) DEFAULT 'website-footer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await db.query(
      `
        INSERT INTO newsletter_subscriptions (email, source)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
          source = VALUES(source)
      `,
      [email, "website-footer"]
    );

    return res.status(200).json({
      success: true,
      message: "You are subscribed to the newsletter.",
    });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to subscribe. Please try again later.",
    });
  }
};
