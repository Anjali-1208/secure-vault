const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { registerFailedAttempt, resetAttempts, MAX_ATTEMPTS } = require("../middleware/bruteForceProtect");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2h",
  });
}

// POST /api/auth/register
// Open registration for demo purposes. In a real deployment, only an
// admin would be able to create new users (see the seed script instead).
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password, // hashed automatically by the pre-save hook in the model
      role: ["admin", "manager", "employee"].includes(role) ? role : "employee",
    });

    res.status(201).json({
      message: "Account created",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  const ip = req.ip;

  try {
    const user = await User.findOne({ email });

    // Deliberately vague error message when the email doesn't exist at all -
    // never reveal whether it was the email or the password that was wrong.
    if (!user) {
      await AuditLog.create({ userEmail: email, action: "LOGIN_FAILED", ipAddress: ip, details: "Unknown email" });
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check lockout BEFORE checking the password
    if (user.isLocked) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      await AuditLog.create({
        user: user._id,
        userEmail: user.email,
        action: "ACCOUNT_LOCKED",
        ipAddress: ip,
        details: `Login attempt while locked. ${minutesLeft} minute(s) remaining.`,
      });
      return res.status(423).json({ message: `Account locked. Try again in ${minutesLeft} minute(s).` });
    }

    const passwordMatches = await user.comparePassword(password);

    if (!passwordMatches) {
      await registerFailedAttempt(user);
      await AuditLog.create({
        user: user._id,
        userEmail: user.email,
        action: "LOGIN_FAILED",
        ipAddress: ip,
        details: `Wrong password. Attempt ${user.failedLoginAttempts}/${MAX_ATTEMPTS}.`,
      });
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Success: clear any failed-attempt history and issue a token
    await resetAttempts(user);
    await AuditLog.create({ user: user._id, userEmail: user.email, action: "LOGIN_SUCCESS", ipAddress: ip, details: "" });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /api/auth/me - returns the currently logged-in user (used by the frontend on refresh)
async function getMe(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, getMe };
