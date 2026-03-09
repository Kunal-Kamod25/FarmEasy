// seed_sayali_products.js
// Run this script from the backend folder:  node seed_sayali_products.js
// It finds Sayali's seller account and inserts a bunch of real products for her
// so the frontend home page has actual data to show

const db = require("./config/db");

const seedProducts = async () => {
    try {
        console.log("🌱 Starting seed for Sayali's products...\n");

        // step 1 - find roshan's user account (checking by name, email contains roshan)
        const [users] = await db.query(`
      SELECT id, full_name, email FROM users 
      WHERE LOWER(full_name) LIKE '%sayali%' 
         OR LOWER(email) LIKE '%sayali%'
      LIMIT 1
    `);

        if (!users.length) {
            console.log("❌ Could not find user named 'Sayali'.");
            console.log("   Please check what name/email she used to register.");
            const [allUsers] = await db.query("SELECT id, full_name, email FROM users");
            console.log("\n👥 All users in DB:", allUsers);
            process.exit(1);
        }

        const sayali = users[0];
        console.log(`✅ Found user: ${sayali.full_name} (email: ${sayali.email}, id: ${sayali.id})`);

        // step 2 - find her seller record
        let [sellers] = await db.query(
            "SELECT id, shop_name FROM seller WHERE user_id = ?",
            [sayali.id]
        );

        let sellerId;

        if (!sellers.length) {
            // seller record doesn't exist yet - create one for her
            console.log("⚡ No seller record found. Creating one for Sayali...");
            const [result] = await db.query(
                `INSERT INTO seller (user_id, shop_name, gst_no) VALUES (?, ?, ?)`,
                [sayali.id, "Sayali AgriShop", "22BBBBB0000B1Z5"]
            );
            sellerId = result.insertId;
            console.log(`✅ Created seller record with id: ${sellerId}`);
        } else {
            sellerId = sellers[0].id;
            console.log(`✅ Found seller: ${sellers[0].shop_name} (seller_id: ${sellerId})`);
        }

        // step 3 - get all categories so we can assign proper category_id to each product
        const [categories] = await db.query("SELECT id, product_cat_name FROM product_category");
        console.log("\n📂 Available Categories:", categories.map(c => `${c.id}: ${c.product_cat_name}`).join(", "));

        // helper to find category id by name (partial match)
        const getCatId = (keyword) => {
            const match = categories.find(c =>
                c.product_cat_name.toLowerCase().includes(keyword.toLowerCase())
            );
            return match ? match.id : null;
        };

        // step 4 - define all the products to seed
        // using real farming product names to make it look authentic
        const products = [

            // ── FERTILIZERS ──
            { name: "Katyayani Humic + Fulvic Acid", desc: "100% organic humic and fulvic acid. Improves root growth, nutrient absorption and soil health. Suitable for all crops.", type: "Organic Fertilizer", price: 1140, qty: 85, category: "fertilizer" },
            { name: "IFFCO NPK 19:19:19 Water Soluble", desc: "Fully water soluble NPK fertilizer. Provides balanced nitrogen, phosphorus and potassium to all crops during entire growth period.", type: "Chemical Fertilizer", price: 320, qty: 200, category: "fertilizer" },
            { name: "Mangala DAP Fertilizer (50 Kg Bag)", desc: "Di-Ammonium Phosphate fertilizer for better root development and early growth. Best for sowing season application.", type: "Chemical Fertilizer", price: 1350, qty: 45, category: "fertilizer" },
            { name: "BioFert Organic Vermicompost", desc: "Premium quality vermicompost made from cow dung and organic waste. Improves soil texture, water holding capacity and microbial activity.", type: "Organic Fertilizer", price: 499, qty: 120, category: "fertilizer" },
            { name: "Coromandel Gromor 17:17:17 NPK", desc: "Complex NPK granular fertilizer suitable for vegetables, fruits and field crops. Promotes uniform growth.", type: "Chemical Fertilizer", price: 780, qty: 60, category: "fertilizer" },

            // ── SEEDS ──
            { name: "Saaho TO-3251 Tomato Seeds (10g)", desc: "High-yield hybrid tomato variety. Disease resistant, good shelf life. Suitable for both kharif and rabi seasons.", type: "Vegetable Seeds", price: 285, qty: 300, category: "seed" },
            { name: "Mahyco Hybrid Wheat Seeds (5 Kg)", desc: "High yielding wheat variety for Rabi season. Good tolerance to rust and powdery mildew diseases.", type: "Cereal Seeds", price: 850, qty: 95, category: "seed" },
            { name: "Pioneer P3396 Corn/Maize Seeds", desc: "High performance single cross hybrid corn. Yields up to 9 tonnes per hectare. Good husk cover and standability.", type: "Cereal Seeds", price: 1800, qty: 75, category: "seed" },
            { name: "Syngenta NK6240 Cabbage Seeds", desc: "Round head cabbage variety. Suitable for all seasons. Uniform maturity, crisp texture, highly disease resistant.", type: "Vegetable Seeds", price: 450, qty: 180, category: "seed" },
            { name: "Nunhems Palak Spinach Seeds (500g)", desc: "Smooth leaf spinach variety. Fast growing, dark green color. Ready to harvest in 30-35 days. High yield and nutritious.", type: "Leafy Veg Seeds", price: 199, qty: 210, category: "seed" },

            // ── PESTICIDES ──
            { name: "Coragen 18.5% SC Insecticide (60ml)", desc: "Broad spectrum insecticide by FMC. Controls stem borers, leaf folders in paddy. Long residual activity, safe for natural enemies.", type: "Insecticide", price: 1650, qty: 55, category: "pesticide" },
            { name: "Roundup Ready Herbicide (1 Litre)", desc: "Non-selective systemic herbicide. Controls grasses and broad-leaf weeds. Used for pre-planting weed control in all fields.", type: "Herbicide", price: 850, qty: 88, category: "pesticide" },
            { name: "Karate 5% EC Insecticide (250ml)", desc: "Contact and stomach poison insecticide. Controls a wide range of pests on cotton, rice, vegetables and fruit crops.", type: "Insecticide", price: 420, qty: 110, category: "pesticide" },
            { name: "Organic Neem Oil Spray (1L)", desc: "100% pure cold-pressed neem oil. Effective against aphids, mites, whitefly and other pests. Safe for organic farming.", type: "Organic Pesticide", price: 380, qty: 145, category: "pesticide" },

            // ── EQUIPMENT ──
            { name: "Neptune Battery Sprayer 16L", desc: "Rechargeable lithium battery knapsack sprayer. 4 nozzle types included. 2 hour charge = 8 hours operation. Adjustable wand.", type: "Sprayer", price: 4200, qty: 22, category: "equipment" },
            { name: "Honda WB20 Water Pump (2 inch)", desc: "Petrol start water pumpset for irrigation and drainage. Self-priming, suitable for clean water. High flow rate 600 LPM.", type: "Water Pump", price: 18500, qty: 8, category: "equipment" },
            { name: "VST Shakti 130 DI Power Tiller", desc: "13HP single cylinder diesel power tiller for small to medium farms. Attachments available. Trusted by farmers across India.", type: "Power Tiller", price: 185000, qty: 3, category: "equipment" },

            // ── IRRIGATION ──
            { name: "Jain Drip Irrigation Kit (1 Acre)", desc: "Complete drip irrigation starter kit for 1 acre. Includes lateral pipes, drippers, filter, control valve and all fittings.", type: "Drip Irrigation", price: 8500, qty: 18, category: "irrigation" },
            { name: "Netafim Drip Tape 16mm (1000m Roll)", desc: "Premium quality drip tape for row crops. 30cm dripper spacing, 1.6 LPH flow rate. Durable, UV stabilized, 3 year warranty.", type: "Drip Tape", price: 4500, qty: 35, category: "irrigation" },
            { name: "Rain Bird Sprinkler System Set", desc: "Complete garden sprinkler set with 4 pop-up sprinklers and connectors. Covers up to 400 sq ft. Ideal for lawns and gardens.", type: "Sprinkler", price: 1200, qty: 52, category: "irrigation" },

            // ── TOOLS ──
            { name: "Tata Agrico Heavy Duty Shovel", desc: "Forged steel blade with hardwood handle. Rust resistant. Ideal for digging, lifting and turning soil. Professional grade tool.", type: "Digging Tool", price: 650, qty: 70, category: "tools" },
            { name: "Falcon FPP-1205 Pruning Shears", desc: "Professional bypass pruner. Rust resistant SK5 steel blade. Comfortable grip handle. Cuts branches up to 20mm diameter.", type: "Pruning Tool", price: 350, qty: 95, category: "tools" },
            { name: "Garden Rake 16-Tine (Steel)", desc: "Heavy duty 16 tine steel fan rake. Great for clearing leaves, leveling soil and cleaning garden beds. Lightweight alloy handle.", type: "Garden Tool", price: 480, qty: 80, category: "tools" },

            // ── ANIMAL FEED ──
            { name: "Pedigree Adult Dog Food - Chicken (10Kg)", desc: "Complete balanced nutrition for adult dogs. Contains chicken and vegetables. Supports healthy digestion, skin and coat.", type: "Dog Food", price: 2200, qty: 40, category: "animal" },
            { name: "Godrej Agrovet Cattle Feed (40 Kg)", desc: "Balanced cattle feed for dairy cows. Supports high milk production, good body condition and overall health of livestock.", type: "Cattle Feed", price: 1450, qty: 30, category: "animal" },
        ];

        // step 5 - delete any old products from sayali to avoid duplicates on re-run
        const [existing] = await db.query(
            "SELECT COUNT(*) as count FROM product WHERE seller_id = ?",
            [sellerId]
        );

        if (existing[0].count > 0) {
            console.log(`\n⚠️  Found ${existing[0].count} existing products for this seller. Deleting old ones first...`);
            await db.query("DELETE FROM product WHERE seller_id = ?", [sellerId]);
            console.log("✅ Old products cleared.");
        }

        // step 6 - insert each product
        let insertedCount = 0;
        let skippedCount = 0;

        for (const p of products) {
            const catId = getCatId(p.category);

            if (!catId) {
                console.log(`Skipping "${p.name}" — no matching category found for "${p.category}"`);
                skippedCount++;
                continue;
            }

            await db.query(`
        INSERT INTO product 
          (product_name, product_description, product_type, price, category_id, product_quantity, seller_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [p.name, p.desc, p.type, p.price, catId, p.qty, sellerId]);

            console.log(` Inserted: ${p.name} (₹${p.price}, qty: ${p.qty})`);
            insertedCount++;
        }

        console.log(`\n🎉 Done! Inserted ${insertedCount} products, skipped ${skippedCount}.`);
        console.log(`   All products are linked to seller_id: ${sellerId}`);
        console.log(`\n   Go to the frontend now — refresh the /products page and you'll see all products!\n`);

        process.exit(0);

    } catch (err) {
        console.error("\nSeed script failed:", err.message);
        console.error(err);
        process.exit(1);
    }
};

seedProducts();
