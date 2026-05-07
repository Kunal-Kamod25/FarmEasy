require('dotenv').config({ path: 'backend/.env' });
const db = require('../config/db');

async function fixSeedsAndFertilizers() {
  try {
    // 1. Fix Seeds
    const [seedsCat] = await db.query("SELECT id FROM categories WHERE name = 'Seeds'");
    if (seedsCat.length > 0) {
      const seedsId = seedsCat[0].id;
      const [seedsSubCats] = await db.query("SELECT id FROM categories WHERE parent_id = ?", [seedsId]);
      const seedsCatIds = [seedsId, ...seedsSubCats.map(c => c.id)];

      const [seedProducts] = await db.query("SELECT id, product_name FROM product WHERE category_id IN (?)", [seedsCatIds]);
      const seedBrands = ['Mahyco', 'Kaveri Seeds', 'Pioneer', 'Nuziveedu', 'Rasi Seeds', 'Syngenta', 'Bayer CropScience'];
      const seedWeights = ['500g', '1kg', '2kg', '5kg', '10kg'];

      for (const prod of seedProducts) {
        const brand = seedBrands[Math.floor(Math.random() * seedBrands.length)];
        const weight = seedWeights[Math.floor(Math.random() * seedWeights.length)];
        const cleanName = prod.product_name.split(' (')[0]; // Remove previous weight if exists
        const newName = `${cleanName} (${weight})`;
        
        await db.query(
          "UPDATE product SET brand = ?, product_name = ?, product_description = ? WHERE id = ?",
          [brand, newName, `High-yield ${cleanName} seeds from ${brand}. Net weight: ${weight}. Specially treated for better germination.`, prod.id]
        );
      }
      console.log(`Updated ${seedProducts.length} seed products.`);
    }

    // 2. Fix Fertilizers
    const [fertCat] = await db.query("SELECT id FROM categories WHERE name = 'Fertilizers'");
    if (fertCat.length > 0) {
      const fertId = fertCat[0].id;
      const [fertSubCats] = await db.query("SELECT id FROM categories WHERE parent_id = ?", [fertId]);
      const fertCatIds = [fertId, ...fertSubCats.map(c => c.id)];

      const [fertProducts] = await db.query("SELECT id, product_name FROM product WHERE category_id IN (?)", [fertCatIds]);
      const fertBrands = ['IFFCO', 'KRIBHCO', 'Chambal Fertilisers', 'Coromandel', 'Zuari Agro', 'Yara'];
      const fertWeights = ['10kg', '25kg', '50kg', '1kg Bag', '5kg Bucket'];

      for (const prod of fertProducts) {
        const brand = fertBrands[Math.floor(Math.random() * fertBrands.length)];
        const weight = fertWeights[Math.floor(Math.random() * fertWeights.length)];
        const cleanName = prod.product_name.split(' (')[0];
        const newName = `${cleanName} (${weight})`;
        
        await db.query(
          "UPDATE product SET brand = ?, product_name = ?, product_description = ? WHERE id = ?",
          [brand, newName, `Premium ${cleanName} from ${brand}. Balanced nutrients for maximum crop yield. Net weight: ${weight}.`, prod.id]
        );
      }
      console.log(`Updated ${fertProducts.length} fertilizer products.`);
    }

    console.log(`Update complete.`);
    process.exit(0);
  } catch (err) {
    console.error("Failed to fix data:", err);
    process.exit(1);
  }
}

fixSeedsAndFertilizers();
