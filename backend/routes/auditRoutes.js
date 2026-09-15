const express = require("express");
const router = express.Router();

const { getAuditLogs } = require("../controllers/auditController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/rbacMiddleware");

// Only admins can view the audit trail - this is the clearest example of
// RBAC in the whole project: same login system, different visibility.
router.get("/", protect, authorize("admin"), getAuditLogs);

module.exports = router;
