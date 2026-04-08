// =====================================================
// Add Subcategories to Existing Categories
// =====================================================
// Run with: node add_subcategories.js

require("dotenv").config();
const db = require("./config/db");

// Map parent category names to subcategories
const SUBCATEGORIES = {
  "Fertilizers": [
    { name: "Organic Fertilizers", slug: "organic-fertilizers" },
    { name: "Chemical Fertilizers", slug: "chemical-fertilizers" },
    { name: "Biofertilizers", slug: "biofertilizers" },
    { name: "Micronutrients", slug: "micronutrients" },
  ],
  "Seeds": [
    { name: "Vegetable Seeds", slug: "vegetable-seeds" },
    { name: "Cereal Seeds", slug: "cereal-seeds" },
    { name: "Pulse Seeds", slug: "pulse-seeds" },
    { name: "Oilseed", slug: "oilseed" },
  ],
  "Irrigation": [
    { name: "Drip Irrigation", slug: "drip-irrigation" },
    { name: "Sprinkler Systems", slug: "sprinkler-systems" },
    { name: "Pipes & Fittings", slug: "pipes-fittings" },
    { name: "Irrigation Pumps", slug: "irrigation-pumps" },
  ],
  "Tools & Machinery": [
    { name: "Hand Tools", slug: "hand-tools" },
    { name: "Farm Machinery", slug: "farm-machinery" },
    { name: "Tractors & Parts", slug: "tractors-parts" },
    { name: "Harvesters", slug: "harvesters" },
  ],
  "Pesticides": [
    { name: "Insecticides", slug: "insecticides" },
    { name: "Fungicides", slug: "fungicides" },
    { name: "Herbicides", slug: "herbicides" },
    { name: "Growth Regulators", slug: "growth-regulators" },
  ],
  "Livestock Feed": [
    { name: "Cattle Feed", slug: "cattle-feed" },
    { name: "Poultry Feed", slug: "poultry-feed" },
    { name: "Feed Supplements", slug: "feed-supplements" },
    { name: "Mineral Supplements", slug: "mineral-supplements" },
  ],
};

async function addSubcategories() {
  try {
    console.log("📝 Adding subcategories...\n");

    for (const [parentName, subs] of Object.entries(SUBCATEGORIES)) {
      // Get parent category ID
      const [parents] = await db.query(
        `SELECT id FROM categories WHERE name = ? AND parent_id IS NULL`,
        [parentName]
      );

      if (parents.length === 0) {
        console.log(`❌ Parent category not found: ${parentName}`);
        continue;
      }

      const parentId = parents[0].id;
      console.log(`\n📦 ${parentName} (ID: ${parentId})`);

      // Add subcategories
      for (let i = 0; i < subs.length; i++) {
        const sub = subs[i];
        await db.query(
          `INSERT INTO categories (name, slug, parent_id, sort_order) 
           VALUES (?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order)`,
          [sub.name, sub.slug, parentId, i]
        );
        console.log(`   ✓ ${sub.name}`);
      }
    }

    console.log("\n✨ Subcategories added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding subcategories:", error.message);
    process.exit(1);
  }
}

addSubcategories();
