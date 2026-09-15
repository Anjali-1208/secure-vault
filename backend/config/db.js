const mongoose = require("mongoose");

// Connects to MongoDB using the URI stored in .env
// If this fails, the most common causes are: MongoDB not running locally,
// or an incorrect Atlas connection string / IP not whitelisted.
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
