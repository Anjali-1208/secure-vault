const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }, // size of the original, unencrypted file in bytes

    // AES-256-CBC needs a unique initialization vector per file so identical
    // files don't produce identical ciphertext. Stored as a hex string.
    iv: { type: String, required: true },

    // The actual encrypted bytes of the file
    encryptedData: { type: Buffer, required: true },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
