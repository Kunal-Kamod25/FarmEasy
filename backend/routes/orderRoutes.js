const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/auth");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const {
  ORDER_STATUS,
  ORDER_STATUS_LIST,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LIST,
  TRACKING_STATUS
} = require("../constants/orderStatus");

const stripe = process.env.STRIPE_SECRET_KEY
  ? require("stripe")(process.env.STRIPE_SECRET_KEY)
  : null;

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const normalizeShippingDetails = (input = {}) => {
  const shipping = {
    fullName: String(input.fullName || "").trim(),
    email: String(input.email || "").trim(),
    phone: String(input.phone || "").trim(),
    address: String(input.address || "").trim(),
    city: String(input.city || "").trim(),
    state: String(input.state || "").trim(),
    pincode: String(input.pincode || "").trim()
  };

  const missing = Object.entries(shipping)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return { shipping, missing };
};

const fetchCartItems = async (queryRunner, userId, withLock = false) => {
  const lockSql = withLock ? " FOR UPDATE" : "";

  const [rows] = await queryRunner(
    `SELECT
       c.product_id,
       c.quantity,
       p.product_name,
       p.price,
       p.product_quantity AS available_stock,
       p.seller_id
     FROM cart c
     JOIN product p ON p.id = c.product_id
     WHERE c.user_id = ?${lockSql}`,
    [userId]
  );

  if (!rows.length) {
    throw new Error("Cart is empty");
  }

  for (const item of rows) {
    if (Number(item.quantity) <= 0) {
      throw new Error(`Invalid quantity for ${item.product_name}`);
    }

    if (Number(item.available_stock) < Number(item.quantity)) {
      throw new Error(`Insufficient stock for ${item.product_name}`);
    }
  }

  return rows.map((row) => ({
    product_id: row.product_id,
    quantity: Number(row.quantity),
    price: Number(row.price),
    product_name: row.product_name,
    seller_id: row.seller_id
  }));
};

const calculateTotal = (cartItems) => {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return Number(total.toFixed(2));
};

const createOrderFromCart = async ({
  connection,
  userId,
  shipping,
  cartItems,
  paymentMethod,
  paymentStatus
}) => {
  const totalPrice = calculateTotal(cartItems);

  const [orderResult] = await connection.query(
    "INSERT INTO orders (user_id, total_price, order_status) VALUES (?, ?, ?)",
    [userId, totalPrice, ORDER_STATUS.PENDING]
  );
  const orderId = orderResult.insertId;

  const itemValues = cartItems.map((item) => [
    orderId,
    item.product_id,
    item.quantity,
    item.price
  ]);

  await connection.query(
    "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
    [itemValues]
  );

  for (const item of cartItems) {
    const [stockUpdate] = await connection.query(
      `UPDATE product
       SET product_quantity = product_quantity - ?
       WHERE id = ? AND product_quantity >= ?`,
      [item.quantity, item.product_id, item.quantity]
    );

    if (stockUpdate.affectedRows === 0) {
      throw new Error(`Stock update failed for product ${item.product_id}`);
    }
  }

  await connection.query(
    "DELETE FROM cart WHERE user_id = ?",
    [userId]
  );

  await connection.query(
    `INSERT INTO tracking (order_id, status, user_id, user_name, user_address)
     VALUES (?, ?, ?, ?, ?)`,
    [
      orderId,
      TRACKING_STATUS.ORDER_PLACED,
      userId,
      shipping.fullName,
      `${shipping.address}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}`
    ]
  );

  await connection.query(
    "INSERT INTO payment (order_id, payment_method, amount, status) VALUES (?, ?, ?, ?)",
    [orderId, paymentMethod, totalPrice, paymentStatus]
  );

  return { orderId, totalPrice };
};

const placeCodOrder = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const userId = req.user.id;
    const { shippingDetails } = req.body;

    const { shipping, missing } = normalizeShippingDetails(shippingDetails);
    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing shipping fields: ${missing.join(", ")}`
      });
    }

    await connection.beginTransaction();

    const cartItems = await fetchCartItems(connection.query.bind(connection), userId, true);
    const { orderId } = await createOrderFromCart({
      connection,
      userId,
      shipping,
      cartItems,
      paymentMethod: "COD",
      paymentStatus: PAYMENT_STATUS.PENDING
    });

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId
    });
  } catch (error) {
    await connection.rollback();
    console.error("COD order placement error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to place order"
    });
  } finally {
    connection.release();
  }
};

router.post("/cod", verifyToken, placeCodOrder);

// Backward compatible endpoint for old checkout clients.
router.post("/", verifyToken, async (req, res) => {
  const method = String(req.body?.paymentMethod || "COD").toUpperCase();

  if (method === "RAZORPAY" || method === "ONLINE" || method === "CARD") {
    return res.status(400).json({
      message: "Use /api/orders/razorpay/order for online payments."
    });
  }

  if (method === "STRIPE") {
    return res.status(400).json({
      message: "Use /api/orders/stripe/checkout-session for card payments."
    });
  }

  return placeCodOrder(req, res);
});

router.post("/razorpay/order", verifyToken, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        message: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend env."
      });
    }

    const userId = req.user.id;
    const { shippingDetails } = req.body;

    const { shipping, missing } = normalizeShippingDetails(shippingDetails);
    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing shipping fields: ${missing.join(", ")}`
      });
    }

    const cartItems = await fetchCartItems(db.query.bind(db), userId, false);
    const totalPrice = calculateTotal(cartItems);
    const amountPaise = Math.round(totalPrice * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `fe_${userId}_${Date.now()}`,
      notes: {
        userId: String(userId),
        expectedTotal: String(amountPaise)
      }
    });

    return res.status(200).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      prefill: {
        name: shipping.fullName,
        email: shipping.email,
        contact: shipping.phone
      }
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return res.status(500).json({ message: "Failed to create Razorpay order" });
  }
});

router.post("/razorpay/finalize", verifyToken, async (req, res) => {
  const connection = await db.getConnection();

  try {
    if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        message: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend env."
      });
    }

    const userId = req.user.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingDetails
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "razorpay_order_id, razorpay_payment_id and razorpay_signature are required"
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const { shipping, missing } = normalizeShippingDetails(shippingDetails);
    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing shipping fields: ${missing.join(", ")}`
      });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({ message: "Payment does not match the order" });
    }

    if (!["captured", "authorized"].includes(payment.status)) {
      return res.status(400).json({ message: "Payment is not completed" });
    }

    await connection.beginTransaction();

    const cartItems = await fetchCartItems(connection.query.bind(connection), userId, true);
    const calculatedTotalPaise = Math.round(calculateTotal(cartItems) * 100);

    if (Number(payment.amount || 0) !== calculatedTotalPaise) {
      throw new Error("Cart total changed. Please try checkout again.");
    }

    const { orderId } = await createOrderFromCart({
      connection,
      userId,
      shipping,
      cartItems,
      paymentMethod: "RAZORPAY",
      paymentStatus: PAYMENT_STATUS.PAID
    });

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Razorpay payment verified and order created",
      orderId
    });
  } catch (error) {
    await connection.rollback();
    console.error("Razorpay finalize error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to finalize Razorpay order"
    });
  } finally {
    connection.release();
  }
});

router.post("/stripe/checkout-session", verifyToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        message: "Stripe is not configured. Add STRIPE_SECRET_KEY in backend env."
      });
    }

    const userId = req.user.id;
    const { shippingDetails } = req.body;

    const { shipping, missing } = normalizeShippingDetails(shippingDetails);
    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing shipping fields: ${missing.join(", ")}`
      });
    }

    const cartItems = await fetchCartItems(db.query.bind(db), userId, false);
    const totalPrice = calculateTotal(cartItems);

    const line_items = cartItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product_name
        },
        unit_amount: Math.round(item.price * 100)
      }
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${FRONTEND_URL}/order-success?payment=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout?payment=cancelled`,
      customer_email: shipping.email,
      metadata: {
        userId: String(userId),
        fullName: shipping.fullName,
        phone: shipping.phone,
        address: shipping.address,
        city: shipping.city,
        state: shipping.state,
        pincode: shipping.pincode,
        expectedTotal: String(Math.round(totalPrice * 100))
      }
    });

    return res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    return res.status(500).json({ message: "Failed to create Stripe checkout session" });
  }
});

router.post("/stripe/finalize", verifyToken, async (req, res) => {
  const connection = await db.getConnection();

  try {
    if (!stripe) {
      return res.status(503).json({
        message: "Stripe is not configured. Add STRIPE_SECRET_KEY in backend env."
      });
    }

    const userId = req.user.id;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment is not completed" });
    }

    if (Number(session.metadata?.userId) !== userId) {
      return res.status(403).json({ message: "Payment session does not belong to this user" });
    }

    await connection.beginTransaction();

    const cartItems = await fetchCartItems(connection.query.bind(connection), userId, true);
    const calculatedTotalPaise = Math.round(calculateTotal(cartItems) * 100);

    if (calculatedTotalPaise !== Number(session.amount_total || 0)) {
      throw new Error("Cart total changed. Please try checkout again.");
    }

    const shipping = {
      fullName: session.metadata?.fullName || "Customer",
      email: session.customer_email || "",
      phone: session.metadata?.phone || "",
      address: session.metadata?.address || "",
      city: session.metadata?.city || "",
      state: session.metadata?.state || "",
      pincode: session.metadata?.pincode || ""
    };

    const { orderId } = await createOrderFromCart({
      connection,
      userId,
      shipping,
      cartItems,
      paymentMethod: "STRIPE",
      paymentStatus: PAYMENT_STATUS.PAID
    });

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Stripe payment finalized and order created",
      orderId
    });
  } catch (error) {
    await connection.rollback();
    console.error("Stripe finalize error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to finalize Stripe order"
    });
  } finally {
    connection.release();
  }
});

router.get("/summary", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [[summary]] = await db.query(
      `SELECT
         COUNT(*) AS total_orders,
         COALESCE(SUM(total_price), 0) AS total_spent,
         MAX(order_date) AS last_order_at
       FROM orders
       WHERE user_id = ?`,
      [userId]
    );

    return res.json({
      total_orders: Number(summary.total_orders || 0),
      total_spent: Number(summary.total_spent || 0),
      last_order_at: summary.last_order_at || null
    });
  } catch (error) {
    console.error("Order summary fetch error:", error);
    return res.status(500).json({ message: "Failed to fetch order summary" });
  }
});

router.get("/meta/statuses", verifyToken, async (_req, res) => {
  return res.json({
    orderStatuses: ORDER_STATUS_LIST,
    paymentStatuses: PAYMENT_STATUS_LIST
  });
});

router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const requestedUserId = Number.parseInt(req.params.userId, 10);

    if (!requestedUserId || requestedUserId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const [rows] = await db.query(
      `SELECT
         o.id as order_id,
         o.order_date,
         o.order_status,
         o.total_price,
         pay.payment_method,
         pay.status as payment_status,
         pay.payment_date,
         oi.id as item_id,
         oi.quantity,
         oi.price as item_price,
         p.product_name,
         p.product_description,
         p.product_type,
         COALESCE(s.shop_name, u2.full_name) as seller_shop,
         u2.full_name as seller_name
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN product p ON oi.product_id = p.id
       LEFT JOIN seller s ON p.seller_id = s.id
       LEFT JOIN users u2 ON s.user_id = u2.id
       LEFT JOIN payment pay ON pay.order_id = o.id
       WHERE o.user_id = ?
       ORDER BY o.order_date DESC`,
      [requestedUserId]
    );

    const ordersMap = {};

    rows.forEach((row) => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          id: row.order_id,
          order_date: row.order_date,
          order_status: row.order_status,
          total_price: Number(row.total_price || 0),
          payment: {
            method: row.payment_method || null,
            status: row.payment_status || null,
            paid_at: row.payment_date || null
          },
          items: []
        };
      }

      ordersMap[row.order_id].items.push({
        item_id: row.item_id,
        product_name: row.product_name,
        product_description: row.product_description,
        product_type: row.product_type,
        quantity: row.quantity,
        price: Number(row.item_price || 0),
        seller_shop: row.seller_shop,
        seller_name: row.seller_name
      });
    });

    return res.json(Object.values(ordersMap));
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
});

module.exports = router;
