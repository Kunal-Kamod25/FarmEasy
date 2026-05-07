const db = require("./config/db");

async function analyze() {
  try {
    const [allProducts] = await db.query("SELECT id, product_image, category_id, seller_id FROM product");
    const withImages = allProducts.filter(p => p.product_image && p.product_image.trim() !== "");
    const withoutImages = allProducts.filter(p => !p.product_image || p.product_image.trim() === "");

    console.log(`Total Products: ${allProducts.length}`);
    console.log(`Products with Images: ${withImages.length}`);
    console.log(`Products without Images: ${withoutImages.length}`);

    const categories = [...new Set(allProducts.map(p => p.category_id))];
    const sellers = [...new Set(allProducts.map(p => p.seller_id))];

    console.log(`Unique Categories: ${categories.length}`);
    console.log(`Unique Sellers: ${sellers.length}`);

  } catch (error) {
    console.error("Analysis failed:", error);
  } finally {
    process.exit();
  }
}

analyze();
