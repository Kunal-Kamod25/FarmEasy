// =====================================================
// SEED CATEGORIES & SUBCATEGORIES
// =====================================================
// Adds all main categories and subcategories
// Usage: node scripts/seed-categories.js
// =====================================================

require("dotenv").config();
const db = require("../config/db");

const categoriesData = [
  {
    name: "Irrigation",
    description: "Irrigation systems, pumps, and water management tools",
    slug: "irrigation",
    subcategories: [
      { name: "Drip Irrigation", description: "Drip systems for precise watering" },
      { name: "Sprinklers", description: "Sprinkler systems and nozzles" },
      { name: "Water Pumps", description: "Electric and diesel water pumps" },
      { name: "Pipes & Fittings", description: "PVC and metal pipes, connectors, fittings" },
      { name: "Water Tanks", description: "Storage tanks for water collection" },
      { name: "Micro Irrigation", description: "Micro sprinklers and emitters" },
    ],
  },
  {
    name: "Seeds",
    description: "High-quality vegetable, crop, and flower seeds",
    slug: "seeds",
    subcategories: [
      { name: "Vegetable Seeds", description: "Tomato, carrot, onion, and other vegetables" },
      { name: "Crop Seeds", description: "Wheat, rice, maize, pulses, and cereals" },
      { name: "Fruit Seeds", description: "Melon, pumpkin, watermelon, and fruit seeds" },
      { name: "Flower Seeds", description: "Ornamental and decorative flower seeds" },
      { name: "Herb Seeds", description: "Medicinal and culinary herb seeds" },
      { name: "Hybrid Seeds", description: "High-yield hybrid crop seeds" },
    ],
  },
  {
    name: "Fertilizers",
    description: "Organic and chemical fertilizers for crop nutrition",
    slug: "fertilizers",
    subcategories: [
      { name: "Organic Fertilizers", description: "Compost, manure, and bio-fertilizers" },
      { name: "Chemical Fertilizers", description: "NPK, DAP, urea, and other chemical fertilizers" },
      { name: "Biofertilizers", description: "Azospirillum, Azotobacter, and nitrogen fixers" },
      { name: "Micronutrients", description: "Zinc, iron, copper, and trace elements" },
      { name: "Humic Acid", description: "Humic acid and seaweed extracts" },
      { name: "Vermicompost", description: "Worm compost and vermicompost products" },
    ],
  },
  {
    name: "Pesticides",
    description: "Organic and chemical pest control solutions",
    slug: "pesticides",
    subcategories: [
      { name: "Insecticides", description: "Organic and chemical insect control" },
      { name: "Fungicides", description: "Disease control and fungal treatments" },
      { name: "Herbicides", description: "Weed control solutions" },
      { name: "Biopesticides", description: "Neem oil, spinosad, and organic alternatives" },
      { name: "Rodenticides", description: "Rodent and pest control" },
      { name: "Plant Growth Regulators", description: "Growth promoters and regulators" },
    ],
  },
  {
    name: "Tools",
    description: "Agricultural tools and equipment for farming",
    slug: "tools",
    subcategories: [
      { name: "Hand Tools", description: "Shovels, spades, forks, and hand tools" },
      { name: "Pruning Tools", description: "Pruners, shears, and cutting tools" },
      { name: "Soil Testing Kits", description: "pH meters, soil test kits, and moisture meters" },
      { name: "Sprayers", description: "Knapsack sprayers, power sprayers, and foggers" },
      { name: "Garden Machinery", description: "Tillers, cultivators, and power tools" },
      { name: "Safety Equipment", description: "Gloves, masks, helmets, and protective gear" },
    ],
  },
];

async function seedCategories() {
  try {
    console.log("\n🌱 Starting categories & subcategories seeding...\n");

    for (const category of categoriesData) {
      try {
        // Insert main category into `categories` table
        const [catResult] = await db.query(
          "INSERT INTO categories (name, description, slug, sort_order) VALUES (?, ?, ?, ?)",
          [category.name, category.description, category.slug, 0]
        );

        const categoryId = catResult.insertId;
        console.log(`✅ Added Category: ${category.name} (ID: ${categoryId})`);

        // Insert subcategories into the SAME `categories` table with parent_id
        for (const sub of category.subcategories) {
          const subSlug = sub.name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
          await db.query(
            "INSERT INTO categories (name, description, slug, parent_id, sort_order) VALUES (?, ?, ?, ?, ?)",
            [sub.name, sub.description, subSlug, categoryId, 0]
          );
          console.log(`   └─ ✅ Subcategory: ${sub.name}`);
        }

        console.log("");
      } catch (err) {
        console.error(`❌ Failed to add ${category.name}:`, err.message);
      }
    }

    console.log(`✅ Seeding complete!\n`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

seedCategories();
