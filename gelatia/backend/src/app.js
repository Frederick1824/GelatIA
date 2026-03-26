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

      return callback(new Error("Origen no permitido por CORS"));
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

app.get("/", async (req, res) => {
  try {
    const flavors = await prisma.branchFlavor.findMany({
      where: {
        branchId: 1,
      },
      include: {
        flavor: true,
      },
    });

    const cards = flavors
      .map((item) => {
        const statusText = item.isActive ? "Disponible" : "Agotado";
        const statusColor = item.isActive ? "#16a34a" : "#dc2626";
        const spoon = item.isActive ? "" : "🥄 ";

        return `
          <div style="
            background:#1f2937;
            border-radius:16px;
            padding:20px;
            box-shadow:0 4px 12px rgba(0,0,0,0.25);
          ">
            <h2 style="margin:0 0 10px 0; font-size:28px;">
              ${spoon}${item.flavor.name}
            </h2>

            <p style="margin:0; font-size:18px;">
              Stock: ${item.stockGrams} g
            </p>

            <p style="margin:10px 0; font-weight:bold; color:${statusColor};">
              ${statusText}
            </p>

            <div style="margin-top:10px;">
              <button
                onclick="updateFlavor(${item.id}, 1000, true)"
                style="
                  margin-right:10px;
                  padding:10px 14px;
                  border:none;
                  border-radius:8px;
                  cursor:pointer;
                  font-weight:bold;
                "
              >
                Reponer
              </button>

              <button
                onclick="updateFlavor(${item.id}, 0, false)"
                style="
                  padding:10px 14px;
                  border:none;
                  border-radius:8px;
                  cursor:pointer;
                  font-weight:bold;
                "
              >
                Agotar
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>GelatIA</title>
      </head>
      <body style="
        margin:0;
        font-family:Arial, sans-serif;
        background:#111827;
        color:white;
        padding:40px;
      ">
        <h1 style="font-size:42px; margin-bottom:30px;">
          GelatIA - Sucursal Centro
        </h1>

        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));
          gap:20px;
        ">
          ${cards}
        </div>

        <script>
          function updateFlavor(id, stockGrams, isActive) {
            fetch("http://localhost:3000/branch-flavor", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ id, stockGrams, isActive })
            })
            .then(() => location.reload())
            .catch((error) => console.error(error));
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al mostrar pantalla");
  }
});

app.use(errorHandler);

module.exports = app;
