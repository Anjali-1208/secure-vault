const AuditLog = require("../models/AuditLog");

// Usage on a route: authorize("admin", "manager")
// Must run AFTER authMiddleware.protect, since it reads req.user.
// This is the actual Role-Based Access Control check: it does not care
// who the user is, only what role they hold and whether that role is
// on the allowed list for this specific route.
function authorize(...allowedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Log every denial - this is what makes the audit trail meaningful,
      // not just a record of successful actions.
      await AuditLog.create({
        user: req.user._id,
        userEmail: req.user.email,
        action: "ACCESS_DENIED",
        ipAddress: req.ip,
        details: `Role '${req.user.role}' attempted ${req.method} ${req.originalUrl}`,
      });
      return res.status(403).json({ message: "Insufficient permissions for this action" });
    }

    next();
  };
}

module.exports = { authorize };
