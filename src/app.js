{
  /*require("dotenv").config();
const express = require("express");
const path = require("path");

const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/error.middleware");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

module.exports = app;
*/
}

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/error.middleware");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

// CORS Configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL || "*"
      : "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads folder)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "File Upload API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);

// Swagger Documentation (disabled in production for security)
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📚 Swagger Documentation enabled at /api-docs");
} else {
  // Optional: Enable Swagger in production with auth
  // app.use("/api-docs", authMiddleware, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// 404 Handler - Must be before error handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error Handler - Must be last
app.use(errorHandler);

module.exports = app;
