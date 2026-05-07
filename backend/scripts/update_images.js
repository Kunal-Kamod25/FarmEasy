require('dotenv').config({ path: 'backend/.env' });
const db = require('../config/db');

async function updateProductImages() {
  try {
    const mappings = [
      { name: 'Seeds', path: '/uploads/products/seeds_placeholder.png' },
      { name: 'Fertilizers', path: '/uploads/products/fertilizers_placeholder.png' },
      { name: 'Farming Tools', path: '/uploads/products/tools_placeholder.png' },
      { name: 'Irrigation', path: '/uploads/products/irrigation_placeholder.png' },
      { name: 'Pesticides', path: '/uploads/products/pesticides_placeholder.png' }
    ];

    for (const map of mappings) {
      // 1. Get category ID and its children
      const [cats] = await db.query("SELECT id FROM categories WHERE name = ?", [map.name]);
      if (cats.length > 0) {
        const catId = cats[0].id;
        const [subCats] = await db.query("SELECT id FROM categories WHERE parent_id = ?", [catId]);
        const allIds = [catId, ...subCats.map(c => c.id)];

        // 2. Update products in these categories if they don't have an image already (or update all to make it consistent)
        await db.query(
          "UPDATE product SET product_image = ? WHERE category_id IN (?)",
          [map.path, allIds]
        );
        console.log(`Updated images for ${map.name} category.`);
      }
    }

    console.log("All product images updated successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to update product images:", err);
    process.exit(1);
  }
}

updateProductImages();
