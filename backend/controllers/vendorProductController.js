const db = require("../config/db");
const s3 = require("../config/s3");

// ===========================================================================
// HELPER FUNCTIONS
// ===========================================================================

// Converts nullable form values to integers for MySQL INT columns
const toNullableInt = (value) => {
  if (value === undefined || value === null) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const lower = trimmed.toLowerCase();
    if (lower === "null" || lower === "undefined") return null;

    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

// Extract S3 key from full S3 URL
function extractS3KeyFromUrl(url) {
  try {
    const parts = url.split('.amazonaws.com/');
    if (parts.length > 1) {
      return parts[1];
    }
    return url;
  } catch (error) {
    console.error("Error extracting S3 key:", error);
    return url;
  }
}

// ===========================================================================
// GET VENDOR'S OWN PRODUCTS
// ===========================================================================
exports.getProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    if (!seller.length) {
      return res.status(400).json({ message: "Seller profile not found. Please complete your seller registration." });
    }

    const sellerId = seller[0].id;

    const [products] = await db.query(`
      SELECT 
        p.*,
        c.name AS category_name
      FROM product p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.seller_id = ?
      ORDER BY p.created_at DESC
    `, [sellerId]);

    res.json(products);

  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};

// ===========================================================================
// GET A SINGLE PRODUCT FOR EDITING
// ===========================================================================
exports.getProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const [seller] = await db.query("SELECT id FROM seller WHERE user_id = ?", [userId]);
    if (!seller.length) return res.status(403).json({ message: "Seller not found" });

    const sellerId = seller[0].id;

    const [product] = await db.query(
      "SELECT * FROM product WHERE id = ? AND seller_id = ?",
      [productId, sellerId]
    );

    if (!product.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product[0]);
  } catch (error) {
    console.error("getProduct error:", error);
    res.status(500).json({ message: "Server error while fetching product" });
  }
};

// ===========================================================================
// UPDATE A PRODUCT
// ===========================================================================
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    const { product_name, product_description, product_type, price, category_id, product_quantity } = req.body;
    const normalizedCategoryId = toNullableInt(category_id);
    const normalizedQuantity = toNullableInt(product_quantity) ?? 0;

    const [seller] = await db.query("SELECT id FROM seller WHERE user_id = ?", [userId]);
    if (!seller.length) return res.status(403).json({ message: "Seller not found" });

    const sellerId = seller[0].id;

    const [existingProduct] = await db.query("SELECT id FROM product WHERE id = ? AND seller_id = ?", [productId, sellerId]);
    if (!existingProduct.length) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    // req.file.path is the full S3 HTTPS URL from S3Storage middleware
    const productImage = req.file ? req.file.path : null;

    if (productImage) {
      await db.query(`
        UPDATE product 
        SET product_name = ?, product_description = ?, product_type = ?, price = ?, category_id = ?, product_quantity = ?, product_image = ?
        WHERE id = ? AND seller_id = ?
      `, [product_name, product_description || null, product_type || null, price, normalizedCategoryId, normalizedQuantity, productImage, productId, sellerId]);
    } else {
      await db.query(`
        UPDATE product 
        SET product_name = ?, product_description = ?, product_type = ?, price = ?, category_id = ?, product_quantity = ?
        WHERE id = ? AND seller_id = ?
      `, [product_name, product_description || null, product_type || null, price, normalizedCategoryId, normalizedQuantity, productId, sellerId]);
    }

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ message: "Server error while updating product" });
  }
};

// ===========================================================================
// ADD NEW PRODUCT
// ===========================================================================
exports.addProduct = async (req, res) => {
  try {
    const { product_name, product_description, product_type, price, category_id, product_quantity } = req.body;
    const normalizedCategoryId = toNullableInt(category_id);
    const normalizedQuantity = toNullableInt(product_quantity) ?? 0;

    if (!product_name || !price) {
      return res.status(400).json({ message: "Product name and price are required" });
    }

    const userId = req.user.id;

    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    if (!seller.length) {
      return res.status(400).json({ message: "Seller profile not found" });
    }

    const sellerId = seller[0].id;

    // S3Storage middleware uploads to S3 and req.file.path is the full S3 URL
    const productImage = req.file ? req.file.path : null;

    await db.query(
      `INSERT INTO product 
        (product_name, product_description, product_type, price, category_id, product_quantity, seller_id, product_image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_name,
        product_description || null,
        product_type || null,
        price,
        normalizedCategoryId,
        normalizedQuantity,
        sellerId,
        productImage
      ]
    );

    res.json({ message: "Product added successfully" });

  } catch (error) {
    console.error("addProduct error:", error);
    res.status(500).json({ message: "Server error while adding product" });
  }
};

// ===========================================================================
// DELETE PRODUCT - WITH S3 IMAGE DELETION ⭐
// ===========================================================================
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const [seller] = await db.query(
      "SELECT id FROM seller WHERE user_id = ?",
      [userId]
    );

    if (!seller.length) {
      return res.status(400).json({ message: "Seller not found" });
    }

    const sellerId = seller[0].id;

    // Get product details including image URL
    const [product] = await db.query(
      "SELECT * FROM product WHERE id = ? AND seller_id = ?",
      [productId, sellerId]
    );

    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found or you don't own this product" });
    }

    // Delete image from S3 if it exists
    if (product[0].product_image) {
      const s3Key = extractS3KeyFromUrl(product[0].product_image);
      
      s3.deleteObject(
        {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: s3Key
        },
        (error) => {
          if (error) {
            console.error("S3 Delete Error:", error);
            // Continue with product deletion even if image delete fails
          }
        }
      );
    }

    // Delete from database
    const [result] = await db.query(
      "DELETE FROM product WHERE id = ? AND seller_id = ?",
      [productId, sellerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ message: "Server error while deleting product" });
  }
};
