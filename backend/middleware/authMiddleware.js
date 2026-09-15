const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Runs before any protected route. Expects a header like:
//   Authorization: Bearer <token>
// If the token is missing, malformed, expired, or signed with the wrong
// secret, the request is rejected before it ever reaches the route logic.
async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the fresh user record (not just what's in the token) so that
    // role changes or account deletion take effect immediately, without
    // waiting for the token to expire.
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user; // attach the user to the request for later middleware/routes
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { protect };
