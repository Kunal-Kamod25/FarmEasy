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

    const [users] = await db.query("SELECT id, email FROM users WHERE email IN (?)", [emails]);
    const [sellers] = await db.query("SELECT id, user_id FROM seller WHERE user_id IN (?)", [users.map(u => u.id)]);

    const vendorDetails = users.map(u => ({
      sellerId: sellers.find(s => s.user_id === u.id)?.id,
      userId: u.id
    })).filter(v => v.sellerId);

    if (vendorDetails.length < 3) {
      console.error("Missing vendor data in DB.");
      process.exit(1);
    }

    const data = [
      {
        name: 'Farming Tools',
        subcategories: [
          { name: 'Hand Tools', items: ['Hand Hoe Heavy Duty', 'Stainless Steel Rake', 'Bypass Pruner', 'Border Spade', 'Hand Cultivator', 'Garden Knife', 'Grass Slasher', 'Hand Weeder', 'Trowel Pro', 'Leaf Rake Aluminum'] },
          { name: 'Power Tools', items: ['Gasoline Tiller 7HP', 'Electric Hedge Trimmer', 'Chainsaw 20 inch', 'Backpack Blower', 'Power Weeder 5HP', 'Electric Lawn Mower', 'Earth Auger', 'Mist Blower Power', 'Pressure Washer Agri', 'Battery Operated Sprayer'] },
          { name: 'Harvesting Tools', items: ['Curved Sickle', 'Telescopic Fruit Picker', 'Scythe Steel', 'Corn Sheller Hand', 'Grape Harvesting Knife', 'Tea Plucking Machine', 'Potato Digger', 'Onion Harvester', 'Wheat Reaper', 'Manual Rice Transplanter'] },
          { name: 'Planting Tools', items: ['Seed Drill 9 Row', 'Manual Dibber', 'Paddy Transplanter', 'Bulb Planter Steel', 'Seedling Tray 104 Hole', 'Potato Planter', 'Automatic Seeder', 'Nursery Pot Set', 'Mulching Machine', 'Grafting Tool Pro'] },
          { name: 'Soil Testing', items: ['Digital pH Meter', 'Wireless Moisture Sensor', 'Professional NPK Kit', 'Conductivity Meter', 'Soil Sampling Auger', 'Light Intensity Meter', 'Digital Thermometer Agri', 'Nutrient Analyzer', 'Compact Lab Kit', 'Salt Meter Soil'] }
        ]
      },
      {
        name: 'Fertilizers',
        subcategories: [
          { name: 'Organic', items: ['Vermicompost Premium', 'Steamed Bone Meal', 'Fish Amino Acid', 'Blood Meal Powder', 'Neem Cake Powder', 'Cow Manure Dehydrated', 'Poultry Manure', 'Castor Cake', 'Green Manure Seeds', 'Organic Seaweed Granules'] },
          { name: 'Inorganic', items: ['Granular Urea', 'DAP 18-46-0', 'Muriate of Potash', 'NPK 20-20-20', 'Single Super Phosphate', 'Ammonium Sulfate', 'Magnesium Sulfate', 'Zinc Sulfate', 'Borax Fertilizer', 'Calcium Nitrate'] },
          { name: 'Bio-Fertilizers', items: ['Rhizobium Culture', 'Azotobacter Liquid', 'Phosphate Solubilizing Bacteria', 'VAM Mycorrhiza', 'Acetobacter Bio', 'Potash Mobilizing Bacteria', 'Azospirillum', 'Trichoderma Viride', 'Pseudomonas Fluorescens', 'Blue Green Algae'] },
          { name: 'Liquid Fertilizers', items: ['Concentrated Seaweed Liquid', 'Liquid Humic Acid', 'Chelated Micro-nutrients', 'Amino Acid Liquid', 'Fulvic Acid 80%', 'Liquid NPK 10-10-10', 'Boron Liquid', 'Calcium Liquid', 'Iron EDTA', 'Zyme Liquid'] },
          { name: 'Slow Release', items: ['Polymer Coated Urea SR', 'Rock Phosphate Powder', 'Sulfur Coated Urea', 'Neem Coated Urea Premium', 'Organic Slow Release Pellets', 'Magnesium Oxide', 'Calcitic Lime', 'Dolomite Powder', 'Controlled Release NPK', 'Zeolite Soil Conditioner'] }
        ]
      },
      {
        name: 'Irrigation',
        subcategories: [
          { name: 'Drip Irrigation', items: ['Online Emitter 4LPH', 'Drip Tape 16mm', 'Manual Pressure Regulator', 'High Density Main Line', 'Standard Drip Punch', 'Screen Filter 2 inch', 'Sand Filter System', 'Venture Injector 3/4', 'Grommet & Takeoff', 'Drip End Cap'] },
          { name: 'Sprinkler System', items: ['Brass Impact Sprinkler', 'Pop-up Sprinkler 4 inch', 'Rain Gun 1.5 inch', 'Micro Fogger 4-Way', 'Mist Spray Nozzle', 'Butterfly Sprinkler', 'Overhead Sprinkler', 'Sprinkler Base Spike', 'Plastic Impact Head', 'Adjustable Arc Nozzle'] },
          { name: 'Pumps', items: ['Submersible Pump 5HP', 'Centrifugal Pump 2HP', 'Solar Water Pump 3HP', 'Open Well Submersible', 'Diesel Engine Pump', 'Petrol Start Pump', 'Jet Pump Vertical', 'Booster Pump System', 'Self Priming Pump', 'Hand Operated Suction'] },
          { name: 'Valves & Fittings', items: ['DC Solenoid Valve', 'PVC Ball Valve', 'Compression T-Joint', 'Elbow Connector 90', 'Air Release Valve', 'Check Valve Brass', 'Foot Valve Heavy', 'Coupler Set Quick', 'Reducing Bushing', 'Gate Valve Cast Iron'] },
          { name: 'Controllers', items: ['Smart WiFi Timer', 'Soil Moisture Sensor Pro', 'Master Control Panel', 'Digital Flow Meter', 'Automatic Pump Starter', 'Water Level Controller', 'Rain Sensor Wireless', 'GSM Pump Controller', 'Programmable Cycle Timer', 'Irrigation Valve Box'] }
        ]
      },
      {
        name: 'Pesticides',
        subcategories: [
          { name: 'Insecticides', items: ['Neem Oil 10000PPM', 'Malathion 50% EC', 'Imidacloprid 17.8%', 'Cypermethrin 25%', 'Abamectin 1.9%', 'Chlorpyrifos 20%', 'Lambda Cyhalothrin', 'Spinosad 45%', 'Thiamethoxam 25%', 'Fipronil 5% SC'] },
          { name: 'Herbicides', items: ['Glyphosate 41%', 'Atrazine 50%', 'Paraquat Dichloride', '2,4-D Ethyl Ester', 'Pendimethalin 30%', 'Oxyfluorfen 23.5%', 'Butachlor 50%', 'Pretilachlor 50%', 'Metsulfuron Methyl', 'Quizalofop Ethyl'] },
          { name: 'Fungicides', items: ['Mancozeb 75% WP', 'Sulfur 80% WDG', 'Copper Oxychloride 50%', 'Carbendazim 50%', 'Hexaconazole 5% EC', 'Propiconazole 25%', 'Tebuconazole 25%', 'Metalaxyl 35%', 'Azoxystrobin 23%', 'Captan 50%'] },
          { name: 'Rodenticides', items: ['Zinc Phosphide Pellets', 'Bromadiolone Cakes', 'Metal Trap Box', 'Strong Rat Glue', 'Aluminum Phosphide Tabs', 'Warfarin Powder', 'Ultrasonic Repeller', 'Rat Bait Station', 'Coumatetralyl', 'Brodifacoum Liquid'] },
          { name: 'Bio-Pesticides', items: ['Bt Liquid Formulation', 'Trichoderma Harzianum', 'Beauveria Bassiana WP', 'Metarhizium Anisopliae', 'Verticillium Lecanii', 'Pheromone Trap', 'Yellow Sticky Trap', 'Light Trap Agri', 'Nuclear Polyhedrosis Virus', 'Eugenol Lure'] }
        ]
      },
      {
        name: 'Seeds',
        subcategories: [
          { name: 'Vegetable Seeds', items: ['Tomato F1 Hybrid', 'Chilli G4 Teja', 'Brinjal Long Green', 'Okra Mahyco', 'Onion Red Nasik', 'Cabbage Round', 'Cauliflower Snowball', 'Cucumber Hybrid', 'Spinach All Green', 'Radish White Long'] },
          { name: 'Fruit Seeds', items: ['Papaya Taiwan 786', 'Watermelon Sugar Baby', 'Muskmelon Bobby', 'Pomegranate Grafts', 'Lemon Seedless', 'Guava Allahabad', 'Mango Alphonso', 'Grapes Thompson', 'Banana G9 Tissue', 'Dragon Fruit Cuttings'] },
          { name: 'Cereal Seeds', items: ['Basmati Rice 1121', 'Wheat Sharbati', 'Maize Pioneer', 'Pearl Millet Hybrid', 'Sorghum White', 'Barley Malt', 'Finger Millet', 'Foxtail Millet', 'Kodo Millet', 'Little Millet'] },
          { name: 'Oilseed Seeds', items: ['Groundnut Bold', 'Soybean JS-335', 'Mustard Yellow', 'Sunflower Hybrid', 'Sesame Black', 'Castor GCH-7', 'Safflower Seeds', 'Linseed Brown', 'Niger Seeds', 'Cotton Bt RCH'] },
          { name: 'Pulse Seeds', items: ['Chickpea Desi', 'Pigeon Pea Red', 'Green Gram Moong', 'Black Gram Urad', 'Lentil Masoor', 'Cowpea Lobia', 'Field Pea White', 'Moth Bean', 'Horse Gram', 'Rajma Kidney Bean'] }
        ]
      }
    ];

    let vendorIdx = 0;
    const comments = ["Outstanding quality!", "Highly effective.", "Great value.", "Top notch performance.", "Reliable and sturdy.", "Will buy again.", "Excellent service.", "Fast results."];

    for (const mainCat of data) {
      const [mainRows] = await db.query("SELECT id FROM categories WHERE name = ? AND parent_id IS NULL", [mainCat.name]);
      let mainId = mainRows.length ? mainRows[0].id : (await db.query("INSERT INTO categories (name, slug) VALUES (?, ?)", [mainCat.name, mainCat.name.toLowerCase().replace(/ /g, '-')]))[0].insertId;

      for (const subCat of mainCat.subcategories) {
        const [subRows] = await db.query("SELECT id FROM categories WHERE name = ? AND parent_id = ?", [subCat.name, mainId]);
        let subId = subRows.length ? subRows[0].id : (await db.query("INSERT INTO categories (name, parent_id, slug) VALUES (?, ?, ?)", [subCat.name, mainId, subCat.name.toLowerCase().replace(/ /g, '-')]))[0].insertId;

        for (const itemName of subCat.items) {
          const vendor = vendorDetails[vendorIdx % vendorDetails.length];
          const price = Math.floor(Math.random() * 5000) + 100;
          const stock = Math.floor(Math.random() * (263 - 100 + 1)) + 100;
          
          const [res] = await db.query(
            "INSERT INTO product (product_name, product_description, price, product_quantity, category_id, seller_id, product_type, brand) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [itemName, `Premium ${itemName} for professional use. Guaranteed quality and performance in the field.`, price, stock, subId, vendor.sellerId, subCat.name, ['Bayer', 'TATA', 'John Deere', 'Mahindra', 'Syngenta', 'Falcon'][Math.floor(Math.random() * 6)]]
          );

          // Random review
          const reviewer = vendorDetails[(vendorIdx + 1) % vendorDetails.length];
          await db.query("INSERT INTO review_rating (product_id, user_id, rating, comments) VALUES (?, ?, ?, ?)", [res.insertId, reviewer.userId, Math.floor(Math.random() * 2) + 4, comments[Math.floor(Math.random() * comments.length)]]);
          
          vendorIdx++;
        }
      }
    }

    console.log("Database seeded with more products!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
