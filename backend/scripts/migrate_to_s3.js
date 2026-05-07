require('dotenv').config({ path: 'backend/.env' });
const s3 = require('../config/s3');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function uploadToS3() {
  const images = [
    { local: 'backend/uploads/products/seeds_placeholder.png', key: 'farmeasy/seeds_placeholder.png', cat: 'Seeds' },
    { local: 'backend/uploads/products/fertilizers_placeholder.png', key: 'farmeasy/fertilizers_placeholder.png', cat: 'Fertilizers' },
    { local: 'backend/uploads/products/tools_placeholder.png', key: 'farmeasy/tools_placeholder.png', cat: 'Farming Tools' },
    { local: 'backend/uploads/products/irrigation_placeholder.png', key: 'farmeasy/irrigation_placeholder.png', cat: 'Irrigation' },
    { local: 'backend/uploads/products/pesticides_placeholder.png', key: 'farmeasy/pesticides_placeholder.png', cat: 'Pesticides' }
  ];

  for (const img of images) {
    try {
      const fileContent = fs.readFileSync(img.local);
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: img.key,
        Body: fileContent,
        ContentType: 'image/png'
      };

      console.log(`Uploading ${img.local} to S3...`);
      const result = await s3.upload(params).promise();
      const s3Url = result.Location;
      console.log(`Successfully uploaded: ${s3Url}`);

      // Update database for this category
      const [cats] = await db.query("SELECT id FROM categories WHERE name = ?", [img.cat]);
      if (cats.length > 0) {
        const catId = cats[0].id;
        const [subCats] = await db.query("SELECT id FROM categories WHERE parent_id = ?", [catId]);
        const allIds = [catId, ...subCats.map(c => c.id)];

        await db.query(
          "UPDATE product SET product_image = ? WHERE category_id IN (?)",
          [s3Url, allIds]
        );
        console.log(`Updated database for ${img.cat} with S3 URL.`);
      }

    } catch (err) {
      console.error(`Failed to upload ${img.local}:`, err.message);
    }
  }

  process.exit(0);
}

uploadToS3();
