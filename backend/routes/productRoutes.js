  const express = require("express");
  const router = express.Router();
  const db = require("../config/db");


  // =====================================================
  // GET ALL PRODUCTS - with optional filters
  // 
  // Query params you can use:
  //   ?category_id=2          -> filter by category
  //   ?min_price=100          -> min price filter  
  //   ?max_price=500          -> max price filter
  //   ?product_type=Seeds     -> filter by type
  //   ?seller_id=3            -> filter by specific seller
  //   ?search=wheat           -> search in name and description
  //   ?sort=price_asc         -> sort options: price_asc, price_desc, newest, oldest
  //
  // all filters are optional - sending nothing returns everything
  // =====================================================
  router.get("/all", async (req, res) => {
    try {
      const {
        category_id,
        min_price,
        max_price,
        product_type,
        seller_id,
        search,
        sort,
        limit,
        page,
      } = req.query;

      // start building the query dynamically based on what filters came in
      let sql = `
        SELECT 
          p.id,
          p.product_name,
          p.product_description,
          p.product_type,
          p.product_quantity,
          p.price,
          p.product_image,
          p.created_at,
          p.seller_id,
          pc.product_cat_name AS category_name,
          pc.id AS category_id,
          s.id AS seller_table_id,
          s.shop_name,
          u.full_name AS seller_name
        FROM product p
        LEFT JOIN product_category pc ON p.category_id = pc.id
        LEFT JOIN seller s ON p.seller_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1
      `;

      // params array to prevent SQL injection - we push values in here
      const params = [];

      if (category_id) {
        sql += " AND p.category_id = ?";
        params.push(category_id);
      }

      if (min_price) {
        sql += " AND p.price >= ?";
        params.push(Number(min_price));
      }

      if (max_price) {
        sql += " AND p.price <= ?";
        params.push(Number(max_price));
      }

      if (product_type) {
        sql += " AND p.product_type = ?";
        params.push(product_type);
      }

      if (seller_id) {
        sql += " AND p.seller_id = ?";
        params.push(seller_id);
      }

      // search in both name and description
      if (search) {
        sql += " AND (p.product_name LIKE ? OR p.product_description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }

      // sorting options
      if (sort === "price_asc") {
        sql += " ORDER BY p.price ASC";
      } else if (sort === "price_desc") {
        sql += " ORDER BY p.price DESC";
      } else if (sort === "oldest") {
        sql += " ORDER BY p.created_at ASC";
      } else {
        // default to newest first
        sql += " ORDER BY p.created_at DESC";
      }

      // Optional pagination to reduce response payload for lightweight consumers.
      const parsedLimit = Number.parseInt(limit, 10);
      if (Number.isInteger(parsedLimit) && parsedLimit > 0) {
        const safeLimit = Math.min(parsedLimit, 200);
        const parsedPage = Number.parseInt(page, 10);
        const safePage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
        const offset = (safePage - 1) * safeLimit;

        sql += " LIMIT ? OFFSET ?";
        params.push(safeLimit, offset);
      }

      const [products] = await db.query(sql, params);

      res.json(products);

    } catch (error) {
      console.error("❌ Error fetching all products:", error.message, error.code);
      res.status(500).json({ 
        message: "Database error while fetching products",
        error: error.message,
        code: error.code
      });
    }
  });


  // =====================================================
  // GET SINGLE PRODUCT DETAIL
  // includes seller info and category, used by product detail page
  // =====================================================
  router.get("/:id", async (req, res) => {
    try {
      const productId = req.params.id;

      const [rows] = await db.query(`
        SELECT 
          p.*,
          pc.product_cat_name AS category_name,
          s.shop_name,
          s.id AS seller_table_id,
          u.full_name AS seller_name,
          u.city AS seller_city,
          u.state AS seller_state
        FROM product p
        LEFT JOIN product_category pc ON p.category_id = pc.id
        LEFT JOIN seller s ON p.seller_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE p.id = ?
      `, [productId]);

      if (!rows.length) {
        return res.status(404).json({ message: "Product not found" });
      }

      // also get other products from the same seller so we can show "More from this seller" section
      const product = rows[0];
      const [moreFromSeller] = await db.query(`
        SELECT id, product_name, price, product_quantity, product_type, product_image
        FROM product
        WHERE seller_id = ? AND id != ?
        LIMIT 4
      `, [product.seller_id, productId]);

      res.json({
        ...product,
        moreFromSeller
      });

    } catch (error) {
      console.error("Error fetching product detail:", error);
      res.status(500).json({ message: "Database error" });
    }
  });


  // =====================================================
  // GET PRODUCTS BY CATEGORY (already existed but keeping it clean)
  // =====================================================
  router.get("/category/:id", async (req, res) => {
    try {
      const categoryId = req.params.id;

      const [rows] = await db.query(`
        SELECT 
          p.*,
          pc.product_cat_name,
          s.shop_name,
          u.full_name AS seller_name
        FROM product p
        JOIN product_category pc ON p.category_id = pc.id
        LEFT JOIN seller s ON p.seller_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE p.category_id = ?
        ORDER BY p.created_at DESC
      `, [categoryId]);

      res.json(rows);

    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ message: "Database error" });
    }
  });


  // =====================================================
  // GET ALL DISTINCT PRODUCT TYPES
  // frontend can use this to build the filter dropdown dynamically
  // =====================================================
  router.get("/meta/types", async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT DISTINCT product_type 
        FROM product 
        WHERE product_type IS NOT NULL AND product_type != ''
        ORDER BY product_type
      `);

      res.json(rows.map(r => r.product_type));

    } catch (error) {
      console.error("Error fetching product types:", error);
      res.status(500).json({ message: "Database error" });
    }
  });


  // =====================================================
  // GET ALL SELLERS LIST
  // frontend can show a "Filter by Seller" dropdown
  // =====================================================
  router.get("/meta/sellers", async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT 
          s.id,
          COALESCE(s.shop_name, u.full_name) as name
        FROM seller s
        JOIN users u ON s.user_id = u.id
        ORDER BY name
      `);

      res.json(rows);

    } catch (error) {
      console.error("Error fetching sellers:", error);
      res.status(500).json({ message: "Database error" });
    }
  });

  module.exports = router;