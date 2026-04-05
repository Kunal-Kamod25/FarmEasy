// =====================================================
// CATEGORY CONTROLLER
// Uses: product_category (main cats) + product_subcategory (sub-cats)
// =====================================================

const db = require("../config/db");

// ===== GET ALL CATEGORIES WITH SUBCATEGORIES =====
exports.getAllCategories = async (req, res) => {
  try {
    // Query the actual product_category table
    const [categories] = await db.query(`
      SELECT 
        pc.id,
        pc.product_cat_name,
        pc.product_cat_name AS name,
        (SELECT COUNT(*) FROM product WHERE category_id = pc.id) AS product_count,
        (SELECT COUNT(*) FROM product_subcategory WHERE category_id = pc.id) AS subcategory_count
      FROM product_category pc
      ORDER BY pc.id ASC
    `);

    // Fetch subcategories for each parent category
    const categoriesWithSubs = await Promise.all(
      categories.map(async (cat) => {
        const [subs] = await db.query(
          `SELECT id, subcategory_name AS name, subcategory_name, category_id
           FROM product_subcategory
           WHERE category_id = ?
           ORDER BY subcategory_name ASC`,
          [cat.id]
        );
        return { ...cat, subcategories: subs };
      })
    );

    res.json({ success: true, data: categoriesWithSubs });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: "Failed to fetch categories" });
  }
};

// ===== GET CATEGORY BY ID WITH PRODUCTS =====
exports.getCategoryWithProducts = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 50, sortBy = "newest" } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get category details from product_category
    const [cat] = await db.query(
      `SELECT id, product_cat_name AS name, product_cat_name FROM product_category WHERE id = ?`,
      [categoryId]
    );

    if (cat.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const category = { ...cat[0], parent_id: null };

    // Get subcategories from product_subcategory
    const [subs] = await db.query(
      `SELECT id, subcategory_name AS name, subcategory_name, category_id
       FROM product_subcategory WHERE category_id = ? ORDER BY subcategory_name`,
      [categoryId]
    );

    // Sort order
    let orderBy = "p.created_at DESC";
    if (sortBy === "price_asc") orderBy = "p.price ASC";
    else if (sortBy === "price_desc") orderBy = "p.price DESC";

    // Get products for this category
    const [products] = await db.query(
      `SELECT
        p.id,
        p.product_name AS name,
        p.product_name,
        p.price,
        p.product_image AS image,
        p.product_image,
        p.category_id,
        p.product_quantity,
        p.product_description,
        p.product_type,
        s.shop_name AS vendor_name,
        u.full_name AS seller_name,
        pc.product_cat_name AS category_name
      FROM product p
      LEFT JOIN seller s ON p.seller_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN product_category pc ON p.category_id = pc.id
      WHERE p.category_id = ?
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
      [categoryId, parseInt(limit), offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM product WHERE category_id = ?`,
      [categoryId]
    );

    res.json({
      success: true,
      data: {
        category,
        subcategories: subs,
        products,
        pagination: {
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult[0].total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching category products:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== GET SUBCATEGORIES BY PARENT =====
exports.getSubcategories = async (req, res) => {
  try {
    const { parentId } = req.params;

    const [subcategories] = await db.query(
      `SELECT id, subcategory_name AS name, subcategory_name, category_id
       FROM product_subcategory
       WHERE category_id = ?
       ORDER BY subcategory_name ASC`,
      [parentId]
    );

    res.json({ success: true, data: { subcategories } });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== GET PRODUCTS BY MULTIPLE FILTERS =====
exports.getProductsByFilters = async (req, res) => {
  try {
    const {
      categoryId,
      subcategoryName,
      minPrice,
      maxPrice,
      sortBy = "newest",
      page = 1,
      limit = 12,
      search,
    } = req.query;

    let where = "WHERE 1=1";
    const params = [];

    if (categoryId) {
      where += " AND p.category_id = ?";
      params.push(categoryId);
    }

    if (subcategoryName) {
      where += " AND (p.product_name LIKE ? OR p.product_description LIKE ?)";
      params.push(`%${subcategoryName}%`, `%${subcategoryName}%`);
    }

    if (minPrice) {
      where += " AND p.price >= ?";
      params.push(minPrice);
    }

    if (maxPrice) {
      where += " AND p.price <= ?";
      params.push(maxPrice);
    }

    if (search) {
      where += " AND (p.product_name LIKE ? OR p.product_description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    let orderBy = "p.created_at DESC";
    if (sortBy === "price_asc") orderBy = "p.price ASC";
    else if (sortBy === "price_desc") orderBy = "p.price DESC";

    const offset = (Number(page) - 1) * Number(limit);

    const [products] = await db.query(
      `SELECT
        p.id, p.product_name AS name, p.product_name, p.price,
        p.product_image AS image, p.product_image, p.category_id,
        p.product_quantity, p.product_description, p.product_type,
        s.shop_name AS vendor_name,
        u.full_name AS seller_name
      FROM product p
      LEFT JOIN seller s ON p.seller_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM product p ${where}`,
      params
    );

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult[0].total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
