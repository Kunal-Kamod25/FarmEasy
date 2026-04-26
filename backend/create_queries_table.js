// One-time migration script to create the product_queries table
const db = require('./config/db');

async function createTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS product_queries (
        id INT NOT NULL AUTO_INCREMENT,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        query_text TEXT NOT NULL,
        answer_text TEXT DEFAULT NULL,
        answered_by INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_product_queries_product (product_id),
        KEY idx_product_queries_user (user_id),
        CONSTRAINT fk_pq_product FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
        CONSTRAINT fk_pq_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log('✅ product_queries table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    process.exit(1);
  }
}

createTable();
