const express = require("express");
const multer = require("multer");
const router = express.Router();

const { uploadFile, listFiles, downloadFile, deleteFile } = require("../controllers/fileController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/rbacMiddleware");

// Keep uploaded files in memory only long enough to encrypt them - never
// written to disk unencrypted, even temporarily.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB cap for the demo
});

// Every route below requires a valid JWT (protect).
// All authenticated roles can upload and list/download their own files.
router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/", protect, listFiles);
router.get("/:id/download", protect, downloadFile);

// Deletion is further restricted inside the controller (owner or admin only),
// but you could equally enforce a stream of "manager+ only" here with:
// router.delete("/:id", protect, authorize("admin", "manager"), deleteFile);
router.delete("/:id", protect, deleteFile);

module.exports = router;
