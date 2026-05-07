  const express = require("express");
  const router = express.Router();
  const db = require("../config/db");


  // =====================================================
  // GET PRODUCTS BY CATEGORY (must come BEFORE /:id)
  // =====================================================
  router.get("/category/:id", async (req, res) => {
    try {
      const categoryId = req.params.id;

      // Improved Query: Fetch products from the category OR any of its direct subcategories
      const [rows] = await db.query(`
        SELECT 
          p.*,
          pc.name AS product_cat_name,
          s.shop_name,
          u.full_name AS seller_name,
          COALESCE(rs.average_rating, 0) AS average_rating,
          COALESCE(rs.average_rating, 0) AS avg_rating,
          COALESCE(rs.review_count, 0) AS review_count
        FROM product p
        LEFT JOIN categories pc ON p.category_id = pc.id
        LEFT JOIN seller s ON p.seller_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN (
          SELECT product_id, ROUND(AVG(rating), 1) as average_rating, COUNT(*) as review_count
          FROM review_rating
          GROUP BY product_id
        ) rs ON p.id = rs.product_id
        WHERE p.category_id = ? 
           OR p.category_id IN (SELECT id FROM categories WHERE parent_id = ?)
        ORDER BY p.created_at DESC
      `, [categoryId, categoryId]);

      res.json(rows);
    } catch (error) {
      console.error("Error fetching category products:", error);
      res.status(500).json({ message: "Database error" });
    }
  });

  // =====================================================
  // GET ALL PRODUCTS - with optional filters
  // =====================================================
  router.get("/all", async (req, res) => {
    try {
      const {
        category_id,
        brand_id,
        min_price,
        max_price,
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
          p.product_quantity,
          p.price,
          p.product_image,
          p.created_at,
          p.seller_id,
          p.brand_id,
          pc.name AS category_name,
          pc.id AS category_id,
          b.name AS brand_name,
          s.id AS seller_table_id,
          s.shop_name,
          u.full_name AS seller_name,
          COALESCE(rs.average_rating, 0) AS average_rating,
          COALESCE(rs.average_rating, 0) AS avg_rating,
          COALESCE(rs.review_count, 0) AS review_count
        FROM product p
        LEFT JOIN categories pc ON p.category_id = pc.id
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN seller s ON p.seller_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN (
          SELECT product_id, ROUND(AVG(rating), 1) as average_rating, COUNT(*) as review_count
          FROM review_rating
          GROUP BY product_id
        ) rs ON p.id = rs.product_id
        WHERE 1=1
      `;

      // params array to prevent SQL injection - we push values in here
      const params = [];

      if (category_id) {
        sql += " AND (p.category_id = ? OR p.category_id IN (SELECT id FROM categories WHERE parent_id = ?))";
        params.push(category_id, category_id);
      }

      if (min_price) {
        sql += " AND p.price >= ?";
        params.push(Number(min_price));
      }

      if (max_price) {
        sql += " AND p.price <= ?";
        params.push(Number(max_price));
      }

      if (brand_id) {
        sql += " AND p.brand_id = ?";
        params.push(brand_id);
      }

      if (seller_id) {
        sql += " AND p.seller_id = ?";
        params.push(seller_id);
      }

      // search in name, description, and brand name
      if (search) {
        sql += " AND (p.product_name LIKE ? OR p.product_description LIKE ? OR b.name LIKE ?)";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
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
  // GET ALL BRANDS LIST
  // frontend can use this to build the filter dropdown dynamically
  // =====================================================
  router.get("/meta/brands", async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT id, name FROM brands ORDER BY name ASC
      `);

      res.json(rows);

    } catch (error) {
      console.error("Error fetching brands:", error);
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

  // =====================================================
  // GET SINGLE PRODUCT DETAIL (MUST BE LAST - catch-all)
  // includes seller info and category, used by product detail page
  // =====================================================
  router.get("/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      console.log(`🔍 Fetching product with ID: ${productId}`);

      const [rows] = await db.query(`
        SELECT 
          p.*,
          pc.name AS category_name,
          b.name AS brand_name,
          s.shop_name,
          s.id AS seller_table_id,
          u.id AS vendor_id,
          u.full_name AS seller_name,
          u.city AS seller_city,
          u.state AS seller_state,
          vrs.average_rating AS seller_rating,
          vrs.total_reviews AS seller_total_reviews,
          COALESCE(prs.average_rating, 0) AS average_rating,
          COALESCE(prs.average_rating, 0) AS avg_rating,
          COALESCE(prs.review_count, 0) AS review_count
        FROM product p
        LEFT JOIN categories pc ON p.category_id = pc.id
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN seller s ON p.seller_id = s.id
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN vendor_rating_summary vrs ON s.id = vrs.vendor_id
        LEFT JOIN (
          SELECT product_id, ROUND(AVG(rating), 1) as average_rating, COUNT(*) as review_count
          FROM review_rating
          GROUP BY product_id
        ) prs ON p.id = prs.product_id
        WHERE p.id = ?
      `, [productId]);

      if (!rows.length) {
        console.log(`❌ Product ${productId} not found`);
        return res.status(404).json({ message: "Product not found" });
      }

      console.log(`✅ Product ${productId} found`);
      
      // also get other products from the same seller so we can show "More from this seller" section
      const product = rows[0];
      const [moreFromSeller] = await db.query(`
        SELECT id, product_name, price, product_quantity, product_image
        FROM product
        WHERE seller_id = ? AND id != ?
        LIMIT 4
      `, [product.seller_id, productId]);

      res.json({
        ...product,
        moreFromSeller
      });

    } catch (error) {
      console.error("❌ Error fetching product detail:", error.message);
      res.status(500).json({ message: "Database error: " + error.message });
    }
  });

  module.exports = router;