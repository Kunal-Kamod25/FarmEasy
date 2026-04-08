// =====================================================
// Seed Brands Table with Default Brands
// =====================================================
// Run with: node seed_brands.js

require("dotenv").config();
const db = require("./config/db");

const BRANDS = [
  { name: "Syngenta", slug: "syngenta" },
  { name: "Bayer", slug: "bayer" },
  { name: "BASF", slug: "basf" },
  { name: "IFFCO", slug: "iffco" },
  { name: "Godrej", slug: "godrej" },
  { name: "Tata Rallis", slug: "tata-rallis" },
  { name: "UPL", slug: "upl" },
  { name: "PI Industries", slug: "pi-industries" },
  { name: "Mahyco", slug: "mahyco" },
  { name: "Nuziveedu", slug: "nuziveedu" },
];

async function seedBrands() {
  try {
    console.log("🏷️  Starting brands seed...");

    // Clear existing brands
    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    await db.query("TRUNCATE TABLE brands");
    await db.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("🗑️  Cleared existing brands");

    // Insert brands
    for (const brand of BRANDS) {
      await db.query(
        `INSERT INTO brands (name, slug) VALUES (?, ?)`,
        [brand.name, brand.slug]
      );
      console.log(`✅ Created brand: ${brand.name}`);
    }

    console.log("✨ Brand seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding brands:", error);
    process.exit(1);
  }
}

seedBrands();
