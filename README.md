# SecureVault

A role-based, encrypted file-sharing platform with audit logging, built on the MERN stack (MongoDB, Express, React, Node).

Built to demonstrate: JWT authentication, Role-Based Access Control (RBAC), AES-256 file encryption, brute-force login protection, and a full audit trail — the core skills behind most "secure enterprise system" interview questions.

## What it does

- Three roles: **admin**, **manager**, **employee**
- Any logged-in user can upload a file — it's encrypted with AES-256 on the server before being stored
- Employees see only their own files; managers and admins see everyone's
- Only the file owner or an admin can delete a file
- Only admins can view the audit log (every login, upload, download, delete, and denied-access attempt)
- 5 wrong password attempts locks an account for 15 minutes

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), React Router, Axios |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JSON Web Tokens (JWT), bcrypt password hashing |
| Encryption | AES-256-CBC (Node's built-in `crypto` module) |

## Prerequisites

Install these once, if you don't already have them:

1. **Node.js** (v18 or later) — https://nodejs.org
2. **MongoDB** — either:
   - Install locally: https://www.mongodb.com/docs/manual/installation/, or
   - Use a free cloud database at https://www.mongodb.com/cloud/atlas (no install needed — just copy the connection string)

Check your Node version:
```bash
node -v
```

## Step 1 — Get the project onto your machine

If you received this as a folder, just open a terminal inside it. If you're pushing it to GitHub first (recommended for your CV):

```bash
cd secure-vault
git init
git add .
git commit -m "Initial commit: SecureVault MERN project"
```

Then create a new empty repo on GitHub and run the two commands GitHub shows you (`git remote add origin ...` and `git push -u origin main`).

**Important:** Before your first commit, create a `.gitignore` so you never push secrets or dependencies:
```bash
echo "node_modules/
.env" > .gitignore
```

## Step 2 — Set up the backend

```bash
cd backend
npm install
```

This downloads Express, Mongoose, JWT, bcrypt, and multer — everything listed in `package.json`.

Now create your environment file:
```bash
cp .env.example .env
```

Open `.env` and fill in:
- `MONGO_URI` — `mongodb://127.0.0.1:27017/secure-vault` if MongoDB is running locally, or your Atlas connection string
- `JWT_SECRET` — any long random string (mash your keyboard, it just needs to be unpredictable)
- `ENCRYPTION_KEY` — exactly 32 characters, e.g. `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**Start MongoDB** if you're running it locally (skip this if using Atlas):
```bash
mongod
```
(Leave this running in its own terminal window.)

**Create demo accounts** (one admin, one manager, one employee):
```bash
npm run seed
```
You should see three lines confirming each account was created, with their passwords.

**Start the backend server**:
```bash
npm run dev
```
You should see:
```
MongoDB connected: ...
Server running on http://localhost:5000
```

Leave this terminal running. Test it worked by opening `http://localhost:5000/api/health` in a browser — you should see `{"status":"ok"}`.

## Step 3 — Set up the frontend

Open a **new terminal window** (keep the backend running in the first one):

```bash
cd secure-vault/frontend
npm install
npm run dev
```

You should see something like:
```
Local:   http://localhost:5173/
```

Open that URL in your browser.

## Step 4 — Try it out

Log in with one of the seeded accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@demo.com | Admin@123 |
| Manager | manager@demo.com | Manager@123 |
| Employee | employee@demo.com | Employee@123 |

Try this to actually see the RBAC and encryption working:

1. Log in as **employee@demo.com**, upload a file. Notice you only see your own file.
2. Log out, log in as **manager@demo.com**. You'll see the employee's file too — managers see everyone's files.
3. Try downloading it as the manager — it works, because managers can access any file.
4. Log out, log in as **admin@demo.com**, click "Audit log" in the nav bar. You'll see every login and file action logged, including the one denied-access attempt if you try downloading someone else's file as a plain employee.
5. Try logging in with a wrong password 5 times in a row on any account — the 6th attempt will say the account is locked, and it'll show up in the audit log as `ACCOUNT_LOCKED`.

## Project structure

```
secure-vault/
├── backend/
│   ├── config/db.js              MongoDB connection
│   ├── models/                   User, File, AuditLog schemas
│   ├── middleware/
│   │   ├── authMiddleware.js     verifies JWT on protected routes
│   │   ├── rbacMiddleware.js     checks role permissions
│   │   └── bruteForceProtect.js  login attempt tracking + lockout
│   ├── controllers/               actual route logic
│   ├── routes/                    route definitions
│   ├── utils/encryption.js       AES-256 encrypt/decrypt
│   ├── seed.js                   creates demo accounts
│   └── server.js                 app entry point
└── frontend/
    └── src/
        ├── api/api.js             axios instance with JWT auto-attached
        ├── context/AuthContext.jsx  login state, shared across app
        ├── components/            Navbar, ProtectedRoute
        └── pages/                 Login, Dashboard, AuditLog
```

## How to explain this project in an interview

Walk through it in this order — it mirrors how a real request flows through the system:

1. **"A user logs in"** → `authController.login` checks the password against the bcrypt hash, checks if the account is locked, and on success signs a JWT containing the user's ID and role.
2. **"Every protected request carries that JWT"** → `authMiddleware.protect` verifies the signature and attaches the user to `req.user`.
3. **"Role decides what happens next"** → `rbacMiddleware.authorize(...)` checks `req.user.role` against an allow-list per route — this is RBAC.
4. **"Files are never stored in plain text"** → `utils/encryption.js` uses AES-256-CBC with a random IV per file, so the same file uploaded twice produces different ciphertext.
5. **"Everything is logged"** → every controller writes to the `AuditLog` collection, success or failure, so there's a full record for compliance.

If asked "why MERN and not something else" — it's JavaScript end-to-end, which means one language across frontend and backend, a large ecosystem, and it directly matches the programming-language requirement in most junior software engineer job descriptions.

## Common issues

| Problem | Fix |
|---|---|
| `MongoDB connection failed` | Make sure `mongod` is running, or double-check your Atlas connection string and that your IP is whitelisted in Atlas |
| `ENCRYPTION_KEY must be exactly 32 characters` | Count the characters in your `.env` value — it must be exactly 32 |
| Frontend shows network errors | Make sure the backend terminal is still running on port 5000 |
| `EADDRINUSE` on port 5000 | Something else is using that port — change `PORT` in `.env` or stop the other process |
