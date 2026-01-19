import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import budgetsRoutes from "./routes/budgets.js";
import settingsRoutes from "./routes/settings.js";
import transactionsRoutes from "./routes/transactions.routes.js";
import copilotRoutes from "./routes/copilot.js";
import homeRoutes from "./routes/home.routes.js";
import accountRoutes from "./routes/account.routes.js";

const app = express();

/* ======================
   Middleware
====================== */
app.use(
  cors({
    origin: "*", // 🔒 restrict in production
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

/* ======================
   Health check
====================== */
app.get("/", (_, res) => {
  res.status(200).send("API OK");
});

/* ======================
   API Routes
====================== */
app.use("/api/auth", authRoutes);
app.use("/api/budgets", budgetsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/copilot", copilotRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/account", accountRoutes); // ✅ CORRECT PLACE

/* ======================
   404 Handler
====================== */
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

/* ======================
   Global Error Handler
====================== */
app.use((err, req, res, next) => {
  console.error("🔥 API ERROR:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
    }),
  });
});

export default app;
