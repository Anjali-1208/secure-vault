const AuditLog = require("../models/AuditLog");

// GET /api/audit  - admin-only, enforced by the route's RBAC middleware
async function getAuditLogs(req, res) {
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(200); // cap the response so the dashboard stays fast

  res.json({ logs });
}

module.exports = { getAuditLogs };
