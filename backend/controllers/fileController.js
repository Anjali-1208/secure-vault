const File = require("../models/File");
const AuditLog = require("../models/AuditLog");
const { encryptBuffer, decryptBuffer } = require("../utils/encryption");

// POST /api/files/upload  (multipart/form-data, field name "file")
async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { encryptedData, iv } = encryptBuffer(req.file.buffer);

    const file = await File.create({
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      iv,
      encryptedData,
      owner: req.user._id,
    });

    await AuditLog.create({
      user: req.user._id,
      userEmail: req.user.email,
      action: "FILE_UPLOAD",
      ipAddress: req.ip,
      details: `Uploaded "${req.file.originalname}" (${req.file.size} bytes)`,
    });

    res.status(201).json({
      message: "File encrypted and stored",
      file: { id: file._id, originalName: file.originalName, size: file.size, createdAt: file.createdAt },
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
}

// GET /api/files
// Employees see only their own files. Managers and admins see everyone's -
// this is the RBAC logic living inside the controller, not just the route guard.
async function listFiles(req, res) {
  const filter = req.user.role === "employee" ? { owner: req.user._id } : {};

  const files = await File.find(filter)
    .select("-encryptedData") // never send encrypted bytes in a list view
    .populate("owner", "name email role")
    .sort({ createdAt: -1 });

  res.json({ files });
}

// GET /api/files/:id/download
async function downloadFile(req, res) {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const isOwner = file.owner.toString() === req.user._id.toString();
    const canAccessAny = ["admin", "manager"].includes(req.user.role);

    if (!isOwner && !canAccessAny) {
      await AuditLog.create({
        user: req.user._id,
        userEmail: req.user.email,
        action: "ACCESS_DENIED",
        ipAddress: req.ip,
        details: `Tried to download file ${file._id} owned by another user`,
      });
      return res.status(403).json({ message: "You do not have access to this file" });
    }

    const decrypted = decryptBuffer(file.encryptedData, file.iv);

    await AuditLog.create({
      user: req.user._id,
      userEmail: req.user.email,
      action: "FILE_DOWNLOAD",
      ipAddress: req.ip,
      details: `Downloaded "${file.originalName}"`,
    });

    res.set({
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${file.originalName}"`,
    });
    res.send(decrypted);
  } catch (err) {
    res.status(500).json({ message: "Download failed", error: err.message });
  }
}

// DELETE /api/files/:id  - only the owner or an admin may delete
async function deleteFile(req, res) {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ message: "File not found" });

  const isOwner = file.owner.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "Only the owner or an admin can delete this file" });
  }

  await file.deleteOne();

  await AuditLog.create({
    user: req.user._id,
    userEmail: req.user.email,
    action: "FILE_DELETE",
    ipAddress: req.ip,
    details: `Deleted "${file.originalName}"`,
  });

  res.json({ message: "File deleted" });
}

module.exports = { uploadFile, listFiles, downloadFile, deleteFile };
