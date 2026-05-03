// ============================================================================
// Database Cleanup Script - Remove Test and Sayali Users
// ============================================================================
// This script removes:
// - All users with email containing "test" 
// - User "sayali" and all their associated data
// - All orders, cart items, reviews, wishlists, etc. for these users
// - Products created by these sellers
// 
// Run with: node backend/cleanup-test-users.js
// ============================================================================

const db = require("./config/db");

const cleanup = async () => {
  const connection = await db.getConnection();

  try {
    console.log("🗑️  Starting database cleanup...");

    // Find test and sayali users
    const [usersToDelete] = await connection.query(
      "SELECT id, full_name, email FROM users WHERE LOWER(email) LIKE ? OR LOWER(full_name) LIKE ? OR LOWER(email) LIKE ?",
      ["%test%", "%sayali%", "%demo%"]
    );

    if (usersToDelete.length === 0) {
      console.log("✅ No test or sayali users found. Database is clean.");
      connection.release();
      process.exit(0);
    }

    console.log(`\n📋 Found ${usersToDelete.length} user(s) to delete:`);
    usersToDelete.forEach((user) => {
      console.log(`   - ID: ${user.id}, Name: ${user.full_name}, Email: ${user.email}`);
    });

    const userIds = usersToDelete.map((u) => u.id);

    await connection.beginTransaction();

    // 1. Delete orders and related data for these users
    console.log("\n🗑️  Deleting orders...");
    const [orderResults] = await connection.query(
      "SELECT id FROM orders WHERE user_id IN (?)",
      [userIds]
    );
    const orderIds = orderResults.map((o) => o.id);

    if (orderIds.length > 0) {
      await connection.query("DELETE FROM payment WHERE order_id IN (?)", [orderIds]);
      await connection.query("DELETE FROM tracking WHERE order_id IN (?)", [orderIds]);
      await connection.query("DELETE FROM order_items WHERE order_id IN (?)", [orderIds]);
      await connection.query("DELETE FROM orders WHERE user_id IN (?)", [userIds]);
      console.log(`   ✓ Deleted ${orderIds.length} order(s) and related data`);
    }

    // 2. Delete cart items
    console.log("🗑️  Deleting cart items...");
    const [cartResults] = await connection.query("DELETE FROM cart WHERE user_id IN (?)", [userIds]);
    console.log(`   ✓ Deleted ${cartResults.affectedRows} cart item(s)`);

    // 3. Delete wishlists
    console.log("🗑️  Deleting wishlist items...");
    const [wishlistResults] = await connection.query("DELETE FROM wishlist WHERE user_id IN (?)", [userIds]);
    console.log(`   ✓ Deleted ${wishlistResults.affectedRows} wishlist item(s)`);

    // 4. Delete product reviews
    console.log("🗑️  Deleting product reviews...");
    try {
      const [reviewResults] = await connection.query("DELETE FROM product_review WHERE user_id IN (?)", [userIds]);
      console.log(`   ✓ Deleted ${reviewResults.affectedRows} review(s)`);
    } catch (e) {
      // Table might not exist, continue
      console.log(`   ℹ️  product_review table not found (skipped)`);
    }

    // 5. Delete product reviews (alternate table if exists)
    console.log("🗑️  Deleting reviews...");
    try {
      const [altReviewResults] = await connection.query("DELETE FROM review WHERE user_id IN (?)", [userIds]);
      console.log(`   ✓ Deleted ${altReviewResults.affectedRows} review(s) from review table`);
    } catch (e) {
      // Table might not exist, continue
      console.log(`   ℹ️  review table not found (skipped)`);
    }

    // 6. Delete products created by these sellers
    console.log("🗑️  Deleting seller products...");
    try {
      const [sellerResults] = await connection.query("SELECT id FROM seller WHERE user_id IN (?)", [userIds]);
      const sellerIds = sellerResults.map((s) => s.id);

      if (sellerIds.length > 0) {
        // Delete product reviews for seller's products
        const [sellerProducts] = await connection.query(
          "SELECT id FROM product WHERE seller_id IN (?)",
          [sellerIds]
        );
        const productIds = sellerProducts.map((p) => p.id);

        if (productIds.length > 0) {
          try {
            await connection.query("DELETE FROM product_review WHERE product_id IN (?)", [productIds]);
          } catch (e) {
            // Table might not exist
          }
          try {
            await connection.query("DELETE FROM wishlist WHERE product_id IN (?)", [productIds]);
          } catch (e) {
            // Table might not exist
          }
          await connection.query("DELETE FROM cart WHERE product_id IN (?)", [productIds]);
          await connection.query("DELETE FROM product WHERE id IN (?)", [productIds]);
          console.log(`   ✓ Deleted ${productIds.length} product(s) and related data`);
        }

        // Delete seller records
        await connection.query("DELETE FROM seller WHERE id IN (?)", [sellerIds]);
        console.log(`   ✓ Deleted ${sellerIds.length} seller record(s)`);
      }
    } catch (e) {
      console.log(`   ℹ️  No seller data found or error occurred (skipped)`);
    }

    // 7. Delete farmer records
    console.log("🗑️  Deleting farmer records...");
    try {
      const [farmerResults] = await connection.query("DELETE FROM farmer WHERE user_id IN (?)", [userIds]);
      console.log(`   ✓ Deleted ${farmerResults.affectedRows} farmer record(s)`);
    } catch (e) {
      console.log(`   ℹ️  farmer table error (skipped)`);
    }

    // 8. Delete notification records
    console.log("🗑️  Deleting notifications...");
    try {
      const [notifResults] = await connection.query("DELETE FROM notification WHERE user_id IN (?)", [userIds]);
      console.log(`   ✓ Deleted ${notifResults.affectedRows} notification(s)`);
    } catch (e) {
      // Table might not exist
    }

    // 9. Delete exchange-related data
    console.log("🗑️  Deleting exchange listings...");
    try {
      const [exchangeResults] = await connection.query("DELETE FROM exchange_listing WHERE user_id IN (?)", [userIds]);
      console.log(`   ✓ Deleted ${exchangeResults.affectedRows} exchange listing(s)`);
    } catch (e) {
      // Table might not exist
    }

    // 10. Finally, delete user records
    console.log("🗑️  Deleting user records...");
    const [userResults] = await connection.query("DELETE FROM users WHERE id IN (?)", [userIds]);
    console.log(`   ✓ Deleted ${userResults.affectedRows} user record(s)`);

    await connection.commit();

    console.log("\n✅ Cleanup completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Removed ${usersToDelete.length} user(s)`);
    console.log(`   - Removed ${orderIds.length} order(s)`);
    console.log(`   - All associated data cleaned up`);

    connection.release();
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error("\n❌ Error during cleanup:", error.message);
    console.error(error);
    connection.release();
    process.exit(1);
  }
};

cleanup();
