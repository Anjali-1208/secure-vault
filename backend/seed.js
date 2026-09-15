// Run with: npm run seed
// Creates one demo account per role so you can log in immediately and see
// how the dashboard differs for each without building a registration UI first.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

const demoUsers = [
  { name: "Alice Admin", email: "admin@demo.com", password: "Admin@123", role: "admin" },
  { name: "Manu Manager", email: "manager@demo.com", password: "Manager@123", role: "manager" },
  { name: "Emma Employee", email: "employee@demo.com", password: "Employee@123", role: "employee" },
];

async function seed() {
  await connectDB();

  for (const u of demoUsers) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`Skipped (already exists): ${u.email}`);
      continue;
    }
    await User.create(u); // password gets hashed automatically by the model's pre-save hook
    console.log(`Created: ${u.email} / ${u.password} (role: ${u.role})`);
  }

  console.log("\nSeeding complete. You can log in with any of the accounts above.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
