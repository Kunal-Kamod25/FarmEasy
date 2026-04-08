// =====================================================
// Seed Categories Table with Main Categories
// =====================================================
// Run with: node seed_categories.js

require("dotenv").config();
const db = require("./config/db");

const CATEGORIES = [
  {
    name: "Fertilizers",
    slug: "fertilizers",
    icon: "🌾",
    subcategories: [
      { name: "Organic Fertilizers", slug: "organic-fertilizers" },
      { name: "Chemical Fertilizers", slug: "chemical-fertilizers" },
      { name: "Biofertilizers", slug: "biofertilizers" },
    ],
  },
  {
    name: "Seeds",
    slug: "seeds",
    icon: "🌱",
    subcategories: [
      { name: "Vegetable Seeds", slug: "vegetable-seeds" },
      { name: "Cereal Seeds", slug: "cereal-seeds" },
      { name: "Pulse Seeds", slug: "pulse-seeds" },
    ],
  },
  {
    name: "Irrigation",
    slug: "irrigation",
    icon: "💧",
    subcategories: [
      { name: "Drip Irrigation", slug: "drip-irrigation" },
      { name: "Sprinkler Systems", slug: "sprinkler-systems" },
      { name: "Pipes & Fittings", slug: "pipes-fittings" },
    ],
  },
  {
    name: "Tools & Machinery",
    slug: "tools-machinery",
    icon: "⚙️",
    subcategories: [
      { name: "Hand Tools", slug: "hand-tools" },
      { name: "Farm Machinery", slug: "farm-machinery" },
      { name: "Tractors & Parts", slug: "tractors-parts" },
    ],
  },
  {
    name: "Pesticides",
    slug: "pesticides",
    icon: "🔬",
    subcategories: [
      { name: "Insecticides", slug: "insecticides" },
      { name: "Fungicides", slug: "fungicides" },
      { name: "Herbicides", slug: "herbicides" },
    ],
  },
  {
    name: "Livestock Feed",
    slug: "livestock-feed",
    icon: "🐄",
    subcategories: [
      { name: "Cattle Feed", slug: "cattle-feed" },
      { name: "Poultry Feed", slug: "poultry-feed" },
      { name: "Feed Supplements", slug: "feed-supplements" },
    ],
  },
];

async function seedCategories() {
  try {
    console.log("🌱 Starting category seed...");

    // Clear existing categories
    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    await db.query("TRUNCATE TABLE categories");
    await db.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("🗑️  Cleared existing categories");

    let sortOrder = 0;

    // Insert parent categories with subcategories
    for (const cat of CATEGORIES) {
      const [result] = await db.query(
        `INSERT INTO categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?)`,
        [cat.name, cat.slug, cat.icon, sortOrder++]
      );
      const parentId = result.insertId;
      console.log(`✅ Created parent category: ${cat.name} (ID: ${parentId})`);

      // Insert subcategories
      let subSortOrder = 0;
      for (const sub of cat.subcategories) {
        await db.query(
          `INSERT INTO categories (name, slug, parent_id, sort_order) VALUES (?, ?, ?, ?)`,
          [sub.name, sub.slug, parentId, subSortOrder++]
        );
        console.log(`   ✓ Created subcategory: ${sub.name}`);
      }
    }

    console.log("✨ Category seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
