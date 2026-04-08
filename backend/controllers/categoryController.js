// =====================================================
// CATEGORY CONTROLLER
// Uses: product_category (main cats) + product_subcategory (sub-cats)
// =====================================================

const db = require("../config/db");

// ===== GET ALL CATEGORIES WITH SUBCATEGORIES =====
exports.getAllCategories = async (req, res) => {
  try {
    // Query the NEW categories table with parent-child hierarchy
    const [categories] = await db.query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.parent_id,
        c.icon,
        c.slug,
        c.image,
        (SELECT COUNT(*) FROM product WHERE category_id = c.id) AS product_count,
        (SELECT COUNT(*) FROM categories WHERE parent_id = c.id) AS subcategory_count
      FROM categories c
      WHERE c.parent_id IS NULL
      ORDER BY c.sort_order ASC, c.name ASC
    `);

    // Fetch subcategories for each parent category
    const categoriesWithSubs = await Promise.all(
      categories.map(async (cat) => {
        const [subs] = await db.query(
          `SELECT id, name, description, parent_id, icon, slug
           FROM categories
           WHERE parent_id = ?
           ORDER BY sort_order ASC, name ASC`,
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

    // Get category details from NEW categories table
    const [cat] = await db.query(
      `SELECT id, name, description, parent_id, icon, slug FROM categories WHERE id = ?`,
      [categoryId]
    );

    if (cat.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const category = cat[0];

    // Get subcategories if this is a parent category
    const [subs] = await db.query(
      `SELECT id, name, description, parent_id, icon, slug
       FROM categories WHERE parent_id = ? ORDER BY sort_order ASC, name ASC`,
      [categoryId]
    );

    // Sort order
    let orderBy = "p.created_at DESC";
    if (sortBy === "price_asc") orderBy = "p.price ASC";
    else if (sortBy === "price_desc") orderBy = "p.price DESC";

    // Get products for this category (including products in subcategories if parent category)
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
        c.name AS category_name
      FROM product p
      LEFT JOIN seller s ON p.seller_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? OR p.category_id IN (
        SELECT id FROM categories WHERE parent_id = ?
      )
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
      [categoryId, categoryId, parseInt(limit), offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM product p
       WHERE p.category_id = ? OR p.category_id IN (
        SELECT id FROM categories WHERE parent_id = ?
       )`,
      [categoryId, categoryId]
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
      `SELECT id, name, description, parent_id, icon, slug
       FROM categories
       WHERE parent_id = ?
       ORDER BY sort_order ASC, name ASC`,
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
