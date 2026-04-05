// =====================================================
// CATEGORY CONTROLLER
// =====================================================
// Manage product categories with parent-child hierarchy
// =====================================================

const db = require("../config/db");

// ===== GET ALL CATEGORIES (With Hierarchy) =====
exports.getAllCategories = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id, c.name, c.description, c.parent_id, 
        c.icon, c.slug, c.image, c.sort_order,
        (SELECT COUNT(*) FROM categories WHERE parent_id = c.id) as subcategory_count,
        (SELECT COUNT(*) FROM product WHERE category_id = c.id) as product_count
      FROM categories c
      WHERE c.parent_id IS NULL
      ORDER BY c.sort_order ASC, c.name ASC
    `;
    
    const [categories] = await db.query(query);
    
    // Fetch subcategories for each category
    const categoriesWithSubs = await Promise.all(
      categories.map(async (cat) => {
        const [subs] = await db.query(
          `SELECT id, name, icon, slug, product_count FROM categories c
           LEFT JOIN (SELECT COUNT(*) as product_count FROM product WHERE category_id = c.id) as p
           WHERE parent_id = ? ORDER BY sort_order, name`,
          [cat.id]
        );
        return { ...cat, subcategories: subs };
      })
    );

    res.json({
      success: true,
      data: categoriesWithSubs,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
    });
  }
};

// ===== GET CATEGORY BY ID WITH PRODUCTS =====
exports.getCategoryWithProducts = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    // Get category details
    const [cat] = await db.query(
      `SELECT * FROM categories WHERE id = ?`,
      [categoryId]
    );

    if (cat.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const category = cat[0];

    // Get subcategories
    const [subs] = await db.query(
      `SELECT id, name FROM categories WHERE parent_id = ?`,
      [categoryId]
    );

    // Get products - include both from this category and subcategories
    const categoryIds = [categoryId, ...subs.map(s => s.id)];
    const placeholders = categoryIds.map(() => "?").join(",");

    const [products] = await db.query(
      `SELECT 
        p.id, p.name, p.price, p.image, p.category_id,
        b.name as brand_name, p.avg_rating, p.review_count,
        p.stock_quantity, u.shop_name as vendor_name
      FROM product p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN seller s ON p.seller_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE p.category_id IN (${placeholders})
      LIMIT ? OFFSET ?`,
      [...categoryIds, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM product 
       WHERE category_id IN (${placeholders})`,
      categoryIds
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
      `SELECT 
        id, name, icon, description, slug,
        (SELECT COUNT(*) FROM product WHERE category_id = categories.id) as product_count
      FROM categories 
      WHERE parent_id = ?
      ORDER BY sort_order, name`,
      [parentId]
    );

    res.json({
      success: true,
      data: subcategories,
    });
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
      brandId,
      minPrice,
      maxPrice,
      sortBy = "newest",
      page = 1,
      limit = 12,
      search,
    } = req.query;

    let where = "WHERE 1=1";
    let params = [];

    if (categoryId) {
      where += " AND p.category_id = ?";
      params.push(categoryId);
    }

    if (brandId) {
      where += " AND p.brand_id = ?";
      params.push(brandId);
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
      where += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    let orderBy = "p.created_at DESC";
    switch (sortBy) {
      case "price-low":
        orderBy = "p.price ASC";
        break;
      case "price-high":
        orderBy = "p.price DESC";
        break;
      case "rating":
        orderBy = "p.avg_rating DESC";
        break;
      case "popular":
        orderBy = "p.review_count DESC";
        break;
    }

    const offset = (page - 1) * limit;

    const [products] = await db.query(
      `SELECT 
        p.id, p.name, p.price, p.image, p.category_id,
        b.name as brand_name, p.avg_rating, p.review_count,
        p.stock_quantity, u.full_name as vendor_name
      FROM product p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN seller s ON p.seller_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM product p
       LEFT JOIN brands b ON p.brand_id = b.id
       ${where}`,
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
