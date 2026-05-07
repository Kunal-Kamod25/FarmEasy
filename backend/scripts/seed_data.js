require('dotenv').config({ path: 'backend/.env' });
const db = require('../config/db');

async function seed() {
  try {
    console.log("Checking vendors...");
    const emails = [
      'kunalkamod3@gmail.com',
      'aniketsjadhav567@gmail.com',
      'vishal423206@gmail.com'
    ];

    const [users] = await db.query(
      "SELECT id, email FROM users WHERE email IN (?)",
      [emails]
    );

    console.log("Found users:", users);

    const userIds = users.map(u => u.id);
    if (userIds.length === 0) {
      console.error("No vendors found with those emails. Please ensure they are registered.");
      process.exit(1);
    }

    const [sellers] = await db.query(
      "SELECT id, user_id FROM seller WHERE user_id IN (?)",
      [userIds]
    );

    console.log("Found sellers:", sellers);

    // Map email to seller_id and user_id
    const vendorMap = {};
    users.forEach(u => {
      const s = sellers.find(sel => sel.user_id === u.id);
      if (s) {
        vendorMap[u.email] = {
          sellerId: s.id,
          userId: u.id
        };
      }
    });

    const vendorEmails = Object.keys(vendorMap);
    if (vendorEmails.length < 3) {
      console.error("One or more vendors missing from seller table.");
      // process.exit(1); 
    }

    // Categories structure
    const data = [
      {
        name: 'Farming Tools',
        subcategories: [
          { name: 'Hand Tools', items: ['Garden Hoe', 'Hand Rake', 'Pruning Shears', 'Digging Fork', 'Hand Trowel'] },
          { name: 'Power Tools', items: ['Electric Tiller', 'Brush Cutter', 'Chainsaw', 'Leaf Blower', 'Power Weeder'] },
          { name: 'Harvesting Tools', items: ['Sickle', 'Fruit Picker', 'Scythe', 'Corn Husker', 'Grape Snips'] },
          { name: 'Planting Tools', items: ['Seed Drill', 'Dibber', 'Transplanter', 'Bulb Planter', 'Seed Tray'] },
          { name: 'Soil Testing', items: ['pH Meter', 'Moisture Sensor', 'NPK Test Kit', 'EC Meter', 'Soil Sampler'] }
        ]
      },
      {
        name: 'Fertilizers',
        subcategories: [
          { name: 'Organic', items: ['Compost', 'Bone Meal', 'Fish Emulsion', 'Blood Meal', 'Worm Castings'] },
          { name: 'Inorganic', items: ['Urea', 'DAP', 'Potash', 'NPK 19-19-19', 'Super Phosphate'] },
          { name: 'Bio-Fertilizers', items: ['Rhizobium', 'Azotobacter', 'PSB', 'VAM', 'Acetobacter'] },
          { name: 'Liquid Fertilizers', items: ['Seaweed Extract', 'Humic Acid', 'Micro-nutrients', 'Amino Acid', 'Fulvic Acid'] },
          { name: 'Slow Release', items: ['Polymer Coated Urea', 'Rock Phosphate', 'Sulfur Coated', 'Neem Coated Urea', 'Organic Granules'] }
        ]
      },
      {
        name: 'Irrigation',
        subcategories: [
          { name: 'Drip Irrigation', items: ['Drip Emitter', 'Drip Tape', 'Pressure Regulator', 'Main Line Pipe', 'Drip Punch'] },
          { name: 'Sprinkler System', items: ['Impact Sprinkler', 'Pop-up Sprinkler', 'Rain Gun', 'Fogger', 'Mister'] },
          { name: 'Pumps', items: ['Submersible Pump', 'Centrifugal Pump', 'Solar Pump', 'Monoblock Pump', 'Hand Pump'] },
          { name: 'Valves & Fittings', items: ['Solenoid Valve', 'Ball Valve', 'T-Joint', 'Elbow Connector', 'Venturi Injector'] },
          { name: 'Controllers', items: ['WiFi Timer', 'Sensor Unit', 'Master Control', 'Flow Meter', 'Auto-start'] }
        ]
      },
      {
        name: 'Pesticides',
        subcategories: [
          { name: 'Insecticides', items: ['Neem Oil', 'Malathion', 'Imidacloprid', 'Cypermethrin', 'Abamectin'] },
          { name: 'Herbicides', items: ['Glyphosate', 'Atrazine', 'Paraquat', '2,4-D', 'Pendimethalin'] },
          { name: 'Fungicides', items: ['Mancozeb', 'Sulfur Dust', 'Copper Oxychloride', 'Carbendazim', 'Hexaconazole'] },
          { name: 'Rodenticides', items: ['Zinc Phosphide', 'Bromadiolone', 'Trap Box', 'Rat Glue', 'Aluminum Phosphide'] },
          { name: 'Bio-Pesticides', items: ['Bacillus Thuringiensis', 'Trichoderma', 'Beauveria Bassiana', 'Metarhizium', 'Verticillium'] }
        ]
      }
    ];

    const vendorDetails = Object.values(vendorMap);
    let vendorIdx = 0;
    const addedProductIds = [];

    console.log("Starting seeding process...");

    for (const mainCat of data) {
      // 1. Ensure Main Category exists
      const [mainRows] = await db.query("SELECT id FROM categories WHERE name = ? AND parent_id IS NULL", [mainCat.name]);
      let mainId;
      if (mainRows.length === 0) {
        const [res] = await db.query("INSERT INTO categories (name, slug) VALUES (?, ?)", [mainCat.name, mainCat.name.toLowerCase().replace(/ /g, '-')]);
        mainId = res.insertId;
      } else {
        mainId = mainRows[0].id;
      }

      console.log(`Processing Main Category: ${mainCat.name} (ID: ${mainId})`);

      for (const subCat of mainCat.subcategories) {
        // 2. Ensure Subcategory exists
        const [subRows] = await db.query("SELECT id FROM categories WHERE name = ? AND parent_id = ?", [subCat.name, mainId]);
        let subId;
        if (subRows.length === 0) {
          const [res] = await db.query("INSERT INTO categories (name, parent_id, slug) VALUES (?, ?, ?)", [subCat.name, mainId, subCat.name.toLowerCase().replace(/ /g, '-')]);
          subId = res.insertId;
        } else {
          subId = subRows[0].id;
        }

        console.log(`  Processing Subcategory: ${subCat.name} (ID: ${subId})`);

        // 3. Add Products (3 items per subcategory as per request)
        const itemsToProcess = subCat.items.slice(0, 3);
        for (const itemName of itemsToProcess) {
          const vendor = vendorDetails[vendorIdx % vendorDetails.length];
          const sellerId = vendor.sellerId;
          const price = Math.floor(Math.random() * 2000) + 500;
          const quantity = Math.floor(Math.random() * (263 - 100 + 1)) + 100;
          
          const [prodRes] = await db.query(
            `INSERT INTO product (
              product_name, product_description, price, product_quantity, 
              category_id, seller_id, product_type, brand
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              itemName, 
              `Premium quality ${itemName} designed for high-yield farming and durable performance. Trusted by professionals.`,
              price,
              quantity,
              subId,
              sellerId,
              subCat.name,
              ['TATA', 'Mahindra Ag', 'Bayer', 'Syngenta', 'John Deere', 'Kirloskar', 'Falcon'][Math.floor(Math.random() * 7)]
            ]
          );
          addedProductIds.push({ id: prodRes.insertId, sellerUserId: vendor.userId });
          vendorIdx++;
        }
      }
    }

    console.log(`Added ${addedProductIds.length} products. Now adding reviews...`);

    // 4. Add Reviews
    // For each product, add 1-2 random reviews from OTHER vendors
    const comments = [
      "Excellent quality! Highly recommended for all farmers.",
      "Very durable and works as advertised. Five stars!",
      "Good value for money. Delivery was prompt.",
      "Premium build quality. Makes my farm work much easier.",
      "The best in its class. Using it for a month now, no issues.",
      "Impressive performance. Solid packaging too.",
      "Reliable brand and high-quality material used.",
      "Satisfied with the purchase. Will buy again."
    ];

    for (const prod of addedProductIds) {
      // Pick a random vendor that IS NOT the seller of this product
      const otherVendors = vendorDetails.filter(v => v.userId !== prod.sellerUserId);
      if (otherVendors.length > 0) {
        const reviewer = otherVendors[Math.floor(Math.random() * otherVendors.length)];
        const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 star reviews
        const comment = comments[Math.floor(Math.random() * comments.length)];

        await db.query(
          "INSERT INTO review_rating (product_id, user_id, rating, comments) VALUES (?, ?, ?, ?)",
          [prod.id, reviewer.userId, rating, comment]
        );
      }
    }

    console.log("Seeding complete successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
