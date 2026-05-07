const db = require("../config/db");

async function cleanup() {
  try {
    console.log("🚀 Starting Product Cleanup...");

    // 1. Fetch all products
    const [allProducts] = await db.query("SELECT id, product_image, category_id, seller_id FROM product");
    console.log(`📊 Current total products: ${allProducts.length}`);

    // 2. Identify products with images (Mandatory Keep)
    const withImages = allProducts.filter(p => p.product_image && p.product_image.trim() !== "");
    console.log(`🖼️ Products with images: ${withImages.length}`);

    const keepIds = new Set(withImages.map(p => p.id));
    const targetTotal = 100;
    let remainingSlots = targetTotal - keepIds.size;

    if (remainingSlots > 0) {
      console.log(`🔍 Selecting ${remainingSlots} more products to reach ${targetTotal}...`);

      // 3. Group products without images by category
      const withoutImages = allProducts.filter(p => !keepIds.has(p.id));
      const byCategory = {};
      withoutImages.forEach(p => {
        if (!byCategory[p.category_id]) byCategory[p.category_id] = [];
        byCategory[p.category_id].push(p);
      });

      const categories = Object.keys(byCategory);
      console.log(`📂 Categories to pick from: ${categories.length}`);

      // 4. Round-robin selection across categories
      let index = 0;
      while (remainingSlots > 0 && categories.length > 0) {
        const catId = categories[index % categories.length];
        const catProducts = byCategory[catId];

        if (catProducts && catProducts.length > 0) {
          const picked = catProducts.pop();
          keepIds.add(picked.id);
          remainingSlots--;
        } else {
          // Remove category if no more products
          categories.splice(index % categories.length, 1);
          if (categories.length === 0) break;
          // Don't increment index so we check the new item at this position
          continue; 
        }
        index++;
      }
    }

    console.log(`✅ Selected ${keepIds.size} products to keep.`);

    // 5. Delete products NOT in the keep list
    const allIds = allProducts.map(p => p.id);
    const deleteIds = allIds.filter(id => !keepIds.has(id));

    if (deleteIds.length > 0) {
      console.log(`🗑️ Deleting ${deleteIds.length} products...`);
      
      // We'll delete in batches to be safe, although MySQL can handle a large IN clause
      const batchSize = 50;
      for (let i = 0; i < deleteIds.length; i += batchSize) {
        const batch = deleteIds.slice(i, i + batchSize);
        await db.query("DELETE FROM product WHERE id IN (?)", [batch]);
        console.log(`   Deleted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(deleteIds.length/batchSize)}`);
      }
    } else {
      console.log("✨ No products to delete.");
    }

    // 6. Final Verification
    const [finalCount] = await db.query("SELECT COUNT(*) as count FROM product");
    console.log(`🏁 Cleanup complete! Final product count: ${finalCount[0].count}`);

  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  } finally {
    process.exit();
  }
}

cleanup();
