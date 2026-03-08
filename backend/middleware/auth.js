// ===========================================================================
// Auth Middleware - JWT Token Verification
// ===========================================================================
//
// HOW IT WORKS:
// 1. Frontend sends every protected request with header:
//    "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
// 2. This middleware grabs the token from that header
// 3. jwt.verify() decodes it using our JWT_SECRET from .env
//    If the token is expired or tampered with, it throws an error
// 4. The decoded payload contains { id, role } (set during login)
//    We attach it to req.user so controllers can use req.user.id
// 5. Calls next() to let the request continue to the route handler
//
// USED BY: All vendor routes, cart, wishlist, orders — anything that
//          needs to know who the logged-in user is
// ===========================================================================

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // header format is "Bearer <token>" — split to get just the token part
  const token = authHeader.split(" ")[1];

  try {
    // decode the token and verify it hasn't been tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user info (id, role) to the request so controllers can use it
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;