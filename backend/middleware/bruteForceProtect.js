// This isn't Express middleware in the traditional sense - it's a set of
// helper functions the login controller calls directly, because the
// decision to lock an account depends on *which* user record was found,
// which we only know partway through the login logic.

const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5", 10);
const LOCK_MINUTES = parseInt(process.env.LOCK_TIME_MINUTES || "15", 10);

// Call this after a WRONG password. Increments the counter and locks the
// account once the threshold is crossed.
async function registerFailedAttempt(user) {
  user.failedLoginAttempts += 1;

  if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
    user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
  }

  await user.save();
}

// Call this after a SUCCESSFUL login to clear any prior failed attempts.
async function resetAttempts(user) {
  if (user.failedLoginAttempts > 0 || user.lockUntil) {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
  }
}

module.exports = { registerFailedAttempt, resetAttempts, MAX_ATTEMPTS, LOCK_MINUTES };
