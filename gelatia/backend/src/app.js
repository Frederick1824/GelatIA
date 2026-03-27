const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const businessRoutes = require("./routes/business.routes");
const branchRoutes = require("./routes/branch.routes");
const branchFlavorRoutes = require("./routes/branchFlavor.routes");
const flavorRoutes = require("./routes/flavor.routes");
const userRoutes = require("./routes/user.routes");
const prisma = require("./config/prisma");
const { authenticateRequest } = require("./middlewares/authMiddleware");
const { authorizeRoles } = require("./middlewares/authorizationMiddleware");
const errorHandler = require("./middlewares/errorHandler");
const { ROLES } = require("./lib/roles");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
  })
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/business", businessRoutes);
app.use("/branch", authenticateRequest, branchRoutes);
app.use("/branch-flavor", authenticateRequest, branchFlavorRoutes);
app.use("/flavor", authenticateRequest, flavorRoutes);
app.use(
  "/users",
  authenticateRequest,
  authorizeRoles(ROLES.OWNER, ROLES.MANAGER),
  userRoutes
);

app.get("/", (req, res) => {
  res.json({
    service: "gelatia-backend",
    status: "ok",
  });
});

app.get("/health", async (req, res) => {
  try {
    await prisma.pool.query("SELECT 1");

    return res.json({
      service: "gelatia-backend",
      status: "ok",
      database: "ok",
    });
  } catch (error) {
    return res.status(500).json({
      service: "gelatia-backend",
      status: "error",
      database: "error",
    });
  }
});

app.use(errorHandler);

module.exports = app;
