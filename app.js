const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Routes
const productRoutes = require("./routes/product");
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const orderRoutes = require("./routes/order");

// Middleware
const errorMiddleware = require("./middlewares/error");

// CORS configuration
app.use(
  cors({
    origin: [
      "https://onlineshoppingfrontend.vercel.app",
      "https://online-shopping-frontend-xi.vercel.app",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// Body & cookie parsing
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", paymentRoutes);

// Error handler (ALWAYS LAST)
app.use(errorMiddleware);

module.exports = app;
