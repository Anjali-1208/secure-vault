const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    // Who performed the action. Nullable because failed logins may not
    // resolve to a valid user (e.g. wrong email entirely).
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userEmail: { type: String, default: "unknown" },

    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN_SUCCESS",
        "LOGIN_FAILED",
        "ACCOUNT_LOCKED",
        "FILE_UPLOAD",
        "FILE_DOWNLOAD",
        "FILE_DELETE",
        "ACCESS_DENIED",
      ],
    },

    ipAddress: { type: String, default: "unknown" },
    details: { type: String, default: "" }, // human-readable context, e.g. filename or reason
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
