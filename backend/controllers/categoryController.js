// =====================================================
// CATEGORY CONTROLLER
// Uses: hierarchical categories table (parent_id system)
// Note: product_category and product_subcategory tables are obsolete.
// =====================================================

const db = require("../config/db");

// ===== GET NAV MEGA-MENU DATA =====
// Returns: categories → subcategories → top 3 products per subcategory
exports.getNavData = async (req, res) => {
  try {
    // 1. Get all parent categories
    const [categories] = await db.query(`
      SELECT id, name, slug
      FROM categories
      WHERE parent_id IS NULL
      ORDER BY sort_order ASC, name ASC
    `);

    // 2. For each category, get subcategories + top products
    const result = await Promise.all(
      categories.map(async (cat) => {
        // Get subcategories
        const [subs] = await db.query(
          `SELECT id, name, slug FROM categories WHERE parent_id = ? ORDER BY sort_order ASC, name ASC`,
          [cat.id]
        );

        // For each subcategory, get top 3 products
        const subsWithProducts = await Promise.all(
          subs.map(async (sub) => {
            const [products] = await db.query(
              `SELECT id, product_name, price, product_image
               FROM product
               WHERE category_id = ?
               ORDER BY created_at DESC
               LIMIT 3`,
              [sub.id]
            );
            return { ...sub, products };
          })
        );

        // Also get products directly under the parent category (not in any subcategory)
        const [directProducts] = await db.query(
          `SELECT id, product_name, price, product_image
           FROM product
           WHERE category_id = ?
           ORDER BY created_at DESC
           LIMIT 3`,
          [cat.id]
        );

        return {
          ...cat,
          subcategories: subsWithProducts,
          directProducts,
        };
      })
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching nav data:", error);
    res.status(500).json({ success: false, error: "Failed to fetch nav data" });
  }
};

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
        (SELECT COUNT(*) FROM product WHERE category_id = c.id OR category_id IN (SELECT id FROM categories WHERE parent_id = c.id)) AS product_count,
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
      where += " AND (p.category_id = ? OR p.category_id IN (SELECT id FROM categories WHERE parent_id = ?))";
      params.push(categoryId, categoryId);
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

// ===== VENDOR: CREATE NEW CATEGORY =====
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const vendorId = req.user.id;

    // Validate inputs
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Category name is required" });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    // Check if category name already exists
    const [existing] = await db.query(
      "SELECT id FROM categories WHERE LOWER(name) = LOWER(?)",
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: "Category with this name already exists" });
    }

    // Insert new category (no parent_id = it's a main category)
    const [result] = await db.query(
      "INSERT INTO categories (name, description, slug, sort_order) VALUES (?, ?, ?, ?)",
      [name.trim(), description || "", slug, 0]
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        id: result.insertId,
        name: name.trim(),
        description: description || "",
        slug,
      },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, error: "Failed to create category" });
  }
};

// ===== VENDOR: CREATE SUBCATEGORY UNDER PARENT =====
exports.createSubcategory = async (req, res) => {
  try {
    const { parentId, name, description } = req.body;
    const vendorId = req.user.id;

    // Validate inputs
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Subcategory name is required" });
    }

    if (!parentId) {
      return res.status(400).json({ success: false, error: "Parent category ID is required" });
    }

    // Verify parent category exists
    const [parent] = await db.query("SELECT id FROM categories WHERE id = ?", [parentId]);
    if (parent.length === 0) {
      return res.status(404).json({ success: false, error: "Parent category not found" });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    // Check if subcategory name already exists under this parent
    const [existing] = await db.query(
      "SELECT id FROM categories WHERE parent_id = ? AND LOWER(name) = LOWER(?)",
      [parentId, name.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: "Subcategory with this name already exists under this parent" });
    }

    // Insert new subcategory with parent_id
    const [result] = await db.query(
      "INSERT INTO categories (name, description, slug, parent_id, sort_order) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), description || "", slug, parentId, 0]
    );

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: {
        id: result.insertId,
        parentId,
        name: name.trim(),
        description: description || "",
        slug,
      },
    });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    res.status(500).json({ success: false, error: "Failed to create subcategory" });
  }
};

// ===== VENDOR: GET CATEGORIES FOR DROPDOWN =====
exports.getCategoriesForDropdown = async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT id, name, description, parent_id
       FROM categories
       WHERE parent_id IS NULL
       ORDER BY name ASC`
    );

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: "Failed to fetch categories" });
  }
};
