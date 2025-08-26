// server/index.js
console.log("🚀 Starting backend...");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();

// ---------- Middleware ----------
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Auth guard: require valid JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const [bearer, token] = authHeader.split(" ");
  if (bearer !== "Bearer" || !token)
    return res.status(401).json({ error: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret123");
    // decoded => { id, role, iat, exp }
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Role guard: restrict by roles
function roleMiddleware(roles = []) {
  return (req, res, next) => {
    if (!req.user?.role) return res.status(401).json({ error: "Unauthorized" });
    if (!Array.isArray(roles) || roles.length === 0) return next();
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

// ---------- Routes ----------

// Health check (for uptime checks / quick connectivity probe)
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Simple root
app.get("/", (_req, res) => {
  res.send("🚀 Backend is running!");
});

// ========== Auth ==========

// Signup (adjust rules as per your assignment)
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    // Basic validations (tune to your rubric)
    if (!name || name.length < 3 || name.length > 60) {
      return res.status(400).json({ error: "Name must be 3–60 characters." });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email." });
    }
    if (address && address.length > 400) {
      return res.status(400).json({ error: "Address max 400 characters." });
    }
    if (
      !password ||
      password.length < 8 ||
      password.length > 16 ||
      !/[A-Z]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        error:
          "Password must be 8–16 chars, include at least one uppercase and one special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        address: address || null,
        passwordHash: hashedPassword,
        role: (role || "USER").toUpperCase(), // ADMIN | OWNER | USER
      },
      select: { id: true, name: true, email: true, address: true, role: true },
    });

    res.json({ message: "User created", user });
  } catch (err) {
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error("Signup error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "supersecret123",
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Update password (any logged-in user)
app.patch("/auth/password", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;

    if (
      !password ||
      password.length < 8 ||
      password.length > 16 ||
      !/[A-Z]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        error:
          "Password must be 8–16 chars, include at least one uppercase and one special character.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: hashed },
    });
    res.json({ message: "Password updated" });
  } catch (e) {
    console.error("Password update error:", e);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ========== Admin ==========

// Dashboard counts
app.get(
  "/admin/dashboard",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  async (_req, res) => {
    try {
      const [usersCount, storesCount, ratingsCount] = await Promise.all([
        prisma.user.count(),
        prisma.store.count(),
        prisma.rating.count(),
      ]);

      res.json({ usersCount, storesCount, ratingsCount });
    } catch (err) {
      console.error("Admin dashboard error:", err);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

// List stores with simple search + avg rating
app.get(
  "/admin/stores",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  async (req, res) => {
    try {
      const q = req.query.q;
      const where = q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { address: { contains: q, mode: "insensitive" } },
            ],
          }
        : {};
      const stores = await prisma.store.findMany({
        where,
        include: { ratings: true },
      });
      const withAvg = stores.map((s) => {
        const avg = s.ratings.length
          ? s.ratings.reduce((a, b) => a + b.value, 0) / s.ratings.length
          : 0;
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          address: s.address,
          rating: Number(avg.toFixed(2)),
        };
      });
      res.json(withAvg);
    } catch (e) {
      console.error("Admin stores error:", e);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

// List users with filters (q + role)
app.get(
  "/admin/users",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  async (req, res) => {
    try {
      const { q, role } = req.query;
      const where = {
        ...(role ? { role: String(role).toUpperCase() } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { address: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const users = await prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, address: true, role: true },
      });
      res.json(users);
    } catch (e) {
      console.error("Admin users error:", e);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

// Get user details (if OWNER, also return owner’s store average)
app.get(
  "/admin/users/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const user = await prisma.user.findUnique({
        where: { id },
        include: { stores: { include: { ratings: true } } },
      });
      if (!user) return res.status(404).json({ error: "Not found" });

      let ownerStoreRating = null;
      if (user.role === "OWNER" && user.stores?.length) {
        const r = user.stores[0].ratings || [];
        ownerStoreRating = r.length
          ? Number((r.reduce((a, b) => a + b.value, 0) / r.length).toFixed(2))
          : 0;
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        ownerStoreRating,
      });
    } catch (e) {
      console.error("Admin user detail error:", e);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

// ========== Owner ==========

// Owner: see their store raters + average
app.get(
  "/owner/store/ratings",
  authMiddleware,
  roleMiddleware(["OWNER"]),
  async (req, res) => {
    try {
      const store = await prisma.store.findFirst({
        where: { ownerUserId: req.user.id },
        include: {
          ratings: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      if (!store) return res.json({ message: "No store linked to this owner" });

      const avg = store.ratings.length
        ? store.ratings.reduce((s, r) => s + r.value, 0) / store.ratings.length
        : 0;

      const raters = store.ratings.map((r) => ({
        userId: r.user.id,
        name: r.user.name,
        email: r.user.email,
        value: r.value,
        createdAt: r.createdAt,
      }));

      res.json({ storeId: store.id, average: Number(avg.toFixed(2)), raters });
    } catch (e) {
      console.error("Owner ratings error:", e);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

// ========== User / Public ==========

// List/search stores with overall rating + current user's rating
app.get("/stores", authMiddleware, async (req, res) => {
  try {
    const q = req.query.q;
    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { address: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};
    const stores = await prisma.store.findMany({
      where,
      include: { ratings: true },
    });

    const me = req.user.id;
    const result = stores.map((s) => {
      const overall = s.ratings.length
        ? s.ratings.reduce((sum, r) => sum + r.value, 0) / s.ratings.length
        : 0;
      const mine = s.ratings.find((r) => r.userId === me)?.value ?? null;
      return {
        id: s.id,
        name: s.name,
        address: s.address,
        overallRating: Number(overall.toFixed(2)),
        myRating: mine,
      };
    });

    res.json(result);
  } catch (e) {
    console.error("Stores list error:", e);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Create/modify rating (1–5)
app.post("/stores/:id/ratings", authMiddleware, async (req, res) => {
  try {
    const storeId = Number(req.params.id);
    const userId = req.user.id;
    const { value } = req.body;

    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res.status(400).json({ error: "Rating must be an integer 1–5" });
    }

    const rating = await prisma.rating.upsert({
      where: { userId_storeId: { userId, storeId } },
      update: { value },
      create: { value, userId, storeId },
    });

    res.json({ message: "Saved", rating });
  } catch (e) {
    console.error("Rating upsert error:", e);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ---------- Start server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
